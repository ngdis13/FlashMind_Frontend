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
    gap: 16,
  },
});
