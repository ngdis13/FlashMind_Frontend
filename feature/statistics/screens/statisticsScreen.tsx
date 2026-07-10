import { colors } from "@/styles/Colors";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { ScrollView, View } from "react-native";
import { styles } from "../styles/statisticScreen.styles";
import { Logo } from "@/components/Logo";

export default function StatisticScreen() {
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
        >
          <View style={styles.responsiveWrapper}>
            <Typography
              variant="h1"
              style={{ marginBottom: 16, width: "100%" }}
            >
              Статистика
            </Typography>
          </View>

          <View style={{alignItems: "center", justifyContent: "center", marginTop: 100}}>
            <Logo/>
            <Typography>
                Скоро здесь появится твоя статистика
            </Typography>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
