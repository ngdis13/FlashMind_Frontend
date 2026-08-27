# Перетаскивание блоков в редакторе карточек (Drag-and-Drop)

## Обзор

Редактор карточек FlashMind позволяет собирать содержимое стороны карточки из **независимых блоков** — текстовых, терминологических, с изображениями и викторинами. Пользователь может менять порядок этих блоков простым перетаскиванием (drag-and-drop), что даёт гибкость в компоновке материала без необходимости пересоздавать контент.

Система реализована **двумя разными движками** — под мобильные платформы (iOS/Android) и под веб — но с **единой моделью данных** и **единым стором**, что гарантирует одинаковое поведение на всех платформах.

---

## 1. Модель данных: [`CardBlock`](feature/decks/deck-create-card/types/cardBlocks.ts)

Каждый блок карточки — это дискриминированный юнион ( discriminated union ):

```typescript
type CardBlockType = "term" | "text" | "quiz" | "image";

interface BaseBlock {
  id: string;       // Уникальный идентификатор (генерируется через `${type}_${Date.now()}`)
  position: number; // Порядковый номер в массиве (0, 1, 2...)
}

interface TermBlock extends BaseBlock { type: "term";  value: string }
interface TextBlock extends BaseBlock { type: "text";  value: string }
interface QuizBlock extends BaseBlock { type: "quiz";  variants: string[]; correctIndex: number }
interface ImageBlock extends BaseBlock { type: "image"; url: string }

type CardBlock = TermBlock | TextBlock | QuizBlock | ImageBlock;
```

**Ключевое решение:** `position` — не хранится в БД как отдельное поле, а **вычисляется из порядка в массиве**. При любой мутации (добавление, удаление, перемещение) стора автоматически пересчитывает `position` как индекс в массиве. Это исключает рассинхронизацию индексов.

---

## 2. Управление состоянием: [`useCardStore`](store/card.store.ts)

Все операции с блоками проходят через Zustand-стор [`useCardStore`](store/card.store.ts). Черновик карточки хранится в двух массивах:

```typescript
draftFront: CardBlock[];  // Блоки лицевой стороны
draftBack: CardBlock[];   // Блоки обратной стороны
```

### Ключевые методы стора:

| Метод | Назначение |
|---|---|
| [`addDraftBlock(side, block)`](store/card.store.ts:409) | Добавляет блок в конец массива с `position = blocks.length` |
| [`removeDraftBlock(side, blockId)`](store/card.store.ts:418) | Удаляет блок по `id` и **пересчитывает `position`** у всех оставшихся |
| [`moveDraftBlock(side, blocks)`](store/card.store.ts:441) | Принимает **уже переупорядоченный массив** и пересчитывает `position` |
| [`updateDraftBlockValue(side, blockId, value)`](store/card.store.ts:384) | Обновляет содержимое блока (текст/url) |

**Почему `moveDraftBlock` принимает готовый массив, а не `fromIndex`/`toIndex`?**  
Потому что два разных движка (мобильный и веб) по-разному вычисляют результат перестановки. Мобильный `DraggableFlatList` отдаёт `data` — уже пересортированный массив. Веб-движок сам делает `splice`/`splice`. Вместо того чтобы дублировать логику перестановки в сторе, стор просто **фиксирует результат**, переназначая `position`.

---

## 3. Архитектура рендеринга: [`SideEditor`](feature/decks/deck-create-card/screens/SideEditor.tsx)

Компонент [`SideEditor`](feature/decks/deck-create-card/screens/SideEditor.tsx) — точка входа для редактирования одной стороны карточки. Он определяет платформу и рендерит один из двух вариантов:

```
SideEditor
├── if (Platform.OS === "web")
│   └── <ScrollView> + <Animated.View layout={LinearTransition}>
│       + pointer-based drag-and-drop (немедленная перестановка)
└── else (iOS / Android)
    └── <MobileDraggableList> (DraggableFlatList)
```

Оба варианта используют:
- Одни и те же пропсы: `blocks`, `sideKey`
- Одни и те же колбэки: `onEdit`, `onDelete`, `onMove`
- Один и тот же компонент блока: [`CardBlockItem`](feature/decks/deck-create-card/components/CardBlockItem.tsx)

---

## 4. Мобильная реализация: [`DraggableFlatList`](feature/decks/deck-create-card/screens/SideEditor.tsx:42)

### Библиотека: `react-native-draggable-flatlist`

**Почему выбрана эта библиотека?**
- Нативная поддержка жестов через `react-native-gesture-handler` и `react-native-reanimated`
- Встроенная анимация: `ScaleDecorator` с `activeScale={1.03}` даёт эффект "приподнимания" карточки
- Автоматический скролл при перетаскивании к краям списка
- Оптимизация через `keyExtractor` и `renderItem` с `useCallback`

### Ключевые настройки:

```typescript
<DraggableFlatList
  data={blocks}
  keyExtractor={(item) => item.id}
  onDragBegin={() => setIsDragging(true)}
  onDragEnd={handleDragEnd}
  renderItem={renderItem}
  activationDistance={15}        // Минимальное смещение пальца для активации drag
  keyboardShouldPersistTaps="handled"
  scrollEnabled={!isDragging}    // Блокируем скролл списка во время перетаскивания
/>
```

### Жизненный цикл перетаскивания на мобильных:

1. **LongPress** на `⋮⋮` (6 точек) → [`handleDragActivate`](feature/decks/deck-create-card/components/CardBlockItem.tsx:55)
   - Срабатывает haptic-отклик (`expo-haptics`)
   - Вызывается `drag()` из `DraggableFlatList`
2. **`onDragBegin`** → `setIsDragging(true)` → `scrollEnabled={false}`
3. **Перемещение пальцем** → библиотека сама пересчитывает позиции и анимирует
4. **`onDragEnd`** → получаем `{ data }` — уже переупорядоченный массив → вызываем `moveDraftBlock(sideKey, data)`

### Почему `scrollEnabled={!isDragging}` критично?

Без этого флага, когда пользователь тянет блок вниз, список начинает скроллиться, и блок "уезжает" за пределы экрана. Отключение скролла во время drag — стандартная практика, но в `react-native-draggable-flatlist` её нужно реализовать вручную.

---

## 5. Веб-реализация: Pointer-based drag-and-drop с анимацией Reanimated

### Почему не `react-native-draggable-flatlist` на вебе?

`react-native-draggable-flatlist` завязан на `react-native-gesture-handler`, который на вебе работает через эмуляцию touch-событий. Это даёт:
- Задержки при активации (longPress эмулируется через setTimeout)
- Отсутствие поддержки мыши (нужен отдельный обработчик)
- Проблемы с выделением текста

Поэтому для веба реализован **собственный движок** на нативных Pointer Events + `Animated.View` с `LinearTransition` из `react-native-reanimated`.

### Ключевое отличие от мобильной версии

В мобильной версии блоки анимируются **библиотекой** `DraggableFlatList`. В веб-версии анимацию обеспечивает **`LinearTransition`** из `react-native-reanimated`:

```typescript
import Animated, { LinearTransition } from "react-native-reanimated";

<Animated.View
  key={block.id}
  layout={LinearTransition.duration(250)}
>
  <CardBlockItem ... />
</Animated.View>
```

Свойство `layout` на `Animated.View` говорит Reanimated: **«когда позиция этого элемента в списке меняется — анимируй переход с длительностью 250ms»**. Это даёт плавное расталкивание соседних блоков без единой строки анимационного кода.

### Архитектура веб-движка:

```
Состояние drag:
  draggedIndex: number | null   // Индекс блока, который тащим (текущий, меняется в реальном времени)

Глобальные слушатели (вешаются на window при начале drag):
  pointermove → splice/splice + moveDraftBlock + обновление draggedIndex
  pointerup   → сброс draggedIndex в null
```

**Важное упрощение:** больше нет `dragOverIndex`. В старой версии блоки **не** переставлялись физически во время движения — вместо этого `dragOverIndex` показывал пунктирную рамку, куда вставится блок, а реальная перестановка происходила только на `pointerup`. В новой версии блоки **физически перемещаются в массиве** при каждом `pointermove`, а `LinearTransition` анимирует их сдвиг.

### Как это работает пошагово:

#### Шаг 1: Инициализация drag

Пользователь нажимает на `⋮⋮` в блоке → [`handlePointerDown(index)`](feature/decks/deck-create-card/screens/SideEditor.tsx:216):

