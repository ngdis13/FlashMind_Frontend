import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/storage/types/types";

/**
 * Ответ PATCH /study (v2.0.0)
 * success: true  — карточка прошла повтор на сегодня
 * success: false — карточку нужно показать снова сегодня
 */
export interface ReviewDueCardResponse {
  card: Card;
  success: boolean;
}

/**
 * Перевести карточки из новых в изучаемые (v2.0.0)
 * POST /api/v1/flashmind/study
 * Принимает id колоды и количество карточек.
 * Ответ: только { cards } — поле total из ответа убрано.
 */
export async function newToStudy(
  deckId: string,
  total: number,
): Promise<Card[]> {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    const resp = await apiClient.post<{ cards: Card[] }>(
      getMainServiceApiUrl("/api/v1/flashmind/study"),
      { deck_id: deckId, total },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(`✅ new-to-study: получено ${resp.data.cards.length} карточек`);
    return resp.data.cards;
  } catch (err) {
    handleApiError(err, "Не удалось получить карточки для обучения");
  }
}

/**
 * Повторить карточку (v2.0.0)
 * PATCH /api/v1/flashmind/study
 * Всегда возвращает 200 + { card, success } — 204 No Content больше не используется.
 * card содержит актуальные FSRS-параметры — её нужно заменить в кэше по ID.
 */
export async function reviewCard(
  cardId: string,
  rating: 1 | 2 | 3 | 4,
  reviewDuration: number,
): Promise<ReviewDueCardResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    const resp = await apiClient.patch<ReviewDueCardResponse>(
      getMainServiceApiUrl("/api/v1/flashmind/study"),
      {
        card_id: cardId,
        rating: rating,
        review_duration: reviewDuration,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    console.log(
      `✅ review-card: success=${resp.data.success}, difficulty=${resp.data.card.difficulty}`,
    );
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось отправить оценку");
  }
}
