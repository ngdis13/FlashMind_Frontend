import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingTop: 100,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },
  pageNames: {
    marginBottom: 24,
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    gap: 12,
    width: '100%',
    marginBottom: 16,
    maxWidth: 400,
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
