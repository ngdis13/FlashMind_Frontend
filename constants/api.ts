// Если у тебя два микросервиса — можно так (или вообще отдельные переменные)
export const AUTH_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_API_URL


// Самая удобная утилита (рекомендую)
export function getAuthApiUrl(
  path: string,
  base: string = AUTH_BASE_URL,
): string {
  return `${base}${path}`;
}