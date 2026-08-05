/**
 * Переводит секунды в формат "X ч Y мин".
 * @param totalSeconds — общее количество секунд
 * @returns строка вида "12 ч 30 мин"
 */
export const formatStudyTime = (totalSeconds: number): string => {
  if (!totalSeconds) return "0 ч 0 мин";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} ч ${minutes} мин`;
};
