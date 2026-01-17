import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F6F9FC',
    paddingHorizontal: 10,
    paddingTop: 100,
  },
  pageNames: {
    marginBottom: 16,
    textAlign: 'center',
    maxWidth: 400,
  },
  infoContainer: {
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 12,
    width: '100%',
    marginBottom: 16,
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
