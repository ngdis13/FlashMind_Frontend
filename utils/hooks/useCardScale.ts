// --------------------------- React Native ---------------------------
import { useCallback } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Базовая ширина мобильного экрана — эталон дизайна (iPhone ≈ 390–400pt).
 * Все размеры карточки заданы относительно этой ширины,
 * поэтому scale = 1 сохраняет мобильный вид без изменений.
 */
export const BASE_WIDTH = 400;

/** Порог «планшет/десктоп»: с этой ширины фиксируем масштаб на максимуме. */
export const DESKTOP_MIN_WIDTH = 600;

/** Максимальный коэффициент: десктоп крупнее мобильного не более чем на 35%. */
export const MAX_SCALE = 1.35;

/**
 * Максимальный коэффициент для шрифтов: текст растёт мягче контейнера —
 * до +20% (термин 18 → 22 на десктопе, а не 24).
 */
export const MAX_TEXT_SCALE = 1.2;

/**
 * Хук умного масштабирования контента карточки (обучение / предпросмотр /
 * редактор). Общий для всех мест, где карточка отображается в контейнере
 * CARD_DISPLAY (372×520 на мобильных, 650×750 на десктопе).
 *
 * Логика расчёта scale:
 * - width <= 400 (телефоны) → scale = 1 (мобильный дизайн не трогаем)
 * - 400 < width <= 600 (крупные телефоны / узкие планшеты) → плавный рост width / 400
 * - width > 600 (планшет / web-десктоп) → фикс 1.35
 *
 * @returns { scale } — коэффициент контейнера/отступов;
 *          { textScale } — коэффициент шрифтов (мягче, до +20%);
 *          { scaled, scaledText } — хелперы для стилей
 *
 * @example
 * const { scaled, scaledText } = useCardScale();
 * // mobile: scaled(18) === 18, scaledText(18) === 18
 * // desktop: scaled(18) === 24, scaledText(18) === 22
 */
export const useCardScale = () => {
  const { width } = useWindowDimensions();

  const scale =
    width > DESKTOP_MIN_WIDTH ? MAX_SCALE : Math.max(1, width / BASE_WIDTH);

  // Хелпер для стилей: округление, чтобы не ловить дробные пиксели.
  // useCallback — чтобы динамические стили в компонентах
  // можно было мемоизировать по ссылке на scaled
  const scaled = useCallback(
    (size: number): number => Math.round(size * scale),
    [scale],
  );

  // Шрифты растут мягче контейнера/отступов, чтобы текст не был гигантским
  const textScale = Math.min(scale, MAX_TEXT_SCALE);

  // Отдельный хелпер для размеров шрифта: 18 → 22 на десктопе
  const scaledText = useCallback(
    (size: number): number => Math.round(size * textScale),
    [textScale],
  );

  return { scale, textScale, scaled, scaledText, windowWidth: width };
};
