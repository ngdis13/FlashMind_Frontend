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
interface InfoDifficultyProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением графика сложности карточек.
 * Открывается по кнопке (i) в заголовке блока «Все колоды».
 */
export const InfoDifficulty = ({ visible, onClose }: InfoDifficultyProps) => {
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
            Аналитика сложности карточек{" "}
            <Image source={AppEmojis.barChart} style={styles.inlineEmoji} />
          </Typography>
        </View>

        {/* Вводное описание */}
        <View style={styles.sectionContainer}>
          <Typography variant="h3" style={styles.bodyText}>
            <Typography variant="h3" style={styles.boldText}>
              Сложность карточки
            </Typography>{" "}
            — это параметр, который показывает, насколько тяжело тебе её
            усвоить. Его рассчитывает ИИ-алгоритм на основе твоих ответов.
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот показатель напрямую влияет на интервалы повторений:{" "}
            <Typography variant="h3" style={styles.boldText}>
              лёгкие {""}
            </Typography>
            карточки будут расти в интервалах очень быстро, а {""}
            <Typography variant="h3" style={styles.boldText}>
              сложные —
            </Typography>
            медленно.
          </Typography>
        </View>

        {/* Раздел: Что значат группы на графике */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Что значат группы на графике:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleEasy]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    1-3 (Легкие):
                  </Typography>{" "}
                  Карточки, которые ты вспоминаешь мгновенно.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleMedium]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    4-6 (Средние):
                  </Typography>{" "}
                  Материал усваивается стабильно, но для ответа приходится
                  немного подумать.
                </Typography>
              </View>
            </View>

            <View style={styles.listItem}>
              <View style={styles.rowContainer}>
                <View style={[styles.colorCircle, styles.circleHard]} />
                <Typography variant="h3" style={styles.bodyText}>
                  <Typography variant="h3" style={styles.boldText}>
                    7-9+ (Тяжелые):
                  </Typography>{" "}
                  Твоя «зона риска». Это карточки, которые ты регулярно
                  забываешь. Они требуют больше всего усилий.
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
                  1.{" "}
                  <Image
                    source={AppEmojis.chartDown}
                    style={styles.inlineEmoji}
                  />{" "}
                  Средняя сложность (внизу):
                </Typography>{" "}
                Твой общий балл. Чем он выше, тем сложнее тебе учиться.{" "}
              </Typography>
              <Typography variant="h3" style={[styles.boldText, {fontStyle: "italic"} ]}>
                <Image source={AppEmojis.warning} style={[styles.inlineEmoji, { marginTop: 2, top: 1 }]} />{" "}
                Важно:{" "}
                <Typography variant="h3" style={{ fontStyle: "italic", fontWeight: "normal" }}>
                  чем выше сложность карточки, тем медленнее растет её
                  стабильность.
                </Typography>
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2.{" "}
                  <Image source={AppEmojis.tools} style={styles.inlineEmoji} />{" "}
                  Разгружай красную зону:
                </Typography>
                Повторяй сложные карточки вне обучения или разбей их на более
                простые. Если сложных карточек много, они будут тормозить весь
                прогресс.
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
  // Цветные круги для групп сложности
  colorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
    marginTop: 1.5,
  },
  circleEasy: {
    backgroundColor: colors.statusColorGreen, // Зеленый
  },
  circleMedium: {
    backgroundColor: colors.statusColorYellow, // Желтый
  },
  circleHard: {
    backgroundColor: colors.statusColorRed, // Красный
  },
});
