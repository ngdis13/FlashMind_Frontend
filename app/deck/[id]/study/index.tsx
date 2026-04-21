import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { Pressable, View, Image } from "react-native";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import IconInfo from "./assets/icon/IconInfo.png";
import IconPlus from "./assets/icon/IconPlus.png";
import IconMinus from "./assets/icon/IconMinus.png";
import { useDecks } from "@/storage/hooks/useDecks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styles } from "./style/styles";
import { MainButton } from "@/components/MainButton";
import { useEffect, useState } from "react";
import { getStudyInfo, StudyResponse } from "./api/api";

export default function StudyDecksScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { decks } = useDecks();
  const deck = decks.find((d) => d.id === id);

  const [studyData, setStudyData] = useState<StudyResponse | null>(null);
  const [addCount, setAddCount] = useState(0);

  const handleBack = () => router.back();
  const handleStartStudy = () => {
      router.push({
    pathname: `/deck/${id}/study/process`,
    params: { addCount: addCount } 
  });
  };

  useEffect(() => {
    if (id) {
      getStudyInfo(id as string).then((data) => {
        setStudyData(data);
      });
    }
  }, [id]);
  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 30 }]}>
      <View style={{ flex: 1 }}>
        <View style={[commonStyles.mainContent, styles.mainContent]}>
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
            </Pressable>

            <Typography variant="h1">{deck?.name}</Typography>
          </View>

          <View style={[commonStyles.mainBox, { gap: 24 }]}>
            <View style={styles.infoLine}>
              <Typography variant="h2">Всего карточек</Typography>
              <Typography variant="h2">{studyData?.total}</Typography>
            </View>
            <View style={styles.infoLine}>
              <Typography variant="h2">Новые</Typography>
              <Typography variant="h2">{studyData?.learning_today}</Typography>
            </View>
            <View style={styles.infoLine}>
              <Typography variant="h2">Изучено</Typography>
              <Typography variant="h2">{studyData?.learned}</Typography>
            </View>
            <View style={styles.infoLine}>
              <Typography variant="h2">Не изучено</Typography>
              <Typography variant="h2">{studyData?.in_learning}</Typography>
            </View>
            <View style={[styles.infoLine, { paddingEnd: 0 }]}>
              <View style={styles.infoContent}>
                <Typography variant="h2">Добавить к изучению</Typography>
                <Image source={IconInfo} style={{ width: 20, height: 20 }} />
              </View>
              <View style={styles.counter}>
                <Pressable
                  onPress={() => setAddCount(prev => Math.max(0, (prev ?? 0) - 1))}
                >
                  <Image source={IconMinus} style={{ width: 21, height: 20 }} />
                </Pressable>

                <Typography variant="h2">{addCount}</Typography>
                <Pressable onPress={() => setAddCount((prev) => prev + 1)}>
                  <Image source={IconPlus} style={{ width: 21, height: 20 }} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>

      <MainButton
        style={styles.startButton}
        title="Старт"
        onPress={handleStartStudy}
        disabled={!studyData}
      />
    </View>
  );
}
