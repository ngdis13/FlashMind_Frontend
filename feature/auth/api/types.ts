export interface FastApiValidationError {
    detail:
    | string
    | {
        loc: (string | number)[];
        msg: string;
        type: string;
      }[];
  };


/**
 * Типизация для запроса регистрации
 */
export interface RegisterPayload {
    email: string;
    password: string;
}

/**
 * Типизация для запроса завершения регистрации и получения токенов
 */
export interface VerifyCodePayload {
    email: string;
    code: string;
}

/**
 * Типизация для повторной отправки кода подтверждения
 */
export interface ResendCodePayload {
    email: string;
}


export interface ApiErrorResponse {
    detail?: string;
    message?: string;
    code?: string;
  }


