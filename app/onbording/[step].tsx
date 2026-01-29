import { useLocalSearchParams } from 'expo-router';
import FirstStepScreen from '@/feature/onbording/screens/FirstStep';
import SecondStepScreen from '@/feature/onbording/screens/SecondStep';

export default function OnbordingStepScreens() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case 'first-step':
      return <FirstStepScreen />;
    case 'second-step':
      return <SecondStepScreen />;
  }
}
