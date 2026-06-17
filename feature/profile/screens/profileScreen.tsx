import React, { useState } from "react";
import {
  View,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { commonStyles } from "@/styles/Common";
import { styles } from "@/feature-profile/styles/profileScreen.styles";
import { Typography } from "@/styles/Typography";
import { colors } from "@/styles/Colors";

import { UserAvatar } from "../assets/UserAvatar";
import { StarProgress } from "../assets/StarProgress";
import { SettingsIcon } from "../assets/SettingsIcon";

import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import LoadingScreen from "@/app/loading";
import { StarTooltip } from "../assets/ProgressTooltip";

// 1. Утилита генерации матрицы локальных дат 4 строки на 7 дней
const getGridDays = () => {
  const totalDays = 28;
  const grid: string[][] = [];
  const dates: string[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
  }

  for (let i = 0; i < 4; i++) {
    grid.push(dates.slice(i * 7, (i + 1) * 7));
  }

  return grid;
};

// 2. Утилита подбора цвета в зависимости от активности пользователя
const getStarColor = (count: number) => {
  if (count === 0) return "#D8D8D8"; // Серый — отдыхал
  if (count <= 3) return "#BEC2FF"; // Светло-фиолетовый — размялся
  if (count <= 10) return "#6E75D9"; // Средне-фиолетовый — хорошо поучился
  return "#464A8D"; // Тёмно-фиолетовый — супер-продуктивный день
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setAvatarFile, isLoading, updateAvatar } = useUserStore();

  // Локальные состояния для загрузки аватара и ошибок
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Глобальный лоадер оставляем ТОЛЬКО для первой загрузки всего профиля
  if (isLoading && !isAvatarUploading) {
    return <LoadingScreen textLoad="Загружаем профиль" />;
  }

  // Функция отвечает за выбор аватара из галереи устройства
  const handlePickAvatar = async () => {
    setAvatarError(null); // Сбрасываем прошлую ошибку перед выбором файла

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setAvatarError("Нужно разрешение на доступ к галерее");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9, // Исходное качество перед сжатием
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        let selectedUri = asset.uri;

        setIsAvatarUploading(true);

        console.log("Исходный аватар:", selectedUri);

        //сжатие изображенияч
        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            selectedUri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
          );

          selectedUri = manipResult.uri;
          console.log("Сжатый аватар готов:", selectedUri);
        } catch (manipError) {
          console.error(
            "Не удалось сжать картинку, пробуем отправить оригинал:",
            manipError,
          );
        }

        // Сохраняем в стор локально для мгновенного отображения в интерфейсе
        setAvatarFile(selectedUri);

        console.log("Отправляем аватар на сервер...");
        await updateAvatar(selectedUri);
        console.log("Аватар успешно обновлён!");
      }
    } catch (error) {
      console.error("Ошибка при обновлении аватара:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("Network") ||
          error.message.includes("413")
        ) {
          setAvatarError(
            "Файл слишком большой для сервера или проблема с сетью.",
          );
        } else if (error.message.includes("401")) {
          setAvatarError("Сессия истекла. Пожалуйста, перезайдите в аккаунт.");
        } else {
          setAvatarError(`Не удалось обновить аватар: ${error.message}`);
        }
      } else {
        setAvatarError("Не удалось загрузить картинку. Попробуйте другую.");
      }
    } finally {
      // Выключаем локальный лоадер в любом случае
      setIsAvatarUploading(false);
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={[commonStyles.container, { flex: 1 }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
        >
          <View style={styles.responsiveWrapper}>
            <Typography
              variant="h1"
              style={{ marginBottom: 16, width: "100%" }}
            >
              Профиль
            </Typography>

            {/* Блок био */}
            <View style={[commonStyles.mainBox, styles.bioBox]}>
              <Pressable
                onPress={handlePickAvatar}
                disabled={isAvatarUploading}
                style={styles.avatarButton}
              >
                {/* Картинка или дефолтный аватар */}
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <UserAvatar size={80} />
                )}

                {/* Индикатор загрузки поверх аватара */}
                {isAvatarUploading && (
                  <View style={styles.avatarLoaderOverlay}>
                    <ActivityIndicator size="small" color={colors.mainColor} />
                  </View>
                )}
              </Pressable>

              <View style={styles.aboutBox}>
                <View style={styles.nameBox}>
                  <Typography variant="h2">{user?.firstName}</Typography>
                  <Typography variant="h2">{user?.lastName}</Typography>
                </View>
                <Typography
                  variant="h3"
                  color={colors.darkGray}
                  numberOfLines={3}
                >
                  {user?.bio || "О себе"}
                </Typography>
              </View>
            </View>

            {/* Блок вывода ошибок валидации или сервера */}
            {avatarError && (
              <View style={styles.errorContainer}>
                <Typography variant="h3" style={styles.errorText}>
                  {avatarError}
                </Typography>
              </View>
            )}

            {/* Блок активности */}
            <View style={styles.boxActivity}>
              <Typography variant="h2">Активность</Typography>
              <View style={commonStyles.mainBox}>
                <View style={styles.boxProgress}>
                  {/* Контейнер всей сетки */}
                  <View style={styles.boxProgress__starsBox}>
                    {getGridDays().map((row, rowIndex) => (
                      /* ВНИМАНИЕ: Изменили формулу zIndex. Теперь строки снизу будут поверх верхних */
                      <View
                        key={rowIndex}
                        style={[
                          styles.boxProgress__line,
                          { zIndex: rowIndex + 1 },
                        ]}
                      >
                        {row.map((dateStr) => {
                          const reviewCounts = user?.daily_review_counts || {};
                          const countForDay = reviewCounts[dateStr] ?? 0;
                          const starColor = getStarColor(countForDay);

                          return (
                            <View key={dateStr} style={styles.starWrapper}>
                              <StarTooltip
                                count={countForDay}
                                starColor={starColor}
                              />
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>

                  <View style={styles.boxProgress__boxLine}></View>

                  <View style={styles.boxProgress__infoBox}>
                    <View style={styles.boxProgress__infoBoxItem}>
                      <Typography variant="h2">
                        {user?.review_series || 0}
                      </Typography>
                      <Typography variant="h3" style={{ textAlign: "center" }}>
                        дней без перерыва
                      </Typography>
                    </View>
                    <View style={styles.boxProgress__infoBoxItem}>
                      <Typography variant="h2">
                        {user?.max_review_series || 0}
                      </Typography>
                      <Typography variant="h3" style={{ textAlign: "center" }}>
                        дней без перерыва (макс)
                      </Typography>
                    </View>
                    <View style={styles.boxProgress__infoBoxItem}>
                      <Typography variant="h2">
                        {user?.total_reviews || 0}
                      </Typography>
                      <Typography variant="h3" style={{ textAlign: "center" }}>
                        повторений
                      </Typography>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Кнопка настроек */}
            <Pressable
              style={[commonStyles.mainBox, styles.settingsButton]}
              onPress={handleSettings}
            >
              <SettingsIcon />
              <Typography variant="h2">Настройки</Typography>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
