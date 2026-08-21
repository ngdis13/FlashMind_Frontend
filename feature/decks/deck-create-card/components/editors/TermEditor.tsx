// feature-decks/deck-create-card/screens/TermEditor.tsx
import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton"; // Импортируем твою стандартную кнопку

import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { Input } from "@/components/Input";

export const TermEditor = () => {
  const router = useRouter();
  const { id, side, blockId } = useLocalSearchParams<{
    id: string;
    side: string;
    blockId: string;
  }>();

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const updateDraftBlockValue = useCardStore((s) => s.updateDraftBlockValue);

  const sideKey: "front" | "back" = side === "front" ? "front" : "back";
  const block = (sideKey === "front" ? front : back).find(
    (b) => b.id === blockId,
  );
  
  const initialValue = block && (block.type === "term" || block.type === "text")
      ? block.value
      : "";

  // Локальный стейт, чтобы Zustand не перерендеривался на каждый символ
  const [localText, setLocalText] = useState(initialValue);

  const handleBack = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  // Функция сохранения при клике на MainButton внизу
  const handleSave = (): void => {
    updateDraftBlockValue(sideKey, blockId, localText.trim());
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: { side },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}>
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{
            flexGrow: 1,
            width: "100%",
            paddingHorizontal: 10,
            paddingTop: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton} hitSlop={20}>
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Термин</Typography>
          </View>

          <Input
            style={styles.termArea}
            placeholder="Введите термин"
            value={localText}
            onChangeText={setLocalText}
            maxLength={40} // Ограничение на 40 символов для термина
            multiline
            autoFocus
          />
          {/* Счетчик символов */}
          <Typography variant="h3" color={colors.darkGray} style={styles.counter}>
            {localText.length} / 40
          </Typography>
        </ScrollView>

        {/* Стандартная кнопка в самом низу экрана */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 10,
            alignItems: "center",
            marginBottom: BOTTOM_MARGIN,
          }}
        >
          <MainButton
            style={styles.saveButton}
            title="Готово"
            onPress={handleSave}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 16,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: -20,
    padding: 20,
  },
  termArea: {
    width: "100%",
    height: 60,
    paddingVertical: 12,
    textAlign: "left",
    textAlignVertical: "top",
    backgroundColor: colors.white,
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  saveButton: {
    width: "100%",
  }
});
