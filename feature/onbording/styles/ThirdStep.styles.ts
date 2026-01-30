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
    marginBottom: 16,
    maxWidth: 400,
  },
});
