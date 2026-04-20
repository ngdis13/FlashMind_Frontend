import { commonStyles } from "@/styles/Common";
import { Pressable, StyleSheet, ScrollView, View } from "react-native"; // Добавили ScrollView
import { StudyCard } from "../../api/api";
import { Typography } from "@/styles/Typography";
import { useEffect, useState } from "react";

interface Props {
  card: StudyCard | undefined;
}

export const StudyCardView = ({ card }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [card?.id]);

  return (
    <View style={[commonStyles.mainBox, styles.cardContainer]}>
      <ScrollView
        // Центрируем контент, когда его мало
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.pressableArea}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          <Typography variant="h2" style={styles.mainText}>
            {isFlipped ? card?.back : card?.front}
          </Typography>
        </Pressable>
      </ScrollView>

      {/* Текст-подсказка фиксирован снизу, чтобы не уезжать при скролле */}
      <Typography
        variant="h3"
        color="gray"
        style={styles.hintText}
      >
        Нажми, чтобы перевернуть
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    marginBottom: 24,
    paddingBottom: 40, // Место для подсказки снизу
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1, // Важно для центрирования
    justifyContent: "center",
  },
  pressableArea: {
    flex: 1,
    padding: 20,
    width: '100%',
    minHeight: 200, // Минимальная высота для удобства нажатия
    justifyContent: "center",
  },
  mainText: {
    textAlign: "center",
  },
  hintText: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: 'transparent', 
  },
});
