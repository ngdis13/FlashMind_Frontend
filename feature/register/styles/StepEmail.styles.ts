import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F6F9FC',
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
  inputContainer: {
    gap: 12,
    width: '100%',
    marginBottom: 16,
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
})
