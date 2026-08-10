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
interface InfoActivityProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением графиков активности.
 * Открывается по кнопке (i) в заголовке блока «Активность».
 */
export const InfoActivityCards = ({ visible, onClose }: InfoActivityProps) => {
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
            Как устроен график активности?{" "}
            <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />{" "}
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот график отображает, сколько повторений карточек у тебя было по
            дням и с какой успешностью ты с ними справился. Вот как правильно
            его читать и использовать:
          </Typography>
        </View>

        {/* Раздел: Управление */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Управление:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.tapFinger} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Нажимай на столбики:
                </Typography>{" "}
                Каждый столбик — это один день. Нажми на любой из них, чтобы
                открыть подробную подсказку с точными цифрами за этот день.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.arrows} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Листай график:
                </Typography>{" "}
                Если хочешь посмотреть свою историю за прошлые недели, просто
                скролли вбок (проведи пальцем влево или вправо по графику).
              </Typography>
            </View>
          </View>
        </View>

        {/* Раздел: Откуда берётся Успешность */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Откуда берётся «Успешность»?
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            <Typography variant="h3" style={styles.boldText}>
              <Image source={AppEmojis.target} style={styles.inlineEmoji} />{" "}
              Процент успешности (в подсказке)
            </Typography>{" "}
            — это доля карточек, которые ты вспомнил сам (ответы «Хорошо» и
            «Легко»). Ответы «Сложно» и «Забыл» в этот процент не входят. Чем
            выше этот показатель, тем качественнее знания закрепились в голове!
          </Typography>
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
                  1. Следи за ростом:
                </Typography>{" "}
                чем выше столбик, тем больше карточек ты разобрал за день!
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2. Уменьшай красное:
                </Typography>{" "}
                твоя главная цель — превращать красные блоки в зеленые.
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
    lineHeight: 15,    // Высота строки 15px по вашему стандарту
  },
  // Размер эмодзи 12px
  inlineEmoji: {
    width: 12,
    height: 12,
  },
});
