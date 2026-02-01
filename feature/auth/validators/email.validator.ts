/**
 * Функция для валидации email
 * @param email string - строка с email
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
