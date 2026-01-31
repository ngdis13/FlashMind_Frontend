import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F6F9FC',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
    textAlign: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    gap: 16,
    bottom: 30,
    paddingHorizontal: 10,
  },
});
