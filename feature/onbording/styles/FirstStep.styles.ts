import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FC',
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
  selectionFields: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 30,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
});
