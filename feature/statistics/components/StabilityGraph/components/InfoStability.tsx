// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, ScrollView, StyleSheet, Image } from "react-native";

// --------------------------- Компоненты ---------------------------
import { InfoModalLayout } from "@/components/InfoModal";
import { MainButton } from "@/components/MainButton";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";

import { AppEmojis } from "@/assets/emoji/emoji";
import { colors } from "@/styles/Colors";

// --------------------------- Пропсы ---------------------------
interface InfoStabilityProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением графика стабильности знаний.
 * Открывается по кнопке (i) в заголовке блока «Аналитика».
 */
export const InfoStability = ({ visible, onClose }: InfoStabilityProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onClose}
      containerStyle={styles.modalContainer}
    >
      <ScrollView
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {/* Заголовок */}
        <View style={styles.sectionContainer}>
          <Typography variant="span" style={styles.boldText}>
            Аналитика стабильности знаний{" "}
            <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />
          </Typography>
        </View>

        {/* Вводное описание */}
        <View style={styles.sectionContainer}>
          <Typography variant="h3" style={styles.bodyText}>
            <Typography variant="h3" style={styles.boldText}>
              Стабильность карточки
            </Typography>{" "}
            — это параметр, который показывает, через сколько дней ты вспомнишь
            её с вероятностью 90%. Как и сложность, её рассчитывает ИИ-алгоритм
            на основе твоих ответов.
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот график показывает, как долго карточки могут храниться в твоей
            памяти без регулярного повторения, и является главным индикатором
            прочности твоих знаний.
          </Typography>
        </View>

        {/* Раздел: Что значат группы */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Что значат группы:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circle]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    1–25 дн.
                  </Typography>{" "}
                  — карточки, которые ты выучил недавно. Они пока требуют частых
                  повторений.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circle]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    25–50 дн.
                  </Typography>{" "}
                  — базовые знания. Материал держится в памяти около месяца.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circle]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    50–100 дн.
                  </Typography>{" "}
                  — надежный фундамент. Ты хорошо помнишь эти карты и не
                  забудешь их несколько месяцев.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circle]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    &gt; 100 дн.
                  </Typography>{" "}
                  — долговременная память. При сложности карточки ниже 3.0 она
                  переходит в статус «Изученные».
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Раздел: Как правильно понимать график */}
        <View style={styles.lastSectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Как правильно понимать график:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  1. <Image source={AppEmojis.calendar} style={styles.inlineEmoji} />{" "} Средняя стабильность (внизу):
                </Typography>{" "}
                Среднее количество дней, которое карточка живет в твоей голове
                без повтора.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2. <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />{" "} Главная цель:
                </Typography>{" "}
                Растить столбик &gt; 100 дн. и поднимать показатель средней
                стабильности. Чем выше эти цифры, тем качественнее твоя учеба в
                долгосрочной перспективе!
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      <MainButton title="Хорошо" onPress={onClose} />
    </InfoModalLayout>
  );
};

// --------------------------- Стили ---------------------------
const styles = StyleSheet.create({
  // Главный контейнер модалки
  modalContainer: {
    maxHeight: "85%",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "flex-start",
  },
  // Стандартный блок с отступом 12px
  sectionContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 12,
  },
  // Последний блок перед кнопкой с отступом 20px
  lastSectionContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  // Контейнер для списков с шагом 8px
  listContainer: {
    width: "100%",
    gap: 8,
  },
  listItem: {
    width: "100%",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  emojiContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  boldText: {
    fontWeight: "700",
  },
  bodyText: {
    lineHeight: 15,
  },
  // Размер эмодзи 12px
  inlineEmoji: {
    width: 12,
    height: 12,
  },
  // Цветные круги для групп стабильности
  colorCircle: {
    width: 4,
    height: 4,
    borderRadius: 6,
    flexShrink: 0,
    marginTop: 1.5,
    top: 3
  },
  circle: {
    backgroundColor: colors.darkMainColor
  }
});