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

/**
 * Пропсы для компонента CustomAlertCloud
 * @interface CustomAlertCloudProps
 * @property {boolean} visible - Управляет видимостью модального окна
 * @property {string} message - Основное сообщение алерта
 * @property {string} metaMessage - Дополнительное сообщение алерта
 * @property {string} [confirmText] - Текст кнопки подтверждения (по умолчанию "Понятно")
 * @property {() => void} onConfirm - Колбэк при нажатии на кнопку подтверждения
 * @property {() => void} onCancel - Колбэк при закрытии модального окна
 */
interface CustomAlertCloudProps {
  visible: boolean;
  message: string;
  metaMessage: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Компонент модального окна для отображения информационных сообщений
 * 
 * @component
 * @param {CustomAlertCloudProps} props - Свойства компонента
 * @param {boolean} props.visible - Управляет видимостью модального окна
 * @param {string} props.message - Основное сообщение алерта
 * @param {string} props.metaMessage - Дополнительное сообщение алерта
 * @param {string} [props.confirmText="Понятно"] - Текст кнопки подтверждения
 * @param {() => void} props.onConfirm - Колбэк при нажатии на кнопку подтверждения
 * @param {() => void} props.onCancel - Колбэк при закрытии модального окна
 * @returns {JSX.Element} React компонент модального алерта
 * 
 * @description
 * Компонент отображает модальное окно с:
 * - Логотипом в верхней части
 * - Основным сообщением
 * - Дополнительным сообщением
 * - Кнопкой подтверждения
 * - Полупрозрачным фоном
 * - Анимацией появления (fade)
 * - Закрытием при нажатии на фон
 * 
 * @example
 * // Использование алерта
 * <CustomAlertCloud
 *   visible={isModalVisible}
 *   message="Колода синхронизирована"
 *   metaMessage="На этой колоде установлена самая свежая версия"
 *   confirmText="Понятно"
 *   onConfirm={() => setIsModalVisible(false)}
 *   onCancel={() => setIsModalVisible(false)}
 * />
 */
export const CustomAlertCloud = ({
  visible,
  message,
  metaMessage,
  confirmText = "Понятно", // Изменено на дефолт из дизайна
  onConfirm,
  onCancel,
}: CustomAlertCloudProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          {/* Важно: останавливаем клики по самому алерту */}
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.alertContainer}>
              <View style={styles.iconContainer}>
                <Logo size={128} />
              </View>

              <Typography variant="h2" style={styles.messageText}>
                {message}
              </Typography>

              <Typography variant="h3" style={styles.metaText}>
                {metaMessage}
              </Typography>

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
/**
 * Стили для компонента CustomAlertCloud
 * @constant
 */
const styles = StyleSheet.create({
  /**
   * Стиль полупрозрачного фона, перекрывающего весь экран
   */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Отрегулирован оверлей
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * Стиль контейнера алерта с белым фоном и скругленными углами
   */
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28, 
    paddingHorizontal: 16, 
    paddingTop: 45,
    paddingBottom: 45,
    width: 370
  
  },
  /**
   * Стиль контейнера для иконки/логотипа
   */
  iconContainer: {
    alignItems: "center",
    marginBottom: 16, 
  },
  /**
   * Стиль основного текста сообщения
   */
  messageText: {
    textAlign: "center",
    marginBottom: 4, 
  },
  /**
   * Стиль дополнительного текста сообщения
   */
  metaText: {
    textAlign: "center",
    color: colors.darkGray, 
    marginBottom: 24, 
    paddingHorizontal: 10,
  },
  /**
   * Стиль контейнера для кнопки
   */
  buttonContainer: {
    width: "100%",
  },
});