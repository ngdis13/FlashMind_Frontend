// Запрос на авторизацию
export interface LoginPayload {
  email: string;
  password: string;
}

// Ответ от сервера после успешной авторизации
export interface LoginResponse {
  access_token: string;
  expires_in: number;  
  token_type: string;  
}

