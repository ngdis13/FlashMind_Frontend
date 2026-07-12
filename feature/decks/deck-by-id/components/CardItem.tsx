// --------------------------- React ---------------------------
import React, { useState } from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  Pressable,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";

// --------------------------- Компоненты ---------------------------
import { CustomAlert } from "@/components/CustomAlert";
import { LogoSadStar } from "@/components/LogoSadStar";

// --------------------------- Ассеты ---------------------------
import DeleteIcon from "@/assets/icons/DeleteIcon.png";

/**
 * Пропсы для компонента CardItem
 * @interface CardItemProps
 * @property {string} id - Уникальный идентификатор карточки
 * @property {string} front - Текст на лицевой стороне карточки
 * @property {string} [back] - Текст на обратной стороне карточки (опционально)
 * @property {string} [deckId] - ID колоды, к которой принадлежит карточка (опционально)
 * @property {number} [index] - Индекс карточки в списке (опционально)
 * @property {number} [difficulty] - Уровень сложности карточки (опционально)
 * @property {"compact" | "expanded"} [viewMode] - Режим отображения: компактный или расширенный
 * @property {(id: string, deckId?: string) => void} [onPress] - Колбэк при нажатии на карточку
 * @property {(id: string, deckId?: string) => void} onDelete - Колбэк при удалении карточки
 * @property {StyleProp<ViewStyle>} [style] - Дополнительные стили для компонента
 */
interface CardItemProps {
  id: string;
  front: string;
  back?: string;
  deckId?: string;
  index?: number;
  difficulty?: number;
  viewMode?: "compact" | "expanded";
  onPress?: (id: string, deckId?: string) => void;
  onDelete: (id: string, deckId?: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Компонент для отображения карточки в списке
 * 
 * @component
 * @param {CardItemProps} props - Свойства компонента
 * @param {string} props.id - Уникальный идентификатор карточки
 * @param {string} props.front - Текст на лицевой стороне карточки
 * @param {string} [props.back] - Текст на обратной стороне карточки
 * @param {string} [props.deckId] - ID колоды карточки
 * @param {number} [props.index] - Индекс в списке
 * @param {number} [props.difficulty] - Уровень сложности (влияет на цвет рамки)
 * @param {"compact" | "expanded"} [props.viewMode="compact"] - Режим отображения
 * @param {(id: string, deckId?: string) => void} [props.onPress] - Обработчик нажатия
 * @param {(id: string, deckId?: string) => void} props.onDelete - Обработчик удаления
 * @param {StyleProp<ViewStyle>} [props.style] - Дополнительные стили
 * @returns {JSX.Element} React компонент карточки
 * 
 * @description
 * Компонент отображает карточку с:
 * - Текстом на лицевой стороне
 * - Цветной рамкой в зависимости от сложности
 * - Кнопкой удаления с подтверждением
 * - Модальным окном подтверждения удаления
 * 
 * @example
 * // Базовое использование
 * <CardItem
 *   id="card-1"
 *   front="Приветствие"
 *   back="Hello"
 *   deckId="deck-1"
 *   difficulty={5}
 *   onPress={(id) => console.log('Карточка нажата', id)}
 *   onDelete={(id) => console.log('Карточка удалена', id)}
 * />
 */
export const CardItem = ({
  id,
  front,
  back,
  deckId,
  index,
  difficulty,
  viewMode = "compact",
  onPress,
  onDelete,
  style,
}: CardItemProps) => {
  // --------------------------- Состояния ---------------------------
  const [alertVisible, setAlertVisible] = useState<boolean>(false);

  // --------------------------- Вспомогательные функции ---------------------------
  /**
   * Определяет цвет рамки карточки в зависимости от сложности
   * 
   * @param {number | string | null | undefined} diff - Уровень сложности
   * @returns {string} HEX-код цвета рамки
   * 
   * @description
   * Цветовая схема:
   * - Отсутствует/не указан: #DBDBDB (серый)
   * - 0-3: #7EE083 (зеленый) - легкая
   * - 4-8: #FFC39B (оранжевый) - средняя
   * - >8: #FB8B93 (красный) - сложная
   */
  const getBorderColor = (diff: number | string | null | undefined): string => {
    if (diff === "none" || diff === null || diff === undefined || diff === "") {
      return "#DBDBDB";
    }
    const numericDiff = Number(diff);
    if (isNaN(numericDiff)) {
      return "#DBDBDB";
    }
    if (numericDiff <= 3) return "#7EE083"; 
    if (numericDiff <= 8) return "#FFC39B"; 
    return "#FB8B93";
  };

  // --------------------------- Обработчики ---------------------------
  /**
   * Обрабатывает нажатие на карточку
   * Вызывает колбэк onPress с ID карточки и ID колоды
   */
  const handlePress = (): void => {
    onPress?.(id, deckId);
  };

  /**
   * Открывает модальное окно подтверждения удаления
   */
  const handleDeletePress = (): void => {
    setAlertVisible(true);
  };

  /**
   * Подтверждает удаление карточки
   * Закрывает модальное окно и вызывает колбэк onDelete
   */
  const handleConfirmDelete = (): void => {
    setAlertVisible(false);
    onDelete?.(id, deckId);
  };

  /**
   * Отменяет удаление карточки
   * Закрывает модальное окно
   */
  const handleCancelDelete = (): void => {
    setAlertVisible(false);
  };

  // --------------------------- Отрисовка ---------------------------
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { borderColor: getBorderColor(difficulty) }, style]}
    >
      <View style={styles.textContainer}>
        <Typography variant="h2" numberOfLines={2}>
          {front}
        </Typography>
      </View>

      <Pressable
        onPress={handleDeletePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.deleteButton}
      >
        <Image source={DeleteIcon} style={styles.deleteIcon} />
      </Pressable>

      <CustomAlert
        visible={alertVisible}
        message="Ты действительно хочешь удалить карточку?"
        confirmText="Удалить"
        cancelText="Вернуться к карточкам"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        icon={<LogoSadStar size={128} />}
      />
    </TouchableOpacity>
  );
};

// --------------------------- Стили ---------------------------
/**
 * Стили для компонента CardItem
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль основной карточки
   */
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  /**
   * Стиль контейнера с текстом карточки
   */
  textContainer: {
    flex: 1,
  },
  /**
   * Стиль кнопки удаления
   * Содержит отступы для увеличения области клика
   */
  deleteButton: {
    padding: 4, // Увеличивает область клика внутри карточки
  },
  /**
   * Стиль иконки удаления
   */
  deleteIcon: {
    width: 24,
    height: 24,
  },
});