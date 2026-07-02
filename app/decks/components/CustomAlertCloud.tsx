// components/CustomAlert.tsx
import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { Logo } from "@/components/Logo";
import { colors } from "@/styles/Colors";

interface CustomAlertCloudProps {
  visible: boolean;
  message: string;
  metaMessage: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Отрегулирован оверлей
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20, 
    borderColor: colors.lightGray,
    borderWidth: 2,
    paddingHorizontal: 10, 
    paddingTop: 45,
    paddingBottom: 45,
    minWidth: 370, 
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16, 
  },
  messageText: {
    textAlign: "center",
    marginBottom: 4, 
  },
  metaText: {
    textAlign: "center",
    color: colors.darkGray, 
    marginBottom: 24, 
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
  },
});
