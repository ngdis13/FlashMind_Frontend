/**
 * Типизация для ошибок валидации, возвращаемых FastAPI.
 *
 * @interface FastApiValidationError
 */
export interface FastApiValidationError {
  /**
   * Подробности ошибки валидации.
   * Может быть строкой или массивом объектов ошибок.
   *
   * @type {string | { loc: (string | number)[]; msg: string; type: string; }[]}
   */
  detail:
    | string
    | {
        /**
         * Местоположение ошибки в запросе или теле.
         * Это может быть путь, указанный массивом строк и чисел.
         *
         * @type {(string | number)[]}
         */
        loc: (string | number)[];
        
        /**
         * Сообщение об ошибке.
         * Описание проблемы валидации.
         *
         * @type {string}
         */
        msg: string;

        /**
         * Тип ошибки.
         * Это строка, указывающая тип ошибки, например, "value_error" или "type_error".
         *
         * @type {string}
         */
        type: string;
      }[];
}

/**
 * Ответ с ошибкой от API.
 * Этот тип используется для возврата ошибок с дополнительным контекстом.
 *
 * @interface ApiErrorResponse
 */
export interface ApiErrorResponse {
  /**
   * Дополнительное описание ошибки.
   * Это поле может быть строкой, если требуется предоставить более подробную информацию.
   *
   * @type {string | undefined}
   */
  detail?: string;

  /**
   * Основное сообщение об ошибке
   *
   * @type {string | undefined}
   */
  message?: string;

  /**
   * Код ошибки.
   * Это может быть строковый код, который дополнительно описывает ошибку.
   * Например, может быть возвращен HTTP-статус или внутренний код ошибки.
   *
   * @type {string | undefined}
   */
  code?: string;
}

/**
 * Общая ошибка API.
 * Используется для возврата ошибки с подробным описанием и сообщением.
 *
 * @interface ApiError
 */
export interface ApiError {
  /**
   * Сообщение об ошибке
   *
   * @type {string | undefined}
   */
  message?: string;

  /**
   * Дополнительное описание ошибки
   *
   * @type {string | undefined}
   */
  detail?: string;
}
