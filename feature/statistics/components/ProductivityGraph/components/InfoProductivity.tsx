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

// --------------------------- Пропсы ---------------------------
interface InfoProductivityProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением графика продуктивности по часам.
 * Открывается по кнопке (i) в заголовке блока «Продуктивность».
 */
export const InfoProductivity = ({ visible, onClose }: InfoProductivityProps) => {
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
        {/* Заголовок и вводное описание */}
        <View style={styles.sectionContainer}>
          <Typography variant="span" style={styles.boldText}>
            Продуктивность по часам{" "}
            <Image source={AppEmojis.clock} style={styles.inlineEmojiHeader} />
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот график показывает, в какое время суток твоё обучение проходит
            наиболее эффективно. Вот как правильно его читать:
          </Typography>
        </View>

        {/* Раздел: Откуда берутся проценты */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Откуда берутся проценты:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.target} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Высота столбика (в %) —
                </Typography>{" "}
                это твоя успешность в этот промежуток времени. Она показывает
                долю карточек, которые ты вспомнил сам (ответы «Хорошо» и
                «Легко»), от общего числа повторений за эти часы.
              </Typography>
            </View>
          </View>
        </View>

        {/* Раздел: Как им пользоваться */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Как им пользоваться:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Найди свои пики:
                </Typography>{" "}
                Посмотри на самые высокие столбики. Это твои «золотые часы» —
                время, когда твоя концентрация на максимуме, а память работает
                лучше всего.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.sleep} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Заметил спады?
                </Typography>{" "}
                Самые низкие столбики показывают время, когда ты чаще всего
                забываешь ответы. Возможно, в эти часы твой мозг уже устал или
                ещё не проснулся.
              </Typography>
            </View>
          </View>
        </View>

        {/* Раздел: Рекомендации по обучению */}
        <View style={styles.lastSectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Рекомендации по обучению:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                Старайся переносить изучение самых сложных тем и новых карточек
                на те часы, где у тебя самый высокий процент. Так ты выучишь
                всё гораздо быстрее и потратишь меньше сил!{" "}
                <Image source={AppEmojis.rocket} style={styles.inlineEmoji} />
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
  inlineEmojiHeader: {
    width: 14,
    height: 14
  }
});