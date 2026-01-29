import { useLocalSearchParams } from 'expo-router';
import SecondStepScreen from '@/feature/onbording/screens/SecondStep';

export default function OnbordingStepScreens() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case 'second-step':
      return <SecondStepScreen />;
  }
}
