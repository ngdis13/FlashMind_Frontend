import profileIcon from "@/feature-settings/assets/profileIcon.png";
import languageIcon from "@/feature-settings/assets/languageIcon.png";
import appearanceIcon from "@/feature-settings/assets/appearanceIcon.png";
import infoIcon from "@/feature-settings/assets/infoIcon.png";
import exitIcon from "@/feature-settings/assets/exitIcon.png";

import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Image } from "react-native";
import { styles } from "../styles/settings.style";
import { colors } from "@/styles/Colors";
import ThemeSwitch from "../components/themeSwitch";
import { logoutUser } from "../api/settings.api";
import { useAuthStore } from "@/store/auth.store";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

export default function SettingsScreens() {
  const router = useRouter();
  const accessToken = useAuthStore.getState().accessToken;
  const handleSettings = () => {
    router.push("/not-found");
  };

  const handleEditProfile = () => {
    router.push("/settings/edit-profile");
  };

  const handleLanguage = () => {
    router.push("/settings/edit-language");
  };

  const getLogout = () => {
    logoutUser(accessToken);
  };

  const handleBack = () => router.back();
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <View style={styles.header}>
          <Pressable onPress={handleBack}>
            <Image source={ReturnIcon} style={{ width: 12, height: 22, top: -7 }} />
          </Pressable>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Настройки
          </Typography>
        </View>

        <View style={styles.buttonBox}>
          <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleEditProfile}
          >
            <Image
              source={profileIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">Профиль</Typography>
          </Pressable>

          <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleLanguage}
          >
            <Image
              source={languageIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">Язык</Typography>
          </Pressable>

          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              styles.themeButton,
            ]}
          >
            <View style={[commonStyles.greyButton, { alignItems: "center" }]}>
              <Image
                source={appearanceIcon}
                style={[{ width: 20, height: 20 }]}
                resizeMode="contain"
              />
              <Typography variant="h2">Внешний вид</Typography>
            </View>

            <ThemeSwitch />
          </Pressable>
          <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleSettings}
          >
            <Image
              source={infoIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">О FlashMind</Typography>
          </Pressable>
          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              styles.exitButton,
            ]}
            onPress={getLogout}
          >
            <Image
              source={exitIcon}
              style={[
                { width: 20, height: 20, shadowColor: colors.errorColor },
              ]}
              resizeMode="contain"
            />
            <Typography variant="h2" color={colors.errorColor}>
              Выйти
            </Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
