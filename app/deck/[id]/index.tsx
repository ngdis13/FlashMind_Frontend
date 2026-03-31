import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { styles } from "../styles/deckViewById.style";

export default function DeckViewById() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 100 }]}>
      <ScrollView>
        <View style={commonStyles.mainContent}>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Колода {id}
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}
