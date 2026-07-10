/**
 * Расчет точки "4 утра" в миллисекундах.
 * Если сейчас больше 4 утра -> берем 4 утра СЛЕДУЮЩЕГО дня.
 * Если сейчас глубокая ночь (до 4 утра) -> берем 4 утра ТЕКУЩЕГО дня.
 */
export const calculateExpiryTime = (): number => {
  const now = new Date();
  const nextDay = new Date(now);
  
  if (now.getHours() >= 4) {
    nextDay.setDate(now.getDate() + 1);
  }
  
  nextDay.setHours(4, 0, 0, 0);
  return nextDay.getTime(); // Возвращает timestamp в миллисекундах
};
