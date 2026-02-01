import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressLineBox: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  typography: {
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 400,
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
    color: colors.errorColor,
  },
  errorText: {
    color: colors.errorColor,
    textAlign: 'center',
  },
});
