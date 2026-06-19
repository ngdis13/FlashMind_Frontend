import { colors } from '@/styles/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  logoImage: {
    width: 190,
    height: 190,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 40,
    color: colors.darkMainColor,
    fontFamily: 'MontserratSemibold',
  },
  mainText: {
    textAlign: 'center',
    maxWidth: '80%',
  },
});
