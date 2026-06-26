/**
 * Форматирует количество скачиваний в компактный вид (например: 154 -> 154, 1200 -> 1.2к, 5000 -> 5к)
 */
export const formatDownloadsCount = (count: number | undefined): string => {
  if (count === undefined || count === null || count < 0) return "0";

  // Если скачиваний меньше 1000, выводим число как есть
  if (count < 1000) {
    return count.toString();
  }

  // Делим на 1000 и округляем до 1 знака после запятой
  const thousands = count / 1000;
  
  // Метод toFixed(1) сделает из 1.5 -> "1.5", а из 3.0 -> "3.0"
  // Заменяем ".0", чтобы для ровных тысяч выводилось просто "3к", а не "3.0к"
  const formatted = thousands.toFixed(1).replace(/\.0$/, "");

  return `${formatted}к`;
};
