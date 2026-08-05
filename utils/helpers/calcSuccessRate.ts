type ReviewPoint = { forgotten: number; hard: number; good: number; easy: number };

/**
 * Вычисляет среднюю успешность ответов в процентах.
 * Формула: (good + easy) / (все ответы) * 100
 * @param points — массив точек review_count.points с сервера
 * @returns целое число процентов (0–100)
 */
export const calcSuccessRate = (points: ReviewPoint[]): number => {
  let totalGood = 0;
  let totalAll = 0;
  for (const p of points) {
    totalGood += p.good + p.easy;
    totalAll += p.forgotten + p.hard + p.good + p.easy;
  }
  return totalAll > 0 ? Math.round((totalGood / totalAll) * 100) : 0;
};
