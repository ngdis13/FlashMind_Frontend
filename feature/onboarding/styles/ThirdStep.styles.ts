import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',               // Тянется до 800px
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  progressLineBox: {
    width: '100%',               // Убрали maxWidth: 400
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  typography: {
    textAlign: 'center',
    width: '100%',               // Убрали maxWidth: 400
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,                     // Увеличили шаг, чтобы красиво разделять поля ввода с учетом ошибок
    width: '100%',               // Убрали maxWidth: 400
  },
  input: {
    width: '100%',
  },
  field: {
    width: '100%',
    gap: 4,
  },
  inputError: {
    borderColor: colors.errorColor,
  },
  errorText: {
    color: colors.errorColor,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',           // Кнопка прижимается к низу по флексу
    marginBottom: 30,
  },
});
