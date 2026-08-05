/**
 * Форматирует число с разделением разрядов пробелами.
 * Пример: 1234 → "1 234"
 * @param num — число для форматирования
 * @returns отформатированная строка
 */
export const formatNumber = (num: number): string => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
