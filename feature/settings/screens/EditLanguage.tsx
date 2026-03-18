import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View } from "react-native";
import { styles } from "../styles/editLanguage";
import { useState } from "react";
import { colors } from "@/styles/Colors";

export default function EditLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <Typography variant="h1" style={{ marginBottom: 16 }}>
          Язык
        </Typography>

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
