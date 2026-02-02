import { useLocalSearchParams } from 'expo-router';
import SecondStepScreen from '@/feature/auth/onboarding/screens/SecondStep';
import ThirdStepScreen from '@/feature/auth/onboarding/screens/ThirdStep';
import FourthStepScreen from '@/feature/auth/onboarding/screens/FourthStep';
import WelcomeScreen from '@/feature/auth/onboarding/screens/WelcomeStep';

export default function OnbordingStepScreens() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case 'second-step':
      return <SecondStepScreen />;
    case 'third-step':
      return <ThirdStepScreen />;
    case 'fourth-step':
      return <FourthStepScreen />;
    case 'welcome-last-step':
      return <WelcomeScreen />;
  }
}
