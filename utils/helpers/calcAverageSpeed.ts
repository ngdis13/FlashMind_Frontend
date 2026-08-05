type ReviewPoint = { forgotten: number; hard: number; good: number; easy: number };
type TimePoint = { seconds: number };

/**
 * Вычисляет среднее время ответа на одну карточку.
 * Формула: общее время (сек) / общее количество ответов → формат "M:SS"
 * @param timePoints — массив точек review_time.points с сервера
 * @param reviewPoints — массив точек review_count.points с сервера
 * @returns строка в формате "M:SS" (например "2:34")
 */
export const calcAverageSpeed = (
  timePoints: TimePoint[],
  reviewPoints: ReviewPoint[],
): string => {
  let totalSeconds = 0;
  let totalReviews = 0;
  for (const t of timePoints) totalSeconds += t.seconds;
  for (const r of reviewPoints) totalReviews += r.forgotten + r.hard + r.good + r.easy;
  if (totalReviews === 0) return "0:00";
  const avgSec = Math.round(totalSeconds / totalReviews);
  const min = Math.floor(avgSec / 60);
  const sec = avgSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
};
