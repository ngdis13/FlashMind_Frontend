import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./style/styles";

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);

  const handleBack = () => {
    router.back();
  };
  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <View style={[commonStyles.mainContent]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack}>
            <Image
              source={ReturnIcon}
              style={{ width: 12, height: 22, top: -7 }}
            />
          </Pressable>

          <Typography variant="h1" style={{ marginBottom: 16 }}>
            {deck?.name}
          </Typography>
        </View>

        <View style={commonStyles.mainBox}>
          <View style={styles.infoLine}>
            <Typography variant="h2">Новые</Typography>
            <Typography variant="h2">24</Typography>
          </View>
          <View style={styles.infoLine}>
            <Typography variant="h2">Изучено</Typography>
            <Typography variant="h2">4</Typography>
          </View>
          <View style={styles.infoLine}>
            <Typography variant="h2">Не изучено</Typography>
            <Typography variant="h2">14</Typography>
          </View>
          <View style={styles.infoLine}>
            <View>
              <Typography variant="h2">Добавить к изучению</Typography>
            </View>
            <View>
              <Typography variant="h2">5</Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
