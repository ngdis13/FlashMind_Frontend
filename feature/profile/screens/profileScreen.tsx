import { View, Pressable, Image, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

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


export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    setAvatarFile,
    isLoading,
    updateAvatar,
  } = useUserStore();

  if (isLoading) {
    return <LoadingScreen textLoad="Загружаем профиль" />;
  }
  // Функция отвечает за выбор аватара из галереи устройства
  const handlePickAvatar = async () => {
    try {
      // Запрашиваем разрешение на доступ к галерее
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Нужно разрешение на доступ к галерее");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;

        console.log("Выбран аватар:", selectedUri);

        // Сохраняем в стор локально
        setAvatarFile(selectedUri);

        // Отправляем только аватар на сервер
        console.log("Отправляем аватар на сервер...");
        const response = await updateAvatar(selectedUri);
        console.log("Аватар успешно обновлён!", response);

        // Показываем успешное сообщение (опционально)
        // alert("Аватар успешно обновлён!");
      }
    } catch (error) {
      console.error("Ошибка при обновлении аватара:", error);

      // Показываем понятное сообщение пользователю
      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          alert("Ошибка сети. Проверьте подключение к интернету.");
        } else if (error.message.includes("401")) {
          alert("Сессия истекла. Перезайдите в приложение.");
        } else {
          alert(`Не удалось обновить аватар: ${error.message}`);
        }
      } else {
        alert("Не удалось обновить аватар. Попробуйте ещё раз.");
      }
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <View style={[commonStyles.container, { flex: 1, paddingBottom: 100 }]}>
      <ScrollView>
        <View style={commonStyles.mainContent}>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Профиль
          </Typography>

          <View style={[commonStyles.mainBox, styles.bioBox]}>
            <Pressable onPress={handlePickAvatar}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: 100, height: 100, borderRadius: 100 }}
                />
              ) : (
                <UserAvatar size={100} />
              )}
            </Pressable>
            <View style={styles.aboutBox}>
              <View style={styles.nameBox}>
                <Typography variant="h2">{user?.firstName}</Typography>

                <Typography variant="h2">{user?.lastName}</Typography>
              </View>
              <Typography variant="h3" color={colors.darkGray}>
                {user?.bio}
              </Typography>
            </View>
          </View>
          <View style={styles.boxActivity}>
            <Typography variant="h2">Активность</Typography>
            <View style={commonStyles.mainBox}>
              <View style={styles.boxProgress}>
                <View style={styles.boxProgress__name}>
                  <Typography variant="h2">Пн</Typography>
                  <Typography variant="h2">Вт</Typography>
                  <Typography variant="h2">Ср</Typography>
                  <Typography variant="h2">Чт</Typography>
                  <Typography variant="h2">Пт</Typography>
                  <Typography variant="h2">Сб</Typography>
                  <Typography variant="h2">Вс</Typography>
                </View>

                <View style={styles.boxProgress__starsBox}>
                  {Array.from({ length: 4 }).map((_, row) => (
                    <View key={row} style={styles.boxProgress__line}>
                      {Array.from({ length: 7 }).map((_, col) => (
                        <StarProgress key={`${row}-${col}`} />
                      ))}
                    </View>
                  ))}
                </View>

                <View style={styles.boxProgress__boxLine}></View>

                <View style={styles.boxProgress__infoBox}>
                  <View style={styles.boxProgress__infoBoxItem}>
                    <Typography variant="h2">0</Typography>
                    <Typography variant="h3" style={{ textAlign: "center" }}>
                      дней без перерыва
                    </Typography>
                  </View>
                  <View style={styles.boxProgress__infoBoxItem}>
                    <Typography variant="h2">0</Typography>
                    <Typography variant="h3" style={{ textAlign: "center" }}>
                      дней без перерыва (макс)
                    </Typography>
                  </View>
                  <View style={styles.boxProgress__infoBoxItem}>
                    <Typography variant="h2">0</Typography>
                    <Typography variant="h3" style={{ textAlign: "center" }}>
                      повторений
                    </Typography>
                  </View>
                </View>
              </View>
            </View>
          </View>

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
  );
}