```typescript
const handlePointerDown = useCallback((index: number) => {
  setDraggedIndex(index);  // Запоминаем, какой блок тащим
}, []);
```

Никакого `dragOverIndex` — только `draggedIndex`.

#### Шаг 2: Pointer Events на window — немедленная перестановка

[`useEffect`](feature/decks/deck-create-card/screens/SideEditor.tsx:168) активируется, когда `draggedIndex !== null`:

```typescript
useEffect(() => {
  if (!isWeb || draggedIndex === null) return;

  const handlePointerMove = (e: PointerEvent) => {
    e.preventDefault();
    for (let i = 0; i < cardRefs.current.length; i++) {
      const ref = cardRefs.current[i];
      if (ref) {
        const node = ref as unknown as HTMLElement;
        const rect = node.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          if (draggedIndex !== i) {
            // НЕМЕДЛЕННАЯ перестановка в массиве
            const newBlocks = [...blocks];
            const [moved] = newBlocks.splice(draggedIndex, 1);
            newBlocks.splice(i, 0, moved);
            setDraggedIndex(i);
            moveDraftBlock(sideKey, newBlocks);
            // LinearTransition анимирует сдвиг соседних карточек
          }
          break;
        }
      }
    }
  };

  const handlePointerUp = () => {
    setDraggedIndex(null); // Просто сбрасываем — массив уже правильный
  };

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };
}, [draggedIndex, blocks, moveDraftBlock, sideKey]);
```

#### Шаг 3: Визуальная обратная связь

Стиль `draggedCard` теперь содержит только `zIndex`:

```typescript
draggedCard: {
  zIndex: 100,  // Держит перемещаемую карточку поверх остальных
}
```

Визуальную обратную связь (сдвиг соседних карточек) обеспечивает `LinearTransition` — не нужно ни `opacity`, ни `scale`, ни пунктирных рамок.

#### Шаг 4: Завершение

При `pointerup`:
1. Просто сбрасываем `draggedIndex` в `null`
2. Массив уже правильный — `moveDraftBlock` уже был вызван во время `pointermove`
3. `useEffect` автоматически снимает глобальные слушатели

### Почему глобальные слушатели, а не `onPointerMove` на каждом блоке?

Если навесить `onPointerMove` на каждый `<View>` блока, то при быстром движении мыши события могут «теряться» между блоками. Глобальный слушатель на `window` гарантирует, что **каждое движение мыши будет обработано**, независимо от того, над каким элементом находится курсор.

---

## 6. Компонент блока: [`CardBlockItem`](feature/decks/deck-create-card/components/CardBlockItem.tsx)

Этот компонент — универсальная обёртка для любого типа блока. Он отвечает за:

### Drag-хендл (`⋮⋮`)

**Мобильные:** `Pressable` с `onLongPress` (140ms задержка):
```typescript
<Pressable onLongPress={handleDragActivate} delayLongPress={140}>
  <Typography variant="h2" color={colors.white}>⋮⋮</Typography>
</Pressable>
```

**Веб:** `View` с `onPointerDown`:
```typescript
<View onPointerDown={(e) => { e.preventDefault?.(); onPointerDown?.(); }}>
  <Typography variant="h2" color={colors.white}>⋮⋮</Typography>
</View>
```

### Заголовок блока

- Сиреневый фон (`colors.mainColor`)
- Слева: drag-хендл + название типа блока ("Термин", "Текст", "Изображение")
- Справа: кнопки "Редактировать" (карандаш) и "Удалить" (корзина)

### Контентная часть

В зависимости от `item.type` рендерится соответствующий блок:
- [`TermBlock`](feature/decks/deck-create-card/components/blocks/TermBlock.tsx) — для терминов
- [`TextBlock`](feature/decks/deck-create-card/components/blocks/TextBlock.tsx) — для текста
- [`ImageBlock`](feature/decks/deck-create-card/components/blocks/ImageBlock.tsx) — для изображений

### Web-специфичные стили

```typescript
const webCardStyle = Platform.OS === "web" ? {
  userSelect: "none",
  WebkitUserSelect: "none",
  outline: "none",
  cursor: "default",
} : {};
```

Это предотвращает выделение текста при перетаскивании — стандартная проблема веб-DnD.

---

## 7. Сравнение подходов: почему это лучший вариант

