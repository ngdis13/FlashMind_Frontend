import apiClient from "@/api/client";
import { getMainServiceApiUrl } from "@/api/getMainServiceApiUrl";
import { handleApiError } from "@/api/interceptors/error.interceptor";
import { useAuthStore } from "@/store/auth.store";

interface CreateDeckPayload {
  name: string;
  description: string;
}

// Сервер возвращает объект созданной колоды, а не массив decks
interface CreateDeckResponse {
  id: string;
  name: string;
  description: string;
}


export async function createNewDeck(payload: CreateDeckPayload): Promise<CreateDeckResponse> {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      console.log("Токен доступа отсутствует");
    }
    const resp = await apiClient.post(
      getMainServiceApiUrl("/api/v1/decks"),
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    console.log("Колода создана", resp.data)
    return resp.data;
  } catch (err) {
    handleApiError(err, "Не удалось создать новую колоду");
  }
}
