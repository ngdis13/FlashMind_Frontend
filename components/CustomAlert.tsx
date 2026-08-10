// components/CustomAlert.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";
import { InfoModalLayout } from "@/components/InfoModal";

interface CustomAlertProps {
  visible: boolean;
  message: string;
  confirmText?: string; // Текст для главной кнопки
  cancelText?: string; // Текст для кнопки отмены
  onConfirm: () => void;
  onCancel: () => void;
  // Пропс для передачи любой иконки/картинки (React-компонент)
  icon?: React.ReactNode;
}

/**
 * Универсальный модальный компонент CustomAlert для отображения диалоговых окон.
 * Поддерживает кастомный текст кнопок, кастомные иконки/картинки и закрытие по тапу на оверлей.
 *
 * @component
 * @example
 * ```tsx
 * <CustomAlert
 *   visible={true}
 *   message="Удалить этот элемент?"
 *   confirmText="Да, удалить"
 *   cancelText="Отмена"
 *   onConfirm={() => console.log('Удалено')}
 *   onCancel={() => console.log('Отменено')}
 *   icon={<LogoSadStar size={128} />}
 * />
 * ```
 *
 * @param {Object} props - Свойства компонента.
 * @param {boolean} props.visible - Флаг видимости модального окна.
 * @param {string} props.message - Текст сообщения (заголовок) внутри алерта.
 * @param {string} [props.confirmText="Подтвердить"] - Текст для главной (активной) кнопки.
 * @param {string} [props.cancelText="Отмена"] - Текст для второстепенной кнопки (отмены).
 * @param {() => void} props.onConfirm - Функция обратного вызова при нажатии на главную кнопку.
 * @param {() => void} props.onCancel - Функция обратного вызова при нажатии на кнопку отмены или оверлей.
 * @param {React.ReactNode} [props.icon] - React-компонент иконки или изображения, отображаемый над текстом. Если не передан, блок скрывается.
 *
 * @returns {React.JSX.Element} Рендерит модальное окно поверх текущего экрана.
 */
export const CustomAlert = ({
  visible,
  message,
  confirmText = "Подтвердить", // Дефолтный текст
  cancelText = "Отмена", // Дефолтный текст
  onConfirm,
  onCancel,
  icon, // Принимаем иконку как пропс
}: CustomAlertProps) => {
  return (
    <InfoModalLayout
      visible={visible}
      onClose={onCancel}
      containerStyle={{ padding: 24 }}
    >
      {/* Рендерим иконку только если она передана */}
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Typography
        variant="h2"
        style={{ textAlign: "center", marginBottom: 12 }}
      >
        {message}
      </Typography>

      <View style={styles.buttonContainer}>
        {/* Используем динамический текст из пропсов */}
        <MainButton title={confirmText} onPress={onConfirm} />
        <SecondButton title={cancelText} onPress={onCancel} />
      </View>
    </InfoModalLayout>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  buttonContainer: {
    justifyContent: "space-between",
    gap: 12,
  },
});