### Альтернативы, которые были рассмотрены:

| Подход | Проблемы |
|---|---|
| **HTML5 Drag and Drop API** | Не работает на мобильных; `drag`-изображение не кастомизируется в RN; события `dragover` спамят и тормозят |
| **react-native-draggable-flatlist на вебе** | Завязан на `react-native-gesture-handler`, который на вебе работает через эмуляцию — лаги, нет поддержки мыши |
| **Единый кастомный движок для всех платформ** | Пришлось бы дублировать нативную анимацию и скролл, которые `DraggableFlatList` даёт бесплатно |
| **Перетаскивание через кнопки "вверх"/"вниз"** | Медленно, неинтуитивно, требует лишних нажатий |

### Принятое решение: два движка — одна модель

```
Mobile (iOS/Android)              Web
       │                            │
       ▼                            ▼
DraggableFlatList          Pointer Events (window)
       │                            │
       └──────────┬────────────────┘
                  ▼
          moveDraftBlock(side, blocks)
                  │
                  ▼
           useCardStore (Zustand)
                  │
                  ▼
          Пересчёт position
          и обновление UI
```

**Преимущества:**

1. **Максимальная производительность на каждой платформе**
   - Мобильные: нативные жесты, 60fps анимация, haptic feedback
   - Веб: Pointer Events без сторонних зависимостей, мгновенная реакция

2. **Единая модель данных** — стор не знает, какой движок его вызвал. Это значит:
   - Легко добавить третью платформу (например, Electron)
   - Легко тестировать: можно вызывать `moveDraftBlock` напрямую в тестах
   - Легко отлаживать: Redux DevTools показывают одинаковые мутации

3. **Pointer Events на вебе** — современный стандарт, объединяющий мышь, touch и перо:
   - Один обработчик для всех типов устройств
   - `e.preventDefault()` предотвращает выделение текста
   - `getBoundingClientRect` — точное определение позиции

4. **Минимум зависимостей** — на вебе нет лишних библиотек, только нативные браузерные API

---

## 8. Поток данных при перетаскивании (полный цикл)

```
Пользователь зажимает ⋮⋮
        │
        ▼
  [Mobile] LongPress → drag()     [Web] pointerdown → setDraggedIndex(n)
        │                                    │
        ▼                                    ▼
  setIsDragging(true)                   useEffect активирует
  scrollEnabled={false}                 pointermove/pointerup на window
        │                                    │
        ▼                                    ▼
  Палец двигается →                   Мышь двигается →
  DraggableFlatList пересчитывает      pointermove определяет
  порядок в реальном времени           dragOverIndex через rect
        │                                    │
        ▼                                    ▼
  Палец отпущен →                     Мышь отпущена →
  onDragEnd({ data })                 pointerup: splice/splice
        │                                    │
        └──────────────┬────────────────────┘
                       ▼
            moveDraftBlock(sideKey, newBlocks)
                       │
                       ▼
            useCardStore: пересчёт position
            set({ draftFront: updatedBlocks })
                       │
                       ▼
            React перерендеривает список
            с новым порядком блоков
```

---

## 9. Заключение

Система перетаскивания блоков в FlashMind — это пример **платформо-ориентированной архитектуры**, где:

- **Мобильные пользователи** получают нативный опыт: haptic feedback, плавные анимации, инерционный скролл
- **Веб-пользователи** получают мгновенную реакцию без задержек long-press, привычное поведение мыши
- **Разработчики** получают единую модель данных и предсказуемые мутации стора

Ключевые файлы для дальнейшего изучения:

| Файл | Назначение |
|---|---|
| [`feature/decks/deck-create-card/screens/SideEditor.tsx`](feature/decks/deck-create-card/screens/SideEditor.tsx) | Главный экран с двумя реализациями drag-and-drop |
| [`feature/decks/deck-create-card/components/CardBlockItem.tsx`](feature/decks/deck-create-card/components/CardBlockItem.tsx) | Компонент блока с drag-хендлом |
| [`feature/decks/deck-create-card/types/cardBlocks.ts`](feature/decks/deck-create-card/types/cardBlocks.ts) | Типы блоков карточки |
| [`store/card.store.ts`](store/card.store.ts) | Zustand-стор с методами `moveDraftBlock`, `addDraftBlock`, `removeDraftBlock` |