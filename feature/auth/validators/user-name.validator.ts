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
