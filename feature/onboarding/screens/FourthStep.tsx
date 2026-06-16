//Основные рабочие импорты
import React, { useState } from "react";
import { View, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Исправлен импорт библиотеки сжатия

//Стили
import { styles } from "../styles/FourthStep.styles";
import { Typography } from "@/styles/Typography";
import { commonStyles } from "@/styles/Common";

//Иконки
import { AddAvatar } from "../assets/assetsComponents/AddAvatar";

//Дополнительные компоненты
import { ProgressLineAnimated } from "@/components/ProgressLine";
import { MainButton } from "@/components/MainButton";
import { useUserStore } from "@/store/userStore";

export default function FourthStepScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { setAvatarFile } = useUserStore();

  const handleNextStep = () => {
    router.push("/onboarding/welcome-last-step");
  };

  // Функция отвечает за выбор аватара из галереи устройства и его сжатие
  const handlePickAvatar = async () => {
    try {
      // Запрашиваем разрешение на доступ к галерее
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Нужно разрешение на доступ к галерее");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect:[1, 1],
        quality: 0.9,   // Исходное качество перед сжатием
      });

      // Если пользователь НЕ нажал "Отмена"
      if (!result.canceled) {
        const asset = result.assets[0];
        let selectedUri = asset.uri;

        console.log("Исходный аватар:", selectedUri);

        // Блок сжатия изображения
        try {
          const manipResult = await ImageManipulator.manipulateAsync(
            selectedUri,
            [{ resize: { width: 800 } }], // Пропорционально ужимаем ширину до 800px
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }, // Качество 70% в формате JPEG
          );

          selectedUri = manipResult.uri;
          console.log("Сжатый аватар готов:", selectedUri);
        } catch (manipError) {
          console.error(
            "Не удалось сжать картинку, используем оригинал:",
            manipError,
          );
        }

        // Обновляем локальное состояние экрана для красивого отображения картинки
        setAvatarUri(selectedUri);
        
        // Сохраняем сжатый URI в глобальный Zustand/Redux стор для последующей отправки
        setAvatarFile(selectedUri);

        console.log("Аватар успешно сохранен в стор приложения:", selectedUri);
      }
    } catch (error) {
      console.error("Ошибка при выборе или обработке изображения:", error);
    }
  };

  return (
    <View style={commonStyles.viewContainer}>
      <View style={commonStyles.container}>
        <View style={styles.container}>
          
          {/* Индикатор прогресса */}
          <View style={styles.progressLineBox}>
            <ProgressLineAnimated currentStep={4} />
          </View>

          {/* Центральный контент */}
          <View style={styles.content}>
            <Pressable onPress={handlePickAvatar}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <AddAvatar />
              )}
            </Pressable>
            
            <Typography variant="h1" style={styles.title}>
              Сделаем твой профиль еще красивее?
            </Typography>

            <Typography variant="h2" style={styles.subtitle}>
              Добавь свою фотографию сейчас или позже в режиме редактирования профиля
            </Typography>
          </View>

          {/* Кнопка действия */}
          <View style={styles.buttonContainer}>
            <MainButton title="Вперед к знаниям" onPress={handleNextStep} />
          </View>

        </View>
      </View>
    </View>
  );
}
