// hooks/useDecks.ts
import { useCallback, useEffect, useRef } from "react";
import { useDeckStore } from "@/store/deck.store";
import { useCardStore } from "@/store/card.store";
import { Deck, Card } from "../types/types";
import { fetchCardById } from "../api/api";

/**
 * Хук для управления колодами и карточками
 * 
 * @description
 * Предоставляет единый интерфейс для работы с колодами и карточками,
 * используя кэширование и оптимизированные запросы к API.
 * 
 * @example
 * ```tsx
 * const { decks, loading, loadDecksData, addCard } = useDecks();
 * 
 * useEffect(() => {
 *   loadDecksData();
 * }, []);
 * ```
 * 
 * @returns {Object} Объект с данными и методами для работы с колодами
 */
export const useDecks = () => {
  // ============================================
  // Подключаем сторы
  // ============================================
  const deckStore = useDeckStore();
  const cardStore = useCardStore();

  // ============================================
  // 1. ГЕТТЕРЫ - ТОТ ЖЕ API, ЧТО И РАНЬШЕ
  // ============================================
  
  /**
   * Список колод пользователя
   * @type {Deck[]}
   */
  const decks = deckStore.decks;

  /**
   * Флаг загрузки колод
   * @type {boolean}
   */
  const loading = deckStore.isLoading;

  /**
   * Сообщение об ошибке при загрузке
   * @type {string | null}
   */
  const error = deckStore.error;

  /**
   * Флаг загрузки карточек (по deckId)
   * @type {Record<string, boolean>}
   */
  const loadingCards = cardStore.isLoading;

  /**
   * Флаг для отслеживания первой загрузки
   * @type {React.MutableRefObject<boolean>}
   */
  const isFirstLoadRef = useRef(true);

  // ============================================
  // 2. МЕТОДЫ ЗАГРУЗКИ - с защитой от дублей
  // ============================================
  
  /**
   * Загружает список колод с кэшированием
   * 
   * @description
   * Проверяет наличие данных в кэше перед запросом к серверу.
   * Если данные уже есть - использует их, иначе делает запрос.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * ```tsx
   * await loadDecksData();
   * console.log('Колоды загружены');
   * ```
   */
  const loadDecksData = useCallback(async () => {
    console.log('🔄 loadDecksData вызван');
    await deckStore.fetchDecks();
  }, [deckStore.fetchDecks]);

  /**
   * Принудительно обновляет список колод с сервера
   * 
   * @description
   * Игнорирует кэш и загружает свежие данные с сервера.
   * Используется для pull-to-refresh или после CRUD операций.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * ```tsx
   * // При pull-to-refresh
   * <RefreshControl onRefresh={refreshDecks} />
   * ```
   */
  const refreshDecks = useCallback(async () => {
    console.log('🔄 refreshDecks вызван');
    await deckStore.fetchDecks(true);
  }, [deckStore.fetchDecks]);

  /**
   * Получает колоду по ID из кэша
   * 
   * @description
   * Возвращает колоду из локального состояния без запроса к серверу.
   * 
   * @param {string} deckId - ID колоды
   * @returns {Deck | undefined} Найденная колода или undefined
   * 
   * @example
   * ```tsx
   * const deck = getDeckById('123');
   * if (deck) {
   *   console.log(deck.name);
   * }
   * ```
   */
  const getDeckById = useCallback((deckId: string) => {
    return deckStore.getDeckById(deckId);
  }, [deckStore.getDeckById]);

  // ============================================
  // 3. CRUD КОЛОДЫ
  // ============================================
  
  /**
   * Обновляет поля колоды
   * 
   * @description
   * Отправляет PUT запрос на сервер и обновляет данные локально.
   * Использует локальную мутацию для мгновенного обновления UI.
   * 
   * @async
   * @param {string} deckId - ID колоды
   * @param {Partial<Deck>} fields - Объект с полями для обновления
   * @returns {Promise<void>}
   * 
   * @throws {Error} При ошибке обновления на сервере
   * 
   * @example
   * ```tsx
   * await updateDeckFields('123', {
   *   name: 'Новое название',
   *   description: 'Новое описание'
   * });
   * ```
   */
  const updateDeckFields = useCallback(async (deckId: string, fields: Partial<Deck>) => {
    console.log(`📝 updateDeckFields: ${deckId}`);
    await deckStore.updateDeck(deckId, fields);
  }, [deckStore.updateDeck]);

  /**
   * Удаляет колоду
   * 
   * @description
   * Отправляет DELETE запрос на сервер и удаляет колоду локально.
   * Обновляет кэш и UI мгновенно.
   * 
   * @async
   * @param {string} deckId - ID колоды для удаления
   * @returns {Promise<void>}
   * 
   * @throws {Error} При ошибке удаления на сервере
   * 
   * @example
   * ```tsx
   * await deleteDeck('123');
   * console.log('Колода удалена');
   * ```
   */
  const deleteDeck = useCallback(async (deckId: string) => {
    console.log(`🗑️ deleteDeck: ${deckId}`);
    await deckStore.deleteDeck(deckId);
  }, [deckStore.deleteDeck]);

  // ============================================
  // 4. КАРТОЧКИ - с проверкой наличия в кэше
  // ============================================
  
  /**
   * Получает карточки колоды с кэшированием
   * 
   * @description
   * Сначала проверяет наличие карточек в кэше.
   * Если есть - возвращает мгновенно.
   * Если нет - загружает с сервера и сохраняет в кэш.
   * 
   * @async
   * @param {string} deckId - ID колоды
   * @returns {Promise<Card[]>} Массив карточек колоды
   * 
   * @example
   * ```tsx
   * const cards = await getDeckCards('123');
   * console.log(`Загружено ${cards.length} карточек`);
   * ```
   */
  const getDeckCards = useCallback(async (deckId: string): Promise<Card[]> => {
    console.log(`🃏 getDeckCards: ${deckId}`);
    
    // ✅ Проверяем, есть ли карточки в кэше
    const cachedCards = cardStore.getCards(deckId);
    if (cachedCards.length > 0) {
      console.log(`📦 Использую кэш карточек (${cachedCards.length} шт.)`);
      return cachedCards;
    }
    
    // Если нет - загружаем
    await cardStore.fetchCards(deckId);
    return cardStore.getCards(deckId);
  }, [cardStore.fetchCards, cardStore.getCards]);

  /**
   * Создает новую карточку в колоде
   * 
   * @description
   * Отправляет POST запрос на сервер и добавляет карточку локально.
   * Обновляет кэш и UI мгновенно без дополнительных GET запросов.
   * 
   * @async
   * @param {string} deckId - ID колоды
   * @param {string} front - Текст на лицевой стороне
   * @param {string} back - Текст на обратной стороне
   * @returns {Promise<Card>} Созданная карточка
   * 
   * @throws {Error} При ошибке создания на сервере
   * 
   * @example
   * ```tsx
   * const newCard = await addCard('123', 'Вопрос', 'Ответ');
   * console.log(`Создана карточка: ${newCard.id}`);
   * ```
   */
  const addCard = useCallback(async (deckId: string, front: string, back: string) => {
    console.log(`➕ addCard: ${deckId}`);
    const newCard = await cardStore.createCard({ deck_id: deckId, front, back });
    return newCard;
  }, [cardStore.createCard]);

  /**
   * Удаляет карточку из колоды
   * 
   * @description
   * Отправляет DELETE запрос на сервер и удаляет карточку локально.
   * Обновляет кэш и UI мгновенно без дополнительных GET запросов.
   * 
   * @async
   * @param {string} deckId - ID колоды
   * @param {string} cardId - ID карточки для удаления
   * @returns {Promise<void>}
   * 
   * @throws {Error} При ошибке удаления на сервере
   * 
   * @example
   * ```tsx
   * await removeCard('123', '456');
   * console.log('Карточка удалена');
   * ```
   */
  const removeCard = useCallback(async (deckId: string, cardId: string) => {
    console.log(`➖ removeCard: ${cardId}`);
    await cardStore.deleteCard(cardId, deckId);
  }, [cardStore.deleteCard]);

  /**
   * Обновляет существующую карточку
   * 
   * @description
   * Отправляет PUT запрос на сервер и обновляет карточку локально.
   * 
   * @async
   * @param {string} cardId - ID карточки
   * @param {string} front - Новый текст на лицевой стороне
   * @param {string} back - Новый текст на обратной стороне
   * @returns {Promise<Card>} Обновленная карточка
   * 
   * @throws {Error} При ошибке обновления на сервере
   * 
   * @example
   * ```tsx
   * const updated = await updateCard('456', 'Новый вопрос', 'Новый ответ');
   * console.log('Карточка обновлена');
   * ```
   */
  const updateCard = useCallback(async (cardId: string, front: string, back: string) => {
    console.log(`📝 updateCard: ${cardId}`);
    const updated = await cardStore.updateCard(cardId, { front, back });
    return updated;
  }, [cardStore.updateCard]);

// hooks/useDecks.ts - обнови getCardById

/**
 * Получает карточку по ID с кэшированием
 * 
 * @description
 * Сначала ищет карточку во всех кэшированных карточках.
 * Если не находит или нет back - загружает полную версию с сервера.
 * 
 * @async
 * @param {string} cardId - ID карточки
 * @returns {Promise<Card | null>} Найденная карточка или null
 */
const getCardById = useCallback(async (cardId: string) => {
  console.log(`🔍 getCardById: ${cardId}`);
  // ✅ Используем новый метод из cardStore
  return await cardStore.getCardById(cardId);
}, [cardStore]); // ← Добавляем cardStore в зависимости

  // ============================================
  // 5. ОБЛАЧНЫЕ КОЛОДЫ - с кэшированием результата
  // ============================================
  
  /**
   * Делает колоду публичной (облачной)
   * 
   * @description
   * Отправляет запрос на публикацию колоды.
   * Проверяет, не опубликована ли колода уже.
   * Обновляет локальные данные после публикации.
   * 
   * @async
   * @param {string} deckId - ID колоды
   * @returns {Promise<CloudDeckShareResponse>} Ответ сервера с cloud_uuid
   * 
   * @throws {Error} При ошибке публикации
   * 
   * @example
   * ```tsx
   * const result = await makeDeckPublic('123');
   * console.log(`Колода опубликована: ${result.cloud_uuid}`);
   * ```
   */
  const makeDeckPublic = useCallback(async (deckId: string) => {
    console.log(`☁️ makeDeckPublic: ${deckId}`);
    
    // ✅ Проверяем, есть ли уже cloud_deck_id
    const deck = deckStore.getDeckById(deckId);
    if (deck?.cloud_info?.cloud_deck_id) {
      console.log(`📦 Использую существующий cloud_deck_id: ${deck.cloud_info.cloud_deck_id}`);
      return {
        cloud_uuid: deck.cloud_info.cloud_deck_id,
        status: 'EXISTING',
        message: 'Колода уже опубликована'
      };
    }
    
    const { makeDeckPublicApi } = await import('../api/api');
    const result = await makeDeckPublicApi(deckId);
    
    // ✅ Обновляем локальные данные
    await deckStore.fetchDecks(true);
    
    return result;
  }, [deckStore]);

  /**
   * Импортирует облачную колоду
   * 
   * @description
   * Импортирует колоду по cloud_uuid.
   * Обновляет локальный список колод после импорта.
   * 
   * @async
   * @param {string} cloudUuid - UUID облачной колоды
   * @returns {Promise<CloudDeckImportResponse>} Результат импорта
   * 
   * @throws {Error} При ошибке импорта
   * 
   * @example
   * ```tsx
   * const result = await importDeck('abc-123');
   * console.log(`Импортировано ${result.added} карточек`);
   * ```
   */
  const importDeck = useCallback(async (cloudUuid: string) => {
    console.log(`☁️ importDeck: ${cloudUuid}`);
    const { importDeckApi } = await import('../api/api');
    const result = await importDeckApi(cloudUuid);
    
    // ✅ Обновляем список колод после импорта
    await deckStore.fetchDecks(true);
    
    return result;
  }, [deckStore]);

  // ============================================
  // 6. АВТОЗАГРУЗКА - только если данные не загружены
  // ============================================
  
  /**
   * Эффект первичной загрузки данных
   * 
   * @description
   * Загружает данные только при первом монтировании компонента
   * и только если в сторе еще нет данных.
   */
  useEffect(() => {
    // ✅ Загружаем данные только при первом монтировании и если нет данных
    if (isFirstLoadRef.current && decks.length === 0) {
      console.log('🔁 Первичная загрузка данных');
      loadDecksData();
      isFirstLoadRef.current = false;
    } else if (decks.length > 0) {
      console.log('📦 Данные уже есть, автозагрузка пропущена');
    }
  }, [decks.length, loadDecksData]);

  // ============================================
  // 7. ВОЗВРАЩАЕМ ТОТ ЖЕ ОБЪЕКТ
  // ============================================
  
  return {
    // Данные
    decks,
    loading,
    error,
    loadingCards,
    cards: [],
    
    // Методы
    loadDecksData,
    refreshDecks,
    getDeckById,
    updateDeckFields,
    deleteDeck,
    getDeckCards,
    removeCard,
    addCard,
    updateCard,
    getCardById,
    makeDeckPublic,
    importDeck,
    
    // Дополнительно для совместимости
    syncCardsCount: async () => { console.log('syncCardsCount deprecated'); },
    updateDeckExtraCount: async () => { console.log('updateDeckExtraCount deprecated'); },
  };
};