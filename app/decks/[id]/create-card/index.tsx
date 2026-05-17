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
    router.push(`/decks/${id}`);
  };
  const handleCreateCard = async () => {
    try {
      await addCard(id as string, front.trim(), back.trim());
      router.push(`/decks/${id}`);
    } catch (err) {
      console.error(err);
    } finally{
      router.push(`/decks/${id}`);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView 
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          
          <View style={[commonStyles.content, { width: "100%", paddingHorizontal: 16 }]}>
            <View style={[commonStyles.mainContent, { width: "100%", paddingHorizontal: 0 }]}>
              
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

              <View style={[commonStyles.infoBox, { flexDirection: "column", width: "100%" }]}>
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
          </View>
        </ScrollView>

        <View style={{ width: "100%", paddingHorizontal: 16, alignItems: "center" }}>
          <MainButton
            style={styles.createCardButton}
            title="Создать карточку"
            onPress={handleCreateCard}
          />
        </View>

      </View>
    </View>
  );

}
