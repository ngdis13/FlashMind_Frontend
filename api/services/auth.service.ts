import { login } from "@/feature/auth/login/api/login.api";
import { refresh } from "../auth";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/userStore";
import { LoginPayload } from "@/feature/auth/types/api.types";


/**
 * Логика логина — первый вход
 */
export async function loginUser(payload: LoginPayload) {
  const { access_token} = await login(payload);

  // Сохраняем access_token в стор
  useAuthStore.getState().setAccessToken(access_token);

  return { access_token};
}

/**
 * Логика обновления токенов через refresh
 */
export async function refreshToken() {
  const { access_token, user } = await refresh();
  console.log(access_token)

  // Сохраняем новый токен в стор
  useAuthStore.getState().setAccessToken(access_token);
  useUserStore.getState().setUser(user);

  return { access_token, user };}