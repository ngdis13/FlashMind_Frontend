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
export const InfoActivityTime = ({ visible, onClose }: InfoActivityProps) => {
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
            Как устроен график времени?{" "}
            <Image
              source={AppEmojis.hourglass}
              style={styles.inlineEmoji}
            />{" "}
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот график отображает, сколько минут в день ты тратишь на
            повторение карточек. Вот как правильно его читать и использовать:
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
                <Image
                  source={AppEmojis.tapFinger}
                  style={styles.inlineEmoji}
                />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Нажимай на точки:
                </Typography>{" "}
                Каждая точка на линии — это один день. Нажми на неё, чтобы
                открыть подсказку с точными цифрами.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.arrows} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Листай график:
                </Typography>{" "}
                Проведи пальцем, чтобы увидеть прошлые дни.
              </Typography>
            </View>
          </View>
        </View>

        {/* Раздел: Откуда берётся Успешность */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Что значат цифры в подсказке:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image
                  source={AppEmojis.stopwatch}
                  style={styles.inlineEmoji}
                />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Время (например, 45 мин):
                </Typography>{" "}
                Сколько минут ты уделил учёбе за день.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image
                  source={AppEmojis.lightning}
                  style={styles.inlineEmoji}
                />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Скорость ответа (справа сверху):
                </Typography>{" "}
                Среднее время на одну карточку (в углу).
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Сравнение в скобках (+/-):
                </Typography>{" "}
                Среднее время на одну карточку (в углу).
              </Typography>
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
                  1. Главное — регулярность, а не рекорды:
                </Typography>{" "}
                лучше по 10–15 минут каждый день, чем 2 часа раз в неделю.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2.{" "}
                  <Image
                    source={AppEmojis.warning}
                    style={styles.inlineEmoji}
                  />{" "}
                  Осторожно с резким ростом:
                </Typography>{" "}
                если время резко растёт, притормози с новыми карточками, чтобы
                не выгореть.
              </Typography>
            </View>
          </View>

          <Typography variant="h3" style={styles.boldText}>
            Учись в удовольствие и прокачивай свой мозг каждый день! {""}
             <Image source={AppEmojis.brain} style={styles.inlineEmoji} />
            <Image source={AppEmojis.sparkles} style={styles.inlineEmoji} />
          </Typography>
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
    lineHeight: 15, // Высота строки 15px по вашему стандарту
  },
  // Размер эмодзи 12px
  inlineEmoji: {
    width: 12,
    height: 12,
  },
});
