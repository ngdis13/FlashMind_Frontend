// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  type ViewStyle,
  type StyleProp,
} from "react-native";

// --------------------------- Интерфейс пропсов ---------------------------
interface InfoModalLayoutProps {
  /** Управляет видимостью модального окна */
  visible: boolean;
  /** Колбэк при закрытии (тап по оверлею или аппаратная кнопка "назад") */
  onClose: () => void;
  /** Содержимое модального окна */
  children: React.ReactNode;
  /** Дополнительные стили для контейнера (например, если нужен другой borderRadius или padding) */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Общая оболочка для всех модальных окон в приложении.
 *
 * Предоставляет единообразные:
 * - Затемнённый оверлей (backgroundColor: rgba(0,0,0,0.4))
 * - Закрытие по тапу на оверлей
 * - Белый контейнер со скруглёнными углами (borderRadius: 24) и тенью
 * - Анимацию появления (fade)
 * - Блокировку закрытия при тапе на сам контент
 *
 * @component
 * @example
 * ```tsx
 * <InfoModalLayout visible={isVisible} onClose={() => setIsVisible(false)}>
 *   <Typography variant="h2">Заголовок</Typography>
 *   <MainButton title="OK" onPress={handleOk} />
 * </InfoModalLayout>
 * ```
 */
export const InfoModalLayout = ({
  visible,
  onClose,
  children,
  containerStyle,
}: InfoModalLayoutProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Внешний слой — закрытие по тапу на оверлей */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Внутренний слой — предотвращает закрытие при тапе на контент */}
          <TouchableWithoutFeedback>
            <View style={[styles.container, containerStyle]}>
              {children}
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
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 12,
    minWidth: 320,
    width: "100%",
    maxWidth: 373,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
