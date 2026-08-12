import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
// ==================== ТИПЫ ОТВЕТА ====================

export interface OneTimeMetrics {
  total_reviews: number;
  total_study_seconds: number;
}

export interface ForecastPoint {
  date: string;
  count: number;
}

export interface ReviewCountPoint {
  date: string;
  forgotten: number;
  hard: number;
  good: number;
  easy: number;
}

export interface ReviewTimePoint {
  date: string;
  seconds: number;
}

export interface HourlyBreakdownPoint {
  hour_range: string;
  percentage: number;
}

export interface DifficultyPoint {
  range_label: string;
  count: number;
}

export interface StabilityPoint {
  range_label: string;
  count: number;
}

export interface CardTypePoint {
  card_type: string;
  count: number;
}

export interface StatsResponse {
  one_time_metrics: OneTimeMetrics;
  forecast: { points: ForecastPoint[] };
  review_count: { points: ReviewCountPoint[] };
  review_time: { points: ReviewTimePoint[] };
  hourly_breakdown: { points: HourlyBreakdownPoint[] };
  difficulty_distribution: { points: DifficultyPoint[] };
  stability_distribution: { points: StabilityPoint[] };
  card_types: { points: CardTypePoint[] };
}




/**
 * Получить полную статистику пользователя.
 * @param deckId — опциональный фильтр по колоде (null = все колоды)
 */
export const fetchStats = async (
  deckId?: string | null,
): Promise<StatsResponse> => {
  try {
    const params: Record<string, string> = {};
    if (deckId) params.deck_id = deckId;

    const queryString = deckId
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    console.log(
      `📊 Загружаем статистику${deckId ? ` для колоды ${deckId}` : " по всем колодам"}...`,
    );

    const resp = await apiClient.get<StatsResponse>(
      getMainServiceApiUrl(`/api/v1/flashmind/stats/stats${queryString}`),
    );

    const rc = resp.data.review_count.points;
    const totalGood = rc.reduce((s,p) => s+p.good+p.easy, 0);
    const totalAll = rc.reduce((s,p) => s+p.forgotten+p.hard+p.good+p.easy, 0);
    console.log(`✅ [${deckId ?? "все"}] точек:${rc.length} good+easy:${totalGood} всего:${totalAll} = ${Math.round(totalGood/Math.max(1,totalAll)*100)}% | первые3: ${JSON.stringify(rc.slice(0,3))} | последние3: ${JSON.stringify(rc.slice(-3))}`);
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось загрузить статистику");
    throw err;
  }
};



