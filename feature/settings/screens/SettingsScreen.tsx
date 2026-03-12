import profileIcon from "@/feature-settings/assets/profileIcon.png";
import languageIcon from '@/feature-settings/assets/languageIcon.png'
import appearanceIcon from '@/feature-settings/assets/appearanceIcon.png'
import infoIcon from '@/feature-settings/assets/infoIcon.png'
import exitIcon from '@/feature-settings/assets/exitIcon.png'

import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Image } from "react-native";
import { styles } from "../styles/settings.style";
import { colors } from "@/styles/Colors";

export default function SettingsScreens() {
  const router = useRouter();
  const handleSettings = () => {
    router.push("/not-found");
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <Typography variant="h1" style={{ marginBottom: 16 }}>
          Настройки
        </Typography>

        <View style={styles.bottonBox}>
          <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleSettings}
          >
            <Image
              source={profileIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">Настройки</Typography>
          </Pressable>

          <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleSettings}
          >
            <Image
              source={languageIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">Язык</Typography>
          </Pressable>

                    <Pressable
            style={[commonStyles.mainBox, commonStyles.greyButton]}
            onPress={handleSettings}
          >
            <Image
              source={appearanceIcon}
              style={[{ width: 20, height: 20 }]}
              resizeMode="contain"
            />
            <Typography variant="h2">Внешний вид</Typography>
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
            style={[commonStyles.mainBox, commonStyles.greyButton, styles.exitButton]}
            onPress={handleSettings}
          >
            <Image
              source={exitIcon}
              style={[{ width: 20, height: 20, shadowColor: colors.errorColor }]}
              resizeMode="contain"
            />
            <Typography variant="h2" color={colors.errorColor}>Выйти</Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
