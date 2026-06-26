/**
 * Вычисляет, сколько дней назад была синхронизирована колода,
 * и возвращает строку с правильным русским склонением.
 */
export const getDaysAgoText = (isoString: string): string => {
  if (!isoString) return "Не обновлялось";

  const syncedDate = new Date(isoString);
  const currentDate = new Date();

  // Вычисляем разницу в миллисекундах и переводим в дни
  const diffTime = Math.abs(currentDate.getTime() - syncedDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Сценарий 1: Обновлено сегодня
  if (diffDays === 0) {
    return "сегодня";
  }

  // Сценарий 2: Логика правильного склонения слов (день, дня, дней) в русском языке
  const lastDigit = diffDays % 10;
  const lastTwoDigits = diffDays % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${diffDays} дней назад`;
  }
  if (lastDigit === 1) {
    return `${diffDays} день назад`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${diffDays} дня назад`;
  }

  return `${diffDays} дней назад`;
};
