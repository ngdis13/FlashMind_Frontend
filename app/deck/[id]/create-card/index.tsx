import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { ScrollView, View, Image, Pressable, TextInput } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "../../styles/createCard.style";
import { colors } from "@/styles/Colors";
import { variants } from "@/styles/Typography";
import { useState } from "react";
import { MainButton } from "@/components/MainButton";
import { useDecks } from "@/storage/hooks/useDecks";

export default function CreateCardView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addCard } = useDecks();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleBack = () => {
    router.back();
  };
  const handleCreateCard = async () => {
    try {
      await addCard(id as string, front.trim(), back.trim());
      router.back();
    } catch (err) {
      console.error(err);
    } finally{
      router.back();
    }
  };
  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <ScrollView>
        <View style={[commonStyles.mainContent]}>
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image
                source={ReturnIcon}
                style={{ width: 12, height: 22, top: -7 }}
              />
            </Pressable>

            <Typography variant="h1" style={{ marginBottom: 16 }}>
              Вернуться к колоде
            </Typography>
          </View>
          <View style={[commonStyles.infoBox, { flexDirection: "column" }]}>
            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                термин
              </Typography>
              <TextInput
                style={[styles.underlineInput, variants.h2]}
                placeholder="Введите термин"
                placeholderTextColor={colors.darkGray}
                underlineColorAndroid="transparent"
                value={front}
                onChangeText={setFront}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Typography variant="h3" style={styles.firstHeader}>
                определение
              </Typography>
              <TextInput
                style={[styles.underlineInput, variants.h2]}
                placeholder="Введите определение"
                placeholderTextColor={colors.darkGray}
                underlineColorAndroid="transparent"
                value={back}
                onChangeText={setBack}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <MainButton
        style={styles.createCardButton}
        title="Создать карточку"
        onPress={handleCreateCard}
      />
    </View>
  );
}
