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
interface InfoForecastProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с пояснением графика прогноза повторений.
 * Открывается по кнопке (i) в заголовке блока «Аналитика».
 */
export const InfoForecast = ({ visible, onClose }: InfoForecastProps) => {
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
            Аналитика прогноза повторений{" "}
            <Image source={AppEmojis.chartUp} style={styles.inlineEmoji} />
          </Typography>
          <Typography variant="h3" style={styles.bodyText}>
            Этот график показывает распределение повторов всех твоих карточек в
            обучении на 6 месяцев вперед.
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
                Кликни, чтобы увидеть дату и число карт.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.arrows} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Листай график:
                </Typography>{" "}
                Проведи пальцем, чтобы заглянуть в будущее.
              </Typography>
            </View>
          </View>
        </View>

        {/* Раздел: Что значат цифры внизу */}
        <View style={styles.sectionContainer}>
          <Typography variant="p" style={styles.boldText}>
            Что значат цифры внизу:
          </Typography>
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.box} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Всего карт:
                </Typography>{" "}
                Все карточки в режиме обучения.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.calendar} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  В среднем за день:
                </Typography>{" "}
                Твоя базовая ежедневная норма повторений, на которую стоит
                ориентироваться.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.hourglass} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  На завтра:
                </Typography>{" "}
                Точное количество карточек, которое алгоритм выдаст тебе для
                разбора в следующий календарный день.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Image source={AppEmojis.warning} style={styles.inlineEmoji} />{" "}
                <Typography variant="h3" style={styles.boldText}>
                  Важно:
                </Typography>{" "}
                здесь учитываются только те карточки, которые уже находятся в
                обучении, новые карты из колоды в этом прогнозе не отображаются.
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
                  1. <Image source={AppEmojis.chartDown} style={styles.inlineEmoji}/> Спад и распределение:
                </Typography>{" "}
                График плавно идёт вниз — это нормально. Он точно показывает
                карты на завтра, но после их прохождения часть карточек
                автоматически перенесётся дальше.
              </Typography>
            </View>

            <View style={styles.listItem}>
              <Typography variant="h3" style={styles.bodyText}>
                <Typography variant="h3" style={styles.boldText}>
                  2. <Image source={AppEmojis.warning} style={styles.inlineEmoji} /> Контроль нагрузки:
                </Typography>{" "}
                Ориентируйся на ближайшие столбцы: если они слишком высокие,
                временно не добавляй новые карты, пока текущие не уйдут на
                длинные интервалы. Главное — чтобы цифра «На завтра» не
                превышала твой комфортный лимит.
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
});