---
tags:
  - flashmind
  - editor
  - color-picker
  - palette
created: 2026-08-28
up: "[[00 Home]]"
---

# 🎨 17 — Палитра цвета текста (ColorPaletteText)

> [!abstract] О чём эта заметка
> Полнофункциональный Color Picker для окрашивания текста в редакторе карточек — аналог палитры из [Lexical Playground](https://playground.lexical.dev/). Компонент [`ColorPaletteText`](feature/decks/deck-create-card/components/ColorPaletteText.tsx) предоставляет 4 блока управления цветом: ручной HEX-ввод, пресеты, градиентное поле насыщенности/яркости и радужный ползунок тона. Работает кросс-платформенно (React Native / Expo Web).

---

## 📦 Где используется

| Файл | Контекст |
|---|---|
| [`LexicalToolbar.tsx`](feature/decks/deck-create-card/components/LexicalToolbar.tsx) | Тулбар Lexical-редактора (кнопка с кистью 🎨) |
| [`CustomRichToolbar.tsx`](feature/decks/deck-create-card/components/CustomRichToolbar.tsx) | Кастомный rich-тулбар (кнопка с карандашом ✏️) |

Оба тулбара открывают [`ColorPaletteText`](feature/decks/deck-create-card/components/ColorPaletteText.tsx) как модальное окно (React Native `<Modal>`) и получают выбранный цвет через колбэк `onSelectColor(hexColor: string)`.

> [!note] Старая палитра `ColorPalette`
> Компонент [`ColorPalette`](feature/decks/components/colorPalette.tsx) (18 цветов, 3×6) **не тронут** и продолжает использоваться для выбора цвета колоды в `CreateDecksScreen` и `SettingsDeck`. Это два независимых компонента с разным назначением.

---

## 🧱 Архитектура: 4 блока

Компонент состоит из 4 изолированных логических блоков, расположенных вертикально:

```
┌─────────────────────────────────────┐
│ 1. HEX-ввод                         │
│    Hex  [  #FF0000             ]    │
├─────────────────────────────────────┤
│ 2. Пресеты (2 ряда)                 │
│    🔴🟠🟡🟤🟢🟢🟣🟣               │
│    🔵🩵🟢⚫️⬜️⬜️⬜️               │
├─────────────────────────────────────┤
│ 3. Saturation / Lightness Canvas    │
│    ┌─────────────────────────┐      │
│    │  градиент: белый → тон  │      │
│    │        ↓ чёрный         │      │
│    │           ●              │      │
│    └─────────────────────────┘      │
├─────────────────────────────────────┤
│ 4. Hue Slider + Preview             │
│    ██████████████████████████        │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (preview)
│    [       Применить цвет       ]   │
└─────────────────────────────────────┘
```

---

### Блок 1: HEX-ввод

```typescript
<TextInput
  value={hexInput}
  onChangeText={handleHexChange}
  maxLength={7}
/>
```

- **Auto-префикс `#`:** если пользователь вводит `FF0000`, поле автоматически превращает в `#FF0000`
- **Валидация:** принимает только 3- или 6-значные HEX-коды (`/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/`)
- **Синхронизация:** при валидном вводе обновляет HSV-состояние и все остальные блоки

---

### Блок 2: Пресеты

Два горизонтальных ряда фиксированных цветов (как в Lexical Playground):

```typescript
const PRESET_ROW1 = [
  "#FF0000", "#FF8800", "#FFDD00", "#8B4513",
  "#88DD00", "#00CC00", "#8800CC", "#FF00FF",
];
const PRESET_ROW2 = [
  "#0000FF", "#00CCCC", "#AAFFAA", "#000000",
  "#555555", "#AAAAAA", "#FFFFFF",
];
```

- **Индикация выбора:** выбранный цвет подсвечивается обводкой `#5F69D9` (фирменный цвет FlashMind)
- **Чёрный пресет** (`#000000`) обводится **белой** рамкой, чтобы быть видимым
- **Белый пресет** (`#FFFFFF`) имеет серую границу для видимости на светлом фоне

---

### Блок 3: Saturation/Lightness Canvas

Полноразмерное SVG-поле 160px высотой для выбора насыщенности и яркости:

```
Горизонталь (X): Насыщенность (Saturation)
  слева  = белый (#FFFFFF)
  справа = чистый тон (hue, S=1, V=1)

Вертикаль (Y): Яркость (Value)
  сверху = прозрачный (без затемнения)
  снизу  = чёрный (#000000)
```

**Реализация:** два SVG `<LinearGradient>` наложены друг на друга:
1. `satGrad` — горизонтальный: `#FFFFFF → hueColor`
2. `valGrad` — вертикальный: `rgba(0,0,0,0) → #000000`

**Маркер:** круг `<Circle>` радиусом 9px, залитый текущим цветом, с контрастной обводкой (белая для тёмных цветов, тёмная для светлых).

---

### Блок 4: Hue Slider + Preview

**Hue Slider** — горизонтальный радужный спектр 24px высотой:

```
Красный → Жёлтый → Зелёный → Голубой → Синий → Фиолетовый → Красный
```

7 стопов `<LinearGradient>` с шагом ~17%. Маркер — круг радиусом 9px с белой обводкой.

**Preview Bar** — полоса 32px высотой, залитая финальным цветом. Показывает результат перед применением.

---

## 🔄 Взаимодействие (Pointer Events)

### Как работает перетаскивание

```typescript
// Canvas: pointerdown → захват + чтение позиции
const handleCanvasPointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  isDraggingCanvas.current = true;
  updateCanvasFromClient(e.clientX, e.clientY);
};

// Глобальные слушатели на window (для отслеживания движения вне элемента)
useEffect(() => {
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  return () => { /* cleanup */ };
}, []);
```

**Почему глобальные слушатели, а не `onPointerMove` на элементе?**
Если мышь/палец выходит за границы canvas/hue-бара, локальные события перестают срабатывать. Глобальный `pointermove` на `window` гарантирует непрерывное отслеживание.

### Почему не PanResponder?

Первая версия использовала `PanResponder.create()` в `useRef`. Проблема: `PanResponder` создаётся **один раз** и захватывает замыкания с начальными значениями `canvasLayout`, `hue`, `saturation`, `value` (все равны 0). Маркер не двигался, потому что обработчики «видели» только нулевые координаты.

**Решение:** refs + прямые обработчики:
- `canvasLayoutRef` / `hueBarLayoutRef` — мутабельные, обновляются через `getBoundingClientRect()` напрямую
- `hueRef` / `saturationRef` / `valueRef` — синхронизируются каждый рендер (`ref.current = state`)
- `isDraggingCanvas` / `isDraggingHue` — флаги активного перетаскивания

### Измерение позиций (Measure)

На вебе вместо RN-метода `measure()` (который работает нестабильно) используется нативный `getBoundingClientRect()`:

```typescript
const el = document.getElementById("color-canvas");
if (el) {
  const r = el.getBoundingClientRect();
  canvasLayoutRef.current = { x: r.left, y: r.top, width: r.width, height: r.height };
}
```

Элементам присвоены HTML-атрибуты `id="color-canvas"` и `id="color-huebar"` для прямого доступа.

---

## 🧮 Цветовая математика: HSV ↔ RGB ↔ HEX

Все конвертеры написаны вручную (без зависимостей), чтобы избежать лишних npm-пакетов:

| Функция | Назначение |
|---|---|
| `hexToRgb(hex)` | `#FF0000` → `[255, 0, 0]` |
| `rgbToHex(r, g, b)` | `[255, 0, 0]` → `#FF0000` |
| `rgbToHsv(r, g, b)` | RGB → HSV (Hue 0-360°, Saturation 0-1, Value 0-1) |
| `hsvToRgb(h, s, v)` | HSV → RGB |
| `hsvToHex(h, s, v)` | HSV → HEX (композиция hsvToRgb + rgbToHex) |
| `hexToHsv(hex)` | HEX → HSV (композиция hexToRgb + rgbToHsv) |

**Почему HSV, а не HSL?**
HSV (Hue-Saturation-Value) даёт более интуитивное управление: `Value=1` — чистый цвет, `Value=0` — чёрный. В HSL `Lightness=0.5` — чистый цвет, что менее удобно для градиентного поля «насыщенность/яркость».

---

## 📋 Props

```typescript
interface ColorPaletteTextProps {
  onCancel: () => void;           // Закрытие модалки без применения
  onSelectColor: (color: string) => void;  // Выбранный цвет в формате #HEX
  title?: string;                 // Заголовок (по умолчанию "Выберите цвет текста")
}
```

---

## 🔌 Подключение в тулбаре (пример)

```typescript
const [isPaletteVisible, setIsPaletteVisible] = useState(false);
const [selectedColor, setSelectedColor] = useState("#FF8E9E");

// Кнопка открытия
<TouchableOpacity onPress={() => setIsPaletteVisible(true)}>
  <FontAwesomeIcon icon={faPalette} size={16} />
</TouchableOpacity>

// Модалка
{isPaletteVisible && (
  <ColorPaletteText
    title="Выберите цвет текста"
    onCancel={() => setIsPaletteVisible(false)}
    onSelectColor={(color: string) => {
      setSelectedColor(color);
      onAction("SET_COLOR", color);  // Отправка в Lexical
    }}
  />
)}
```

---

## 🎯 Связанные файлы

| Файл | Назначение |
|---|---|
| [`ColorPaletteText.tsx`](feature/decks/deck-create-card/components/ColorPaletteText.tsx) | Сам компонент (640 строк) |
| [`LexicalToolbar.tsx`](feature/decks/deck-create-card/components/LexicalToolbar.tsx) | Тулбар редактора (использует палитру) |
| [`CustomRichToolbar.tsx`](feature/decks/deck-create-card/components/CustomRichToolbar.tsx) | Кастомный тулбар (использует палитру) |
| [`colorPalette.tsx`](feature/decks/components/colorPalette.tsx) | Старая палитра (для колод, не для текста) |
| [`09 Редактор карточек.md`](docs/FlashMind%20Vault/09%20Редактор%20карточек.md) | Документация по редактору |
| [`LexicalEditor.md`](docs/LexicalEditor.md) | Полное руководство по Lexical |

---

## ⚙️ Зависимости

- **`react-native-svg`** (v15.12.1) — для градиентов и маркеров
- **`react-native-reanimated`** — не используется в этом компоненте (только `react-native-svg`)
- Внешних npm-пакетов для цвета **нет** — вся математика написана вручную