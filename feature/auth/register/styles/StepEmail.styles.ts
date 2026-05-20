import { StyleSheet } from 'react-native';
import { colors } from '@/styles/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',           
    alignItems: 'center',
    paddingHorizontal: 16,   
    paddingTop: 60,           
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  pageNames: {
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    gap: 12,
    width: '100%',            
    marginBottom: 16,
  },
  input: {
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',           
  },
  inputError: {
    borderColor: colors.errorColor,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }], 
  },
  errorContainer: {
    width: '100%',
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    color: colors.errorColor,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',           
    gap: 12,
    marginTop: 'auto',      
    marginBottom: 30,    
    alignItems: "center"     
  },
});
