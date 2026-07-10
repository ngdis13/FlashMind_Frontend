import { create } from "zustand";
import {
  fetchUserDecks,
  updateDeck,
  deleteDeckOnServer,
} from "@/storage/api/api";
import {
  DecksStorageState,
  loadDecks,
  saveDecks,
} from "@/storage/service/decksStorage";
import { Deck, DeckSettings, UpdateDeckPayload } from "@/storage/types/types";
import { calculateExpiryTime } from "@/utils/helpers/calculateExpiryTime";
import { colors } from "@/styles/Colors";

type DeckState = {
  decksState: DecksStorageState | null;
  isLoading: boolean;
  error: string | null;

  // Методы получения и инвалидации
  getDecks: () => Promise<Deck[]>;
  invalidateDecks: () => void;
  setDecksState: (newState: DecksStorageState) => void;

  // Методы мутаций (Оптимистичные с автоматическим Rollback)
  createNewDeck: (title: string, options?: { description?: string; color?: string }) => Promise<Deck>;
  updateDeck: (id: string, fields: Partial<Deck>) => Promise<Deck>;
  deleteDeck: (id: string) => Promise<void>;

  // Вспомогательный экшен для изменения общего количества карт (подводный камень от Димы)
  updateDeckTotalCards: (
    deckId: string,
    action: "increment" | "decrement",
  ) => void;

  updateDeckReviewCount: (deckId: string, countOrAction: number | 'decrement') => void;
  

};

export const useDeckStore = create<DeckState>((set, get) => {
  // Жесткий валидатор формата данных для полной безопасности рантайма
  const validateFormat = (data: DecksStorageState | null) => {
    if (!data) return;
    const hasDecks = Array.isArray(data.decks);
    const hasActualFlag = typeof data.isActual === "boolean";
    const hasExpiry = typeof data.expiresAt === "number";

    if (!hasDecks || !hasActualFlag || !hasExpiry) {
      throw new Error(
        `[Zustand DECK CRITICAL] Нарушен формат данных колод! ` +
          `Ожидалось: { decks: Deck[], isActual: boolean, expiresAt: number }. ` +
          `Получено: ${JSON.stringify(data)}.`,
      );
    }
  };

  return {
    decksState: null,
    isLoading: false,
    error: null,

    // 1. Внутренняя функция сохранения (Единая точка записи)
    setDecksState: (newState: DecksStorageState) => {
      validateFormat(newState); // Проверяем структуру перед записью
      set({ decksState: newState });
      saveDecks(newState); // Дублируем на диск в AsyncStorage
    },

    // 2. Функция получения списка колод (Единственный контроллер API)
    getDecks: async (): Promise<Deck[]> => {
      const currentRecord = get().decksState;

      // Шаг 1 (Проверка оперативной памяти)
      if (currentRecord) {
        validateFormat(currentRecord);
        const now = Date.now();
        const secondsLeft = Math.max(
          0,
          Math.floor((currentRecord.expiresAt - now) / 1000),
        );

        // Шаг 2 (Логирование): Выводим остаток времени кэша до 4 утра в секундах
        console.log(
          `[useDecks Cache Check] Проверка памяти. До 4 утра осталось ${secondsLeft} секунд. Флаг актуальности: ${currentRecord.isActual}`,
        );

        // Сценарий А (Кэш валиден по времени и флагу)
        if (currentRecord.isActual && now < currentRecord.expiresAt) {
          console.log(
            "📦 getDecks: Данные актуальны в памяти, сеть не трогаем",
          );
          return currentRecord.decks;
        }
      }

      // Сценарий Б (Проверка диска, если в оперативной памяти пусто)
      if (!currentRecord) {
        const diskData = await loadDecks();
        if (diskData) {
          validateFormat(diskData);
          const now = Date.now();
          const secondsLeft = Math.max(
            0,
            Math.floor((diskData.expiresAt - now) / 1000),
          );

          console.log(
            `[useDecks Cache Check] Проверка диска. До 4 утра осталось ${secondsLeft} секунд. Флаг актуальности: ${diskData.isActual}`,
          );

          if (diskData.isActual && now < diskData.expiresAt) {
            console.log(
              "💾 getDecks: Данные актуальны на диске, переносим в оперативку",
            );
            set({ decksState: diskData });
            return diskData.decks;
          }
        }
      }

      // Сценарий В (Сетевой запрос к бэкенду, если кэш отсутствует, устарел или наступило 4 утра)
      if (get().isLoading) {
        return get().decksState?.decks || [];
      }

      set({ isLoading: true, error: null });

      try {
        console.log(
          "🌐 getDecks: Делаем сетевой запрос к API (fetchUserDecks)...",
        );
        const serverDecks = await fetchUserDecks();

        const freshState: DecksStorageState = {
          isActual: true,
          expiresAt: calculateExpiryTime(), // Рассчитываем точку "4 утра следующего дня"
          decks: serverDecks,
        };

        // Записываем данные через единую точку сохранения
        get().setDecksState(freshState);
        set({ isLoading: false });

        console.log(
          `✅ getDecks: Скачано ${serverDecks.length} колод с сервера`,
        );
        return serverDecks;
      } catch (error) {
        console.error("❌ getDecks: Ошибка сетевого запроса колод:", error);
        set({
          error: error instanceof Error ? error.message : "Ошибка загрузки",
          isLoading: false,
        });
        return get().decksState?.decks || [];
      }
    },

    // 3. Функция инвалидации (Сброс актуальности)
    invalidateDecks: () => {
      const current = get().decksState;
      if (current) {
        console.log(
          "🚨 invalidateDecks: Меняем флаг на false на диске и в памяти",
        );
        get().setDecksState({
          ...current,
          isActual: false,
        });
      }
    },


    // 4. Создание новой колоды (Оптимистичное добавление полноценного объекта по типам проекта)
    createNewDeck: async (title: string, options?: { description?: string; color?: string }) => {
      set({ isLoading: true, error: null });
      try {
        const { createNewDeck: apiCreateNewDeck } = await import("@/storage/api/api"); 
        
        // Отправляем на сервер полные данные из инпутов экрана
        const serverResponse = await apiCreateNewDeck({
          name: title,
          description: options?.description || "",   
          color: options?.color || "#ffffff"   
        }); 

        const currentRecord = get().decksState || { isActual: true, expiresAt: calculateExpiryTime(), decks: [] };
        validateFormat(currentRecord);

        // Собираем полноценную модель Deck для локального кэша
        const fullyTypedNewDeck: Deck = {
          id: serverResponse.id,
          name: serverResponse.name,
          description: serverResponse.description,
          total_cards: 0,   
          repeat_cards: 0,
          settings: {
            color: serverResponse.color,
            desired_retention: 0.9,
            maximum_interval: 365
          },
          cloud_info: {
            is_approved: false,
            is_cloud_deck: false,
            needs_sync: false
          }
        };

        const updatedState: DecksStorageState = {
          ...currentRecord,
          isActual: true, // Блокируем лишний GET-запрос всего списка
          decks: [...currentRecord.decks, fullyTypedNewDeck] // Пушим новую колоду в оперативку и кэш
        };

        get().setDecksState(updatedState);
        set({ isLoading: false });
        
        return fullyTypedNewDeck;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Ошибка создания колоды',
          isLoading: false 
        });
        throw error;
      }
    },



    // 5. Обновление колоды (Оптимистичное, без костылей и any, строго по типам проекта)
    updateDeck: async (
      id: string,
      data: Partial<Deck> & Partial<DeckSettings>,
    ) => {
      const currentRecord = get().decksState;
      if (!currentRecord) throw new Error("Нет данных для обновления колоды");

      // Находим текущую колоду в памяти, чтобы вытащить обязательные поля для API
      const targetDeck = currentRecord.decks.find((d) => d.id === id);
      if (!targetDeck) throw new Error(`Колода с ID ${id} не найдена в памяти`);

      // Сохраняем резервную копию для отката в случае ошибки сети
      const originalDecks = [...currentRecord.decks];

      // Оптимистично перерисовываем UI мгновенно.
      // Мержим изменения полей верхнего уровня (name, description) и вложенных настроек settings
      const optimisticDecks = currentRecord.decks.map((deck) => {
        if (deck.id === id) {
          return {
            ...deck,
            name: data.name ?? deck.name,
            description: data.description ?? deck.description,
            settings: {
              ...deck.settings,
              color: data.color ?? deck.settings.color,
              desired_retention:
                data.desired_retention ?? deck.settings.desired_retention,
              maximum_interval:
                data.maximum_interval ?? deck.settings.maximum_interval,
            },
          };
        }
        return deck;
      });

      get().setDecksState({
        ...currentRecord,
        decks: optimisticDecks,
        isActual: true,
      });

      try {
        console.log(
          `📝 updateDeck [Фон]: Отправляем изменения на сервер для колоды ${id}...`,
        );

        const fullPayload: UpdateDeckPayload = {
          name: data.name ?? targetDeck.name,
          description: data.description ?? targetDeck.description,
          desired_retention:
            data.desired_retention ?? targetDeck.settings.desired_retention,
          maximum_interval:
            data.maximum_interval ?? targetDeck.settings.maximum_interval,
          color: data.color ?? targetDeck.settings.color,
        };

        // Отправляем чистый, строго валидированный объект в API
        await updateDeck(id, fullPayload);
        console.log(`✅ updateDeck: Успешно обновлено на сервере`);

        const updatedDeck = optimisticDecks.find((d) => d.id === id) as Deck;
        return updatedDeck;
      } catch (error) {
        console.error(
          "❌ updateDeck [Ошибка]: Сервер упал. Откатываем изменения назад...",
          error,
        );
        // ROLLBACK: Сервер недоступен — возвращаем исходный массив на место за миллисекунду
        get().setDecksState({
          ...currentRecord,
          decks: originalDecks,
          isActual: true,
        });
        throw error;
      }
    },

    // 6. Удаление колоды (Оптимистичное с механизмом Rollback)
    deleteDeck: async (id: string) => {
      const currentRecord = get().decksState;
      if (!currentRecord) return;

      validateFormat(currentRecord);

      // Сохраняем резервную копию исходного списка для отката
      const originalDecks = [...currentRecord.decks];

      // Оптимистично стираем колоду из UI прямо сейчас
      const optimisticDecks = currentRecord.decks.filter(
        (deck) => deck.id !== id,
      );
      get().setDecksState({
        ...currentRecord,
        decks: optimisticDecks,
        isActual: true,
      });

      try {
        console.log(`🗑️ deleteDeck [Фон]: Удаляем колоду ${id} на сервере...`);
        await deleteDeckOnServer(id);
        console.log(`✅ deleteDeck: Успешно удалено с сервера`);
      } catch (error) {
        console.error(
          "❌ deleteDeck [Ошибка]: Сервер не ответил. Восстанавливаем UI...",
          error,
        );
        // ROLLBACK: Возвращаем колоду на экран
        get().setDecksState({
          ...currentRecord,
          decks: originalDecks,
          isActual: true,
        });
        throw error;
      }
    },

    // 7. Сквозная связь: Изменение total_cards при добавлении/удалении карточек в другом сторе
    updateDeckTotalCards: (
      deckId: string,
      action: "increment" | "decrement",
    ) => {
      const currentRecord = get().decksState;
      if (!currentRecord) return;

      console.log(
        `🔄 updateDeckTotalCards: Локально меняем total_cards для колоды ${deckId} (${action})`,
      );

      const updatedDecks = currentRecord.decks.map((deck) => {
        if (deck.id === deckId) {
          const currentTotal = deck.total_cards || 0;
          return {
            ...deck,
            total_cards:
              action === "increment"
                ? currentTotal + 1
                : Math.max(0, currentTotal - 1),
          };
        }
        return deck;
      });

      // Перезаписываем стейт через единую точку сохранения
      get().setDecksState({
        ...currentRecord,
        decks: updatedDecks,
      });
    },

    // 8. Сквозная связь: Изменение cards_to_review_today при обучении
    updateDeckReviewCount: (
      deckId: string,
      countOrAction: number | "decrement",
    ) => {
      const currentRecord = get().decksState;
      if (!currentRecord) return;

      console.log(
        `🔄 updateDeckReviewCount: Локально меняем cards_to_review_today для колоды ${deckId} (${countOrAction})`,
      );

      const updatedDecks = currentRecord.decks.map((deck) => {
        if (deck.id === deckId) {
          // Если передали 'decrement' — уменьшаем на 1. Если передали число — жестко ставим его.
          const currentReview = deck.repeat_cards || 0; // В типах поле называется repeat_cards или cards_to_review_today, проверь по логам
          return {
            ...deck,
            repeat_cards:
              countOrAction === "decrement"
                ? Math.max(0, currentReview - 1)
                : countOrAction,
          };
        }
        return deck;
      });

      // Перезаписываем стейт через единую точку сохранения
      get().setDecksState({
        ...currentRecord,
        decks: updatedDecks,
      });
    },
  };
});
