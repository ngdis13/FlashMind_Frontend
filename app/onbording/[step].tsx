import { useLocalSearchParams } from 'expo-router';
import SecondStepScreen from '@/feature/onbording/screens/SecondStep';
import ThirdStepScreen from '@/feature/onbording/screens/ThirdStep';
import FourthStepScreen from '@/feature/onbording/screens/FourthStep';
import WelcomeScreen from '@/feature/onbording/screens/WelcomeStep';

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
