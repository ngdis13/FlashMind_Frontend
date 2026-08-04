// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { Logo } from "@/components/Logo";

// --------------------------- Типы ---------------------------
interface CustomAlertCloudProps {
  visible: boolean;
  /** Основной текст (темный) */
  message: string;
  /** Дополнительный текст 1 (серый, до линии) */
  metaMessage?: string;
  /** Дополнительный текст 2 (серый, после линии) */
  metaMessageBottom?: string;
  /** Текст на кнопке */
  confirmText?: string;
  /** Колбэк на нажатие кнопки */
  onConfirm: () => void;
  /** Колбэк на закрытие (клик вне модалки) */
  onCancel?: () => void;

  // ---------- Настройка иконки ----------
  /** Кастомный компонент иконки вместо Logo */
  iconComponent?: React.ReactNode;
  /** Отключает иконку полностью */
  hideIcon?: boolean;
  /** Размер иконки (только для дефолтного Logo) */
  iconSize?: number;

  // ---------- Настройка линии ----------
  /** Показывать ли разделительную линию */
  showLine?: boolean;
  /** Стиль для линии */
  lineStyle?: object;

  // ---------- Настройка текста ----------
  /** Стиль для основного текста (темного) */
  messageTextStyle?: object;
  /** Стиль для дополнительного текста 1 (серого, до линии) */
  metaTextStyle?: object;
  /** Стиль для дополнительного текста 2 (серого, после линии) */
  metaTextBottomStyle?: object;

  // ---------- Настройка контейнера ----------
  /** Кастомная ширина модалки */
  containerWidth?: number;
  /** Кастомные отступы */
  containerPadding?: object;
}

// --------------------------- Компонент ---------------------------
export const CustomAlertCloud = ({
  visible,
  message,
  metaMessage,
  metaMessageBottom,
  confirmText = "Понятно",
  onConfirm,
  onCancel,
  iconComponent,
  hideIcon = false,
  iconSize = 128,
  showLine = false,
  lineStyle,
  messageTextStyle,
  metaTextStyle,
  metaTextBottomStyle,
  containerWidth = 370,
  containerPadding,
}: CustomAlertCloudProps) => {
  const renderIcon = () => {
    if (hideIcon) return null;

    if (iconComponent) {
      return iconComponent;
    }

    return <Logo size={iconSize} />;
  };

  const renderLine = () => {
    if (!showLine) return null;

    return <View style={[styles.line, lineStyle]} />;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.alertContainer,
                { width: containerWidth },
                containerPadding && { ...containerPadding },
              ]}
            >
              {/* Иконка (если есть) */}
              {!hideIcon && (
                <View style={styles.iconContainer}>{renderIcon()}</View>
              )}

              {/* Основной текст (темный) */}
              <Typography
                variant="h2"
                style={[styles.messageText, messageTextStyle]}
              >
                {message}
              </Typography>

              {/* Дополнительный текст 1 (серый, до линии) */}
              {metaMessage && (
                <Typography
                  variant="h3"
                  style={[
                    styles.metaText,
                    metaTextStyle,
                    showLine && styles.metaTextWithLine,
                  ]}
                >
                  {metaMessage}
                </Typography>
              )}

              {/* Линия (если включена) */}
              {renderLine()}

              {/* Дополнительный текст 2 (серый, после линии) */}
              {metaMessageBottom && (
                <Typography
                  variant="h3"
                  style={[styles.metaTextBottom, metaTextBottomStyle]}
                >
                  {metaMessageBottom}
                </Typography>
              )}

              {/* Кнопка */}
              <View style={styles.buttonContainer}>
                <MainButton title={confirmText} onPress={onConfirm} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --------------------------- Стили ---------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 45,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  messageText: {
    textAlign: "center",
    marginBottom: 8,
  },
  metaText: {
    textAlign: "center",
    marginBottom: 12,
  },
  metaTextWithLine: {
    marginBottom: 16,
  },
  metaTextBottom: {
    textAlign: "center",
    color: colors.darkGray,
    marginBottom: 16,
  },
  line: {
    height: 1,
    backgroundColor: colors.mainColor,
    marginBottom: 12,
    marginHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
  },
});
