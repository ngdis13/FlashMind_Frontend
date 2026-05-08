/**
 * Функция для склонения слова карточки на основном экране с колодами
 * @param count 
 * @returns 
 */

export const getPluralCards = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} карточек`;
  }
  if (lastDigit === 1) {
    return `${count} карточка`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} карточки`;
  }
  return `${count} карточек`;
};
