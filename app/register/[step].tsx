import { useLocalSearchParams } from 'expo-router';
import RegisterScreen from '@/feature/auth/register/screens/StepEmail';
import StepConfirmEmail from '@/feature/auth/register/screens/StepConfirmEmail';

export default function RegisterStepScreen() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case 'step-confirm-email':
      return <StepConfirmEmail />;
    default:
      return <RegisterScreen />;
  }
}
