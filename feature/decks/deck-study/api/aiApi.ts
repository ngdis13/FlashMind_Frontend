import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { AxiosError } from "axios";

// ==================== ТИПЫ ОТВЕТА ====================

export interface StudyStatItem {
  text: string;
  title: string;
}



export interface InsufficientReviewsResponse {
  error: string;
  message: string;
  remaining_reviews: number;
  total_reviews: number;
}

export interface StudyStatAnalyzeResponse {
  analysis_date: string;
  analysis_next_date: string;
  analysis_success: boolean;
  goals: StudyStatItem [];
  insights: StudyStatItem [];
  problem_areas: StudyStatItem []; 
  recommendations: StudyStatItem [];
}

/**
 * Запустить AI-анализ статистики обучения пользователя.
 * @param deckId — опциональный ID колоды. Если не указан — анализ по всем колодам пользователя.
 */
export const analyzeStudyStat = async (
  deckId?: string | null,
): Promise<StudyStatAnalyzeResponse> => {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    if (!accessToken) {
      console.log("❌ Токен доступа отсутствует");
      throw new Error("Нет токена авторизации");
    }

    const params: Record<string, string> = {};
    if (deckId) params.deck_id = deckId;

    const queryString = deckId
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    console.log(
      `🤖 Запускаем AI-анализ статистики${deckId ? ` для колоды ${deckId}` : " по всем колодам"}...`,
    );

    const resp = await apiClient.post<StudyStatAnalyzeResponse>(
      getMainServiceApiUrl(`/api/v1/flashmind/ai/analyze-study-stat${queryString}`),
      {},
      {
        timeout: 300000,
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    console.log(
      `✅ [${deckId ?? "все"}] AI-анализ успешно завершен. Целей: ${resp.data.goals.length}, инсайтов: ${resp.data.insights.length}, рекомендаций: ${resp.data.recommendations.length}`,
    );

    return resp.data;
  } catch (err: unknown) {
    // 422 — недостаточно повторов, пробрасываем как есть
    if (err instanceof AxiosError && err.response?.status === 422) {
      throw err;
    }
    handleApiError(err, "Не удалось выполнить AI-анализ статистики");
    throw err;
  }
};
