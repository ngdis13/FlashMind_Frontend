import { useLocalSearchParams } from 'expo-router';
import SecondStepResetPassword from '@/feature/auth/reset-password/screens/SecondStep';
import ThirdStepResetPassword from '@/feature/auth/reset-password/screens/ThirdStep';
import LastStepResetPassword from '@/feature/auth/reset-password/screens/LastStep';

export default function RegisterStepScreen() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case 'second-step':
      return <SecondStepResetPassword />;
    case 'third-step':
      return <ThirdStepResetPassword />;
    case 'last-step':
      return <LastStepResetPassword />;
  }
}
