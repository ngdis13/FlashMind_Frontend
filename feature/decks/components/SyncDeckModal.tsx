import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { Typography } from "@/styles/Typography";
import { MainButton } from "@/components/MainButton";
import { LogoSurprisedStar } from "@/components/LogoSurprised";
import { colors } from "@/styles/Colors";
import { InfoModalLayout } from "@/components/InfoModal";

interface SyncDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Кастомный логотип. По умолчанию LogoSurprisedStar */
  logo?: React.ReactNode;
  /** Заголовок модального окна */
  title?: string;
  /** Серый текст-описание под заголовком */
  description?: string;
  /** Контент между описанием и кнопками (буллеты, доп. текст и т.д.) */
  children?: React.ReactNode;
  /** Текст кнопки подтверждения. По умолчанию "Синхронизировать" */
  confirmText?: string;
  /** Текст кнопки отмены. По умолчанию "Отмена" */
  cancelText?: string;
  /**
   * Обратная совместимость: жёстко заданные сценарии.
   * Если передан — title/description/children игнорируются.
   */
  type?: "author_updated" | "user_updated" | "author_cloud-delete";
}

export const SyncDeckModal = ({
  visible,
  onClose,
  onConfirm,
  logo,
  title,
  description,
  children,
  confirmText = "Синхронизировать",
  cancelText = "Отмена",
  type,
}: SyncDeckModalProps) => {
  const isAuthorUpdated = type === "author_updated";
  const isAuthorDeleteCloud = type === "author_cloud-delete";

  const renderLegacyContent = () => {
    if (isAuthorUpdated) {
      return (
        <View style={{ width: "100%", alignItems: "center" }}>
          <Typography
            variant="h2"
            style={[styles.title, { marginBottom: 2, width: 348 }]}
          >
            Кажется, автор колоды внес изменения!
          </Typography>
          <Typography variant="h2" style={styles.title}>
            Хочешь добавить их к себе?
          </Typography>

          <View style={styles.bulletContainer}>
            <Typography color={colors.darkGray} style={styles.bulletText}>
              ✨ Появятся новые карточки и обновится то, что вы еще не начали
              изучать
            </Typography>
            <Typography color={colors.darkGray} style={styles.bulletText}>
              ✅ Ваш прогресс и созданные вами карточки внутри этой колоды не
              изменятся
            </Typography>
          </View>
        </View>
      );
    }

    if (isAuthorDeleteCloud) {
      return (
        <View style={{ width: "100%", alignItems: "center" }}>
          <Typography
            variant="h2"
            style={[styles.title, { marginBottom: 16, fontWeight: 600 }]}
          >
            Ты действительно хочешь удалить колоду из облака?
          </Typography>

          <View style={styles.bulletContainer}>
            <Typography style={styles.bulletText}>Что произойдет:</Typography>

            <Typography style={styles.bulletText}>
              ❌{" "}
              <Typography variant="h3" style={{ fontWeight: "900" }}>
                Связь разорвется:
              </Typography>{" "}
              у всех подписчиков колода превратится в их личные локальные копии.
            </Typography>

            <Typography style={styles.bulletText}>
              ❌{" "}
              <Typography variant="h3" style={{ fontWeight: "900" }}>
                Обновления прекратятся:
              </Typography>{" "}
              они больше никогда не увидят ваши новые карточки и правки.
            </Typography>

            <Typography style={styles.bulletText}>
              ❌{" "}
              <Typography variant="h3" style={{ fontWeight: "900" }}>
                Пути назад нет:
              </Typography>{" "}
              даже если вы позже снова загрузите колоду в облако, старым
              подписчикам придется добавлять её заново по новой ссылке.
            </Typography>
          </View>
        </View>
      );
    }

    return (
      <View style={{ width: "100%", alignItems: "center" }}>
        <Typography variant="h2" style={styles.title}>
          Ты обновил свою колоду!{"\n"}Хочешь сохранить изменения в облаке?
        </Typography>
        <Typography
          variant="h3"
          color={colors.darkGray}
          style={styles.descriptionText}
        >
          Остальные пользователи увидят обновленную версию колоды
        </Typography>
      </View>
    );
  };

  const renderCustomContent = () => (
    <View style={{ width: "100%", alignItems: "center" }}>
      {title ? (
        <Typography variant="h2" style={styles.title}>
          {title}
        </Typography>
      ) : null}
      {description ? (
        <Typography
          variant="h3"
          color={colors.darkGray}
          style={styles.descriptionText}
        >
          {description}
        </Typography>
      ) : null}
      {children}
    </View>
  );

  return (
    <InfoModalLayout
      visible={visible}
      onClose={onClose}
      containerStyle={{ minHeight: 373, justifyContent: "center" }}
    >
      <View style={styles.logoContainer}>
        {logo || <LogoSurprisedStar size={150} />}
      </View>

      {type !== undefined
        ? renderLegacyContent()
        : renderCustomContent()}

      <MainButton title={confirmText} onPress={onConfirm} />

      <Pressable onPress={onClose} style={styles.cancelButton}>
        <Typography color={colors.mainColor} variant="h2">
          {cancelText}
        </Typography>
      </Pressable>
    </InfoModalLayout>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    width: "100%",
  },
  bulletContainer: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
