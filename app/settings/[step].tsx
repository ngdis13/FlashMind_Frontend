import EditLanguage from "@/feature/settings/screens/EditLanguage";
import EditProfile from "@/feature/settings/screens/EditProfile";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SettingsStepScreen() {
  const { step } = useLocalSearchParams();
  const router = useRouter();

  switch (step) {
    case "edit-profile":
      return <EditProfile />;
    case "edit-language":
      return <EditLanguage />;

    default:
      router.push("/not-found");
  }
}
