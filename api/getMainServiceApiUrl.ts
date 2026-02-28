import { MAIN_SERVICE_BASE_URL } from "@/constants/api";

export function getMainServiceApiUrl(
    path: string,
    base: string = MAIN_SERVICE_BASE_URL,
  ): string {
    return `${base}${path}`;
  }