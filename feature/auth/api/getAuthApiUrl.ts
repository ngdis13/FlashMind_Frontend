import { AUTH_BASE_URL } from "@/constants/api";

export function getAuthApiUrl(
    path: string,
    base: string = AUTH_BASE_URL,
  ): string {
    return `${base}${path}`;
  }