// --------------------------- React ---------------------------
import React from "react";

// --------------------------- React Native ---------------------------
import { View, StyleSheet, Pressable } from "react-native";

// --------------------------- Стили ---------------------------
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

// --------------------------- Компоненты ---------------------------
import { MainButton } from "@/components/MainButton";
import { LogoCuteStar } from "@/components/LogoCuteStar";

/**
 * Пропсы для компонента BecomeAuthorModalContent
 */
interface BecomeAuthorModalContentProps {
  /** Колбэк при подтверждении «Стать автором» */
  onConfirm: () => void;
  /** Колбэк при отмене (закрытие модалки) */
  onClose: () => void;
  /** Флаг загрузки (запрос выполняется) */
  isLoading: boolean;
}

/**
 * Контент подтверждения становления автором колоды.
 *
 * Рендерится внутри существующего модального окна ShareDeckModal
 * на втором шаге для не-автора.
 */
export const BecomeAuthorModalContent = ({
  onConfirm,
  onClose,
  isLoading,
}: BecomeAuthorModalContentProps) => {
  const handleClose = (): void => {
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LogoCuteStar size={140} />
      </View>

      <Typography variant="h2" style={styles.title}>
        Доступ к колоде
      </Typography>

      <Typography variant="h3" style={styles.subtitle}>
        Вы внесли много изменений. Теперь вы можете стать полноправным автором
        этой версии.
      </Typography>

      {/* Список изменений/возможностей */}
      <View style={styles.bulletSection}>
        <Typography variant="h3" style={styles.sectionTitle}>
          Что произойдет:
        </Typography>

        <View style={styles.bulletItem}>
          <Typography variant="h3" style={styles.bulletText}>
            ✅ Ваши локальные карточки и изменения сохранятся и станут
            облачными.
          </Typography>
        </View>

        <View style={styles.bulletItem}>
          <Typography variant="h3" style={styles.bulletText}>
            ✅ Вы сможете делиться этой колодой с друзьями, и они будут
            автоматически получать ваши будущие обновления.
          </Typography>
        </View>
      </View>

      {/* Блок важного предупреждения */}
      <View style={styles.warningContainer}>
        <View style={styles.warningHeader}>
          <Typography variant="h3" style={styles.warningHeaderText}>
            ⚠️ Важное предупреждение:
          </Typography>
        </View>
        <Typography variant="h3" >
          Ваша новая колода потеряет связь с оригинальной версией автора. Вы
          перестанете получать обновления от предыдущего создателя, и ваши
          изменения не будут видны ему.
        </Typography>
      </View>

      {/* Кнопки управления */}
      <MainButton
        title={isLoading ? "Сохранение..." : "Подтвердить"}
        onPress={onConfirm}
        disabled={isLoading}
        style={styles.confirmButton}
      />

      <Pressable onPress={handleClose} style={styles.cancelButton}>
        <Typography variant="h2" color={colors.mainColor}>
          Отмена
        </Typography>
      </Pressable>
    </View>
  );
};

// --------------------------- Стили ---------------------------
const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  logoContainer: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  bulletSection: {
    width: "100%",
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  bulletText: {
    lineHeight: 20,
  },
  warningContainer: {
    width: "100%",
    backgroundColor: "#FFF5F5", // Нежно-розовый фон плашки
    borderWidth: 2,
    borderColor: "#FB8B93", // Светло-красная граница
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningHeaderText: {
    fontWeight: 800,
  },
  confirmButton: {
    width: "100%",
    marginBottom: 16,
  },
  cancelButton: {
    alignSelf: "center",
  },
});
