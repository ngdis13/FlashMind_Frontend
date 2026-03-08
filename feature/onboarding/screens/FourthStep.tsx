//Основные рабочие импорты
import React, { useEffect, useState } from "react";
import { View, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

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
  const { user, setAvatarFile } = useUserStore();

  const handleNextStep = () => {
    router.push("/onboarding/welcome-last-step");
  };

  // Функция отвечает за выбор аватара из галереи устройства
  const handlePickAvatar = async () => {
    // Запрашиваем разрешение на доступ к галерее
    // iOS / Android не дают доступ без явного разрешения пользователя
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Нужно разрешение на доступ к галерее");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // Разрешаем выбирать только изображения (без видео)
      mediaTypes: ["images"],
      // Позволяем пользователю обрезать изображение перед выбором
      allowsEditing: true,
      // Соотношение сторон при обрезке (1:1 — квадрат, идеально для аватара)
      aspect: [1, 1],
      // Качество изображения (0–1)
      quality: 0.8,
    });

    // Если пользователь НЕ нажал "Отмена"
    if (!result.canceled) {
      // Берём URI выбранного изображения
      // assets[0] — потому что пользователь выбирает одно фото
      const selectedUri = result.assets[0].uri;
      setAvatarUri(selectedUri);
      setAvatarFile(selectedUri);

      console.log('Аватар выбран и сохранен:', selectedUri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressLineBox}>
        <ProgressLineAnimated currentStep={4} />
      </View>

      <View style={styles.content}>
        <Pressable onPress={handlePickAvatar}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 174, height: 174, borderRadius: 100 }}
            />
          ) : (
            <AddAvatar />
          )}
        </Pressable>
        <Typography variant="h1" style={{ textAlign: "center", maxWidth: 400 }}>
          Сделаем твой профиль еще красивее?
        </Typography>

        <Typography variant="h2" style={{ textAlign: "center", maxWidth: 400 }}>
          Добавь свою фотографию сейчас или позже в режиме редактирования
          профиля
        </Typography>
      </View>
      <View style={commonStyles.buttonContainer}>
        <MainButton title="Вперед к знаниям" onPress={handleNextStep} />
      </View>
    </SafeAreaView>
  );
}
