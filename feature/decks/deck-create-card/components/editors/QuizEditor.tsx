import { ScrollView, View, Image, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { BOTTOM_MARGIN, commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";
import { MainButton } from "@/components/MainButton";
import { Input } from "@/components/Input";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";

export const QuizEditor = () => {
  const router = useRouter();
  const { id, side, blockId, cardId } = useLocalSearchParams<{
    id: string;
    side: string;
    blockId: string;
    cardId: string;
  }>();

  const front = useCardStore((s) => s.draftFront);
  const back = useCardStore((s) => s.draftBack);
  const updateDraftBlock = useCardStore((s) => s.updateDraftBlock);

  const sideKey: "front" | "back" = side === "front" ? "front" : "back";
  const block = (sideKey === "front" ? front : back).find(
    (b) => b.id === blockId,
  );

  const [variants, setVariants] = useState<string[]>(
    block && block.type === "quiz" ? block.variants : ["", ""],
  );
  const [correctIndexes, setCorrectIndexes] = useState<number[]>(
    block && block.type === "quiz" ? block.correctIndexes : [0],
  );

  // Валидация: минимум 2 заполненных варианта и хотя бы один верный
  const filledCount = variants.filter((v) => v.trim()).length;
  const isValid = filledCount >= 2 && correctIndexes.length > 0;

  const handleBack = (): void => {
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: cardId ? { side, cardId } : { side },
    });
  };

  const handleVariantChange = (index: number, text: string): void => {
    setVariants((prev) => prev.map((v, i) => (i === index ? text : v)));
  };

  const handleAddVariant = (): void => {
    setVariants((prev) => [...prev, ""]);
  };

  // Клик по кружку переключает вариант: верных может быть несколько
  const handleToggleCorrect = (index: number): void => {
    setCorrectIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleSave = (): void => {
    if (block && block.type === "quiz") {
      updateDraftBlock(sideKey, blockId, {
        ...block,
        variants: variants.map((v) => v.trim()),
        correctIndexes,
      });
    }
    router.push({
      pathname: `/decks/${id}/create-card/side-editor`,
      params: cardId ? { side, cardId } : { side },
    });
  };
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
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
          <View
            style={[
              commonStyles.screenHeader,
              styles.contentWidth,
              { marginBottom: 24 },
            ]}
          >
            <Pressable
              onPress={handleBack}
              style={commonStyles.backButton}
              hitSlop={20}
            >
              <Image source={ReturnIcon} style={{ width: 10, height: 18 }} />
            </Pressable>
            <Typography variant="h2">Варианты ответа</Typography>
          </View>

          <View style={styles.contentWidth}>
            {variants.map((variant, index) => {
              const isCorrect = correctIndexes.includes(index);
              return (
                <View key={index} style={styles.variantRow}>
                  <Pressable
                    onPress={() => handleToggleCorrect(index)}
                    style={[styles.radio, isCorrect && styles.radioSelected]}
                    hitSlop={8}
                  >
                    {isCorrect && (
                      <Typography variant="span" style={styles.check}>
                        ✓
                      </Typography>
                    )}
                  </Pressable>
                  <Input
                    style={styles.variantInput}
                    placeholder="Введите вариант ответа"
                    value={variant}
                    onChangeText={(text) => handleVariantChange(index, text)}
                  />
                </View>
              );
            })}

            <Pressable style={styles.addVariant} onPress={handleAddVariant}>
              <Typography variant="span" style={styles.addVariantText}>
                + Добавить вариант ответа
              </Typography>
            </Pressable>

            {!isValid && (
              <Typography variant="h3" style={styles.hint}>
                Заполните минимум два варианта и отметьте хотя бы один
                правильный
              </Typography>
            )}
          </View>
        </ScrollView>

        <View style={[styles.saveButtonWrapper, styles.contentWidth]}>
          <MainButton
            style={styles.saveButton}
            title="Готово"
            onPress={handleSave}
            disabled={!isValid}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentWidth: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.mainColor,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: colors.mainColor,
  },
  check: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 16,
  },
  variantInput: {
    flex: 1,
    textAlign: "left",
  },
  addVariant: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  addVariantText: { color: colors.mainColor },
  hint: { color: colors.errorColor, marginTop: 4 },
  saveButtonWrapper: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: BOTTOM_MARGIN,
  },
  saveButton: { width: "100%" },
});
