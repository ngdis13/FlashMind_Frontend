import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";

interface StudyCard {
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


export async function getStudyInfo(deckId:string): Promise<StudyResponse> {
    try {
        const accessToken = useAuthStore.getState().accessToken

        const resp = await apiClient.get(
            getMainServiceApiUrl('/api/v1/study'),
            {
                headers: {Authorization: `Bearer ${accessToken}`},
                params: {deck_id: deckId}
            }
        )

        console.log('Данные для обучения получены:', resp.data)
        return resp.data;
    }catch(err){
        handleApiError(err, 'Не удалось получиь информацию для обучения')
    }
}