import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";

export interface StudyCard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
}

export interface StudyResponse {
  cards: StudyCard[];
  in_learning: number;
  learned: number;
  learning_today: number;
  total: number;
}


export async function getStudyCard(deckId: string, total: number): Promise<StudyResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    const resp = await apiClient.post(
      getMainServiceApiUrl('/api/v1/study'),
      {
        deck_id: deckId, 
        total: total 
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return resp.data;
  } catch (err) {
    handleApiError(err, 'Не удалось получить карточки для обучения');
  }
}


export async function postCardRating(cardId: string, rating: number) {
  try {
    const accessToken = useAuthStore.getState().accessToken;

    const resp = await apiClient.patch(
      getMainServiceApiUrl('/api/v1/study'),
      {
        card_id: cardId,
        rating: rating
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    // Если статус 200, сервер вернул обновленную карточку (нужно для повтора)
    // Если 204, карточка полностью изучена
    return resp; 
  } catch (err) {
    handleApiError(err, 'Не удалось отправить оценку');

  }
}