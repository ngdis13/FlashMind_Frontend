import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View, Image } from "react-native";
import { fetchCloudDeckPreview } from "../../api/api";
import { CloudDeckPreviewResponse } from "../../types/types";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";
import { colors } from "@/styles/Colors";
import { styles } from "../styles/styles";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getDaysAgoText } from "@/utils/helpers/getDayAgo";
import IconDownloadPreview from "../../assets/IconDownloadPreview.png";
import { formatDownloadsCount } from "@/utils/helpers/formatDownloadsCount";

export default function CloudDecksPreview() {
  const router = useRouter();
  const { cloudDeckId } = useLocalSearchParams<{ cloudDeckId: string }>();

  const [deckPreview, setDeckPreview] =
    useState<CloudDeckPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!cloudDeckId) return;

      try {
        setIsLoading(true);
        const data = await fetchCloudDeckPreview(cloudDeckId);
        setDeckPreview(data);
      } catch (error) {
        console.error("Ошибка при загрузке превью с сервера:", error);
        Toast.show({
          type: "error",
          text1: "Ошибка загрузки",
          text2: "Не удалось получить данные колоды с сервера",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cloudDeckId]);

  const handleBack = () => {
    router.push("/decks/cloud-decks");
  };

  const updatedTime = getDaysAgoText(deckPreview?.last_synced_at ?? "");
  const formattedDownloads = formatDownloadsCount(deckPreview?.downloaded);

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
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
              <View style={[commonStyles.header, styles.header]}>
                <View style={styles.headerName}>
                  <Pressable onPress={handleBack}>
                    <Image
                      source={ReturnIcon}
                      style={{ width: 12, height: 22 }}
                    />
                  </Pressable>

                  <Typography variant="h1" style={{ marginBottom: 0 }}>
                    Вернуться к колодам
                  </Typography>
                </View>
              </View>

              {/* Информация о колоде */}
              <View style={[commonStyles.mainBox, styles.deckCard]}>
                <View style={styles.deckCardContent}>
                  <View style={styles.purpleLine} />
                  
                  <View style={styles.deckInfo}>
                    <Typography variant="h2" style={styles.deckTitle}>
                      {deckPreview?.name}
                    </Typography>
                    
                    {deckPreview?.description?.trim() && (
                      <Typography 
                        variant="h3" 
      
                      >
                        {deckPreview.description}
                      </Typography>
                    )}
                    
                    <View style={styles.deckMeta}>
                      <Typography 
                        style={styles.metaText}
                        color={colors.darkGray}
                      >
                        Обновлено: {updatedTime}
                      </Typography>
                      
                      <View style={styles.downloadBox}>
                        <Image
                          source={IconDownloadPreview}
                          style={{ width: 8, height: 10 }}
                        />
                        <Typography 
                          style={styles.metaText}
                          color={colors.mainColor}
                        >
                          {formattedDownloads}
                        </Typography>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Секция "Об авторе" */}
              <View style={styles.authorSection}>
                <View style={styles.authorHeader}>
                  <Typography variant="h2">Об авторе</Typography>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}