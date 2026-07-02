// app/decks/cloud-decks/card/[cloudCardId].tsx
import { Typography} from "@/styles/Typography";
import { ScrollView, View, Image, Pressable } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { commonStyles } from "@/styles/Common";
import { styles } from "../styles/cloudCardView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { colors } from "@/styles/Colors";
import Toast from "react-native-toast-message";
import { fetchCloudDeckCard } from "../../api/api";

export default function CloudCardView() {
  const { cloudCardId, cloudDeckId } = useLocalSearchParams<{
    cloudCardId: string;
    cloudDeckId: string;
  }>();
  const router = useRouter();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCard = async () => {
      if (!cloudCardId) return;

      try {
        setIsLoading(true);
        const cardData = await fetchCloudDeckCard(cloudCardId);
        console.log("Данные карточки:", cardData);

        setFront(cardData.front || "Нет данных");
        setBack(cardData.back || "Нет данных");
      } catch (error) {
        console.error("Ошибка загрузки карточки:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка загрузки",
          text2: "Не удалось загрузить карточку",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCard();
  }, [cloudCardId]);

  const handleBack = () => {
    router.push(`/decks/cloud-decks/${cloudDeckId}`);
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              commonStyles.content,
              { width: "100%", paddingHorizontal: 16 },
            ]}
          >
            <View
              style={[
                commonStyles.mainContent,
                { width: "100%", paddingHorizontal: 0 },
              ]}
            >
              {/* Хедер */}
              <View style={styles.header}>
                <Pressable
                  onPress={handleBack}
                  style={{
                    padding: 12,
                    marginLeft: -12,
                    marginRight: -8,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={ReturnIcon}
                    style={{ width: 12, height: 22, top: -7 }}
                  />
                </Pressable>

                <Typography variant="h1" style={{ marginBottom: 16 }}>
                  Вернуться к колоде
                </Typography>
              </View>

              {/* Контент карточки */}
              <View
                style={[
                  commonStyles.infoBox,
                  { flexDirection: "column", width: "100%" },
                ]}
              >
                {/* ТЕРМИН */}
                <View style={styles.inputWrapper}>
                  <Typography variant="h3" style={styles.firstHeader}>
                    термин
                  </Typography>
                  <View style={styles.valueContainer}>
                    <Typography variant="h2" >
                      {front}
                    </Typography>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Typography variant="h3" style={styles.firstHeader}>
                    определение
                  </Typography>
                  <View style={styles.valueContainer}>
                    <Typography variant="h2" >
                      {back}
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}