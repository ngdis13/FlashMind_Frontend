import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingTop: 225,
  },

  pageNames: {
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 400,
  },

  content: {
    gap: 8,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },

  passwordWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  input: {
    width: '100%',
  },
  inputError: {
    borderColor: colors.errorColor,
    color: colors.errorColor,
  },

  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }], // 24 / 2
  },

  buttonContainer: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    bottom: 30,
    paddingHorizontal: 10,
  },
});
