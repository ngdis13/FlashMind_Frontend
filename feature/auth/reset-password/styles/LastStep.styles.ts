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
