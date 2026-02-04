import { AxiosError } from "axios";
import { FastApiValidationError } from "../../api/types";

export function getErrorMessage(error: unknown): string {
    console.log(error)

  if (error instanceof AxiosError) {
    const data = error.response?.data as FastApiValidationError  | undefined;
    

    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        
        return data.detail[0]?.msg ?? "Ошибка валидации";
      }

      if (typeof data.detail === "string") {
        return data.detail;
      }
    }

    return error.message;
  }


  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка";
}
