import { useLocalSearchParams } from "expo-router";
import SecondStepScreen from "@/feature/onboarding/screens/SecondStep";
import ThirdStepScreen from "@/feature/onboarding/screens/ThirdStep";
import FourthStepScreen from "@/feature/onboarding/screens/FourthStep";
import WelcomeScreen from "@/feature/onboarding/screens/WelcomeStep";

export default function OnbordingStepScreens() {
  const { step } = useLocalSearchParams();

  switch (step) {
    case "second-step":
      return <SecondStepScreen />;
    case "third-step":
      return <ThirdStepScreen />;
    case "fourth-step":
      return <FourthStepScreen />;
    case "welcome-last-step":
      return <WelcomeScreen />;
  }
}
