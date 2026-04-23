import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import { styles } from "../styles/editLanguage";
import { useState } from "react";
import { colors } from "@/styles/Colors";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useRouter } from "expo-router";

export default function EditLanguage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const handleBack = () => router.back();

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <View style={commonStyles.mainHeader}>
          <Pressable onPress={handleBack}>
            <Image source={ReturnIcon} style={{ width: 12, height: 22, top: -7 }} />
          </Pressable>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Язык
          </Typography>
        </View>

        <View style={styles.buttonBox}>
          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              selectedLanguage === "ru" && { borderColor: colors.mainColor },
            ]}
            onPress={() => setSelectedLanguage("ru")}
          >
            <Typography variant="h2">Русский</Typography>
          </Pressable>
          <Pressable
            style={[
              commonStyles.mainBox,
              commonStyles.greyButton,
              selectedLanguage === "en" && { borderColor: colors.mainColor },
            ]}
            onPress={() => setSelectedLanguage("en")}
          >
            <Typography variant="h2">Английский</Typography>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
