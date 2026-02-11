/**
 * Валидирует текстовое поле имени (например, имя или фамилию).
 *
 * Проверяет:
 * - что значение не пустое
 * - минимальную и максимальную длину
 * - допустимые символы (латиница, кириллица и дефис)
 *
 * @param {string} value - Введённое пользователем значение
 * @param {string} fieldName - Название поля (используется в тексте ошибки, например "Имя" или "Фамилия")
 * @param {number} [minLength=2] - Минимально допустимая длина строки
 * @param {number} [maxLength=30] - Максимально допустимая длина строки
 *
 * @returns {string | null}
 * Возвращает:
 * - строку с текстом ошибки, если валидация не пройдена
 * - `null`, если значение корректно
 *
 * @example
 * ```ts
 * const error = validateNameField("Иван", "Имя");
 * if (error) {
 *   console.log(error); // сообщение об ошибке
 * }
 * ```
 */
export const validateNameField = (
  value: string,
  fieldName: string,
  minLength = 2,
  maxLength = 30
): string | null => {
  const trimmed = value.trim();
  const nameRegex = /^[A-Za-zА-Яа-яЁё-]+$/;

  if (!trimmed) {
    return `${fieldName} не может быть пустым`;
  }

  if (trimmed.length < minLength) {
    return `${fieldName} должно содержать минимум ${minLength} символа`;
  }

  if (trimmed.length > maxLength) {
    return `${fieldName} должно содержать не более ${maxLength} символов`;
  }

  if (!nameRegex.test(trimmed)) {
    return `${fieldName} может содержать только буквы и дефис`;
  }

  return null;
};
