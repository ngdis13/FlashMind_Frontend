import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";

interface Deck {
  id: string;
  name: string;
  description: string;
  total_cards: number;
}

interface DecksResponse {
  decks: Deck[];
}


export async function getUserDecks(): Promise<DecksResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    const resp = await apiClient.get(
      getMainServiceApiUrl("/api/v1/decks"),
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    console.log(resp.data)
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось получить колоды пользоваеля");
  }
}
