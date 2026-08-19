import {
  ScrollView,
  View,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { useCardStore } from "@/store/card.store";

import ReturnIcon from "@/assets/icons/ReturnIcon.png";

export const TextEditor = () => {
  const router = useRouter();
  const { side, blockId } = useLocalSearchParams<{
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
  const value =
    block && (block.type === "term" || block.type === "text")
      ? block.value
      : "";

  const handleBack = (): void => {
    router.back();
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
            <Typography variant="h2">Текст</Typography>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Введите текст"
            placeholderTextColor="#999"
            value={value}
            onChangeText={(text) =>
              updateDraftBlockValue(sideKey, blockId, text)
            }
            maxLength={500}
            multiline
          />
        </ScrollView>
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
  textArea: {
    width: "100%",
    height: 300,
    borderWidth: 2,
    borderColor: "#DBDBDB",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "MontserratSemiBold",
    color: "#000",
    textAlign: "left",
    textAlignVertical: "top",
    backgroundColor: colors.white,
  },
});
