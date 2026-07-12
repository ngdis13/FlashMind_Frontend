import { colors } from "@/styles/Colors";
import { Typography } from "@/styles/Typography";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import editButton from "@/feature-decks/assets/editButton.png";

/**
 * Пропсы для компонента DecksView
 * @interface DecksViewProps
 * @property {string} title - Название колоды
 * @property {string} cardCount - Количество карточек в колоде (строковое представление)
 * @property {number} cardCountRepeat - Количество повторений карточек
 * @property {() => void} onEditPress - Колбэк при нажатии на кнопку редактирования
 * @property {() => void} onCardPress - Колбэк при нажатии на карточку
 * @property {number} index - Индекс колоды в списке
 * @property {string} color - Цвет для оформления (HEX или название цвета)
 */
interface DecksViewProps {
  title: string;
  cardCount: string;
  cardCountRepeat: number;
  onEditPress: () => void;
  onCardPress: () => void;
  index: number;
  color: string;
}

/**
 * Компонент для отображения колоды карточек в компактном виде на главном экране колод
 *
 * @component
 * @param {DecksViewProps} props - Свойства компонента
 * @param {string} props.title - Название колоды
 * @param {string} props.cardCount - Количество карточек в колоде (в виде строки)
 * @param {number} props.cardCountRepeat - Количество повторений карточек
 * @param {() => void} props.onEditPress - Функция обратного вызова при нажатии на кнопку редактирования
 * @param {() => void} props.onCardPress - Функция обратного вызова при нажатии на карточку
 * @param {number} props.index - Индекс колоды в списке
 * @param {string} props.color - Цветовой код для оформления колоды (HEX или название цвета)
 * @returns {JSX.Element} React компонент карточки колоды
 *
 * @example
 * // Пример использования компонента
 * <DecksView
 *   title="Фрукты"
 *   cardCount="15"
 *   cardCountRepeat={3}
 *   onEditPress={() => console.log('Редактирование колоды')}
 *   onCardPress={() => console.log('Открытие колоды')}
 *   color="#4CAF50"
 * />
 *
 * @description
 * Компонент отображает карточку колоды с:
 * - Цветной полосой сверху
 * - Названием колоды
 * - Количеством карточек
 * - Счетчиком повторений
 * - Кнопкой редактирования
 *
 * При нажатии на карточку срабатывает onCardPress,
 * при нажатии на кнопку редактирования - onEditPress
 */
export default function DecksView({
  title,
  cardCount,
  cardCountRepeat,
  onEditPress,
  onCardPress,
  color,
}: DecksViewProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onCardPress}
      activeOpacity={0.7}
    >
      <View style={[styles.up, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Typography variant="h2" numberOfLines={2}>
          {title}
        </Typography>
      </View>
      <View style={styles.countsContainer}>
        <Typography
          variant="h3"
          color={colors.darkGray}
          style={{ marginBottom: 8 }}
        >
          {cardCount}
        </Typography>

        <View style={styles.bottom}>
          <View style={[styles.countBadge, { backgroundColor: color }]}>
            <Typography
              variant="h3"
              color={colors.white}
              style={styles.extraCountText}
            >
              {cardCountRepeat ? cardCountRepeat : 0}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEditPress();
            }}
          >
            <View style={[styles.countBadgeEdit, { backgroundColor: color }]}>
              <Image
                source={editButton}
                style={{ width: 12, height: 12 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Стили для компонента DecksView
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль для цветной полосы в верхней части карточки
   */
  up: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 15,
    width: "100%",
  },
  /**
   * Стиль основной карточки
   */
  card: {
    flex: 1,
    maxWidth: 182,
    minHeight: 122,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderColor: colors.lightGray,
    borderWidth: 2,
    overflow: "hidden",
  },
  /**
   * Стиль контейнера с количеством карточек
   */
  countsContainer: {
    flexDirection: "column",
    alignSelf: "stretch",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  /**
   * Стиль контейнера с содержимым карточки
   */
  content: {
    flex: 1,
    paddingTop: 23,
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  /**
   * Стиль бейджа с количеством повторений
   */
  countBadge: {
    width: 44,
    height: 18,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * Стиль бейджа с кнопкой редактирования
   */
  countBadgeEdit: {
    width: 24,
    height: 18,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * Стиль разделителя (не используется в текущей версии)
   * @deprecated
   */
  separator: {
    fontSize: 16,
    marginHorizontal: 8,
    color: "#CCCCCC",
  },
  /**
   * Стиль для текста дополнительного количества
   */
  extraCountText: {},
  /**
   * Стиль для кнопки редактирования
   */
  editButton: {
    padding: 8,
    marginLeft: 12,
  },
  /**
   * Стиль для иконки редактирования
   */
  editIcon: {
    fontSize: 20,
  },
  /**
   * Стиль для нижней части карточки с бейджами
   */
  bottom: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
