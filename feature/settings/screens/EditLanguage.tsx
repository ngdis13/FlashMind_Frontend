import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import { styles } from "../styles/editLanguage";
import { useState } from "react";
import { colors } from "@/styles/Colors";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message"; // Импортируем Toast

export default function EditLanguage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const handleBack = () => router.push('/settings');

  const handleLanguageChange = (lang: "ru" | "en") => {
    setSelectedLanguage(lang);
    
    const successMessage = lang === "ru" 
      ? "Язык изменен на Русский" 
      : "Language changed to English";

    Toast.show({
      type: "success",
      text1: successMessage,
      position: "bottom",
      visibilityTime: 2000,
    });
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={commonStyles.container}>
        <View style={commonStyles.mainContent}>
          <View style={commonStyles.mainHeader}>
            <Pressable onPress={handleBack}>
              <Image
                source={ReturnIcon}
                style={{ width: 12, height: 22, top: -7 }}
              />
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
              onPress={() => handleLanguageChange("ru")} // Используем новую функцию
            >
              <Typography variant="h2">Русский</Typography>
            </Pressable>
            
            <Pressable
              style={[
                commonStyles.mainBox,
                commonStyles.greyButton,
                selectedLanguage === "en" && { borderColor: colors.mainColor },
              ]}
              onPress={() => handleLanguageChange("en")} // Используем новую функцию
            >
              <Typography variant="h2">Английский</Typography>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
