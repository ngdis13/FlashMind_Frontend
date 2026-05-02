// components/CustomAlert.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";
import { Logo } from "@/components/Logo";
import { MainButton } from "@/components/MainButton";
import { SecondButton } from "@/components/SecondButton";

interface CustomAlertProps {
  visible: boolean;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export const CustomAlert = ({
  visible,
  message,
  confirmText = "Удалить",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
  type = "danger",
}: CustomAlertProps) => {
  const getConfirmButtonStyle = () => {
    switch (type) {
      case "danger":
        return styles.dangerButton;
      case "warning":
        return styles.warningButton;
      default:
        return styles.infoButton;
    }
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
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={styles.iconContainer}>
                <Logo size={128} />
              </View>
              <Typography
                variant="h2"
                style={{ textAlign: "center", marginBottom: 12 }}
              >
                {message}
              </Typography>

              <View style={styles.buttonContainer}>
                <MainButton title="Удалить" onPress={onConfirm} />
                <SecondButton title="Вернуться к карточкам" onPress={onCancel} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxWidth: 373,
    maxHeight: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  buttonContainer: {
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  dangerButton: {
    backgroundColor: "#FF4444",
  },
  warningButton: {
    backgroundColor: "#FFA500",
  },
  infoButton: {
    backgroundColor: colors.darkMainColor,
  },
});
