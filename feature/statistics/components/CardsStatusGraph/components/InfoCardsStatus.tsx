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
interface InfoCardsStatusProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением диаграммы статусов карточек.
 * Открывается по кнопке (i) в заголовке блока «Статистика».
 */
export const InfoCardsStatus = ({ visible, onClose }: InfoCardsStatusProps) => {
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
            Твой прогресс обучения{" "}
            <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Диаграмма показывает, как ваши карточки распределены по этапам
            запоминания. Это помогает оценить объем усвоенных знаний и
            правильно спланировать нагрузку.
          </Typography>
        </View>

        {/* Раздел: Классификация статусов */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Классификация статусов:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleNew]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    Новые
                  </Typography>{" "}
                  — карточки, которые есть в колоде, но вы еще не добавили их в
                  процесс обучения.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleLearning]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    Изучаемые
                  </Typography>{" "}
                  — карточки, которые находятся на интервальном повторении, но
                  еще не достигли показателей изученных.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleLearned]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    Изученные
                  </Typography>{" "}
                  — карточки с низкой сложностью, которые вы вспомните через 100
                  дней с вероятностью более 90%.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circlePostponed]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    Отложенные
                  </Typography>{" "}
                  — карточки, которые ты вручную поставил на паузу. Они временно
                  скрыты и не появятся в обучении, пока ты сам их не вернёшь.
                </Typography>
              </View>
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
                <Typography variant="h3" style={styles.boldText}>
                  1. Фокус на качестве:
                </Typography>{" "}
                Главная цель — постепенный перевод карточек из желтого сектора в
                зеленый.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2. Контроль нагрузки:
                </Typography>{" "}
                Если сегмент «Изучаемые» слишком большой, временно не добавляйте
                «Новые» карточки. Сначала закрепите текущий материал.
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
  // Цветные круги для статусов
  colorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
    marginTop: 1.5, // Смещение для выравнивания с первой строкой текста
  },
  circleNew: {
    backgroundColor: colors.statusColorGrey, // Синий
  },
  circleLearning: {
    backgroundColor: colors.statusColorYellow, // Желтый
  },
  circleLearned: {
    backgroundColor: colors.statusColorGreen, // Зеленый
  },
  circlePostponed: {
    backgroundColor: colors.statusColorRed, // Красный
  },
});