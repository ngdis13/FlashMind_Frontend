import { Input } from "@/components/Input";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useEffect, useState } from "react";
import { Pressable, View, Image, ScrollView } from "react-native"; // Добавили ScrollView
import { styles } from "../styles/editProfile.style";
import { MainButton } from "@/components/MainButton";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";
import { colors } from "@/styles/Colors";

export default function EditProfile() {
  const { user, updateProfile, submitOnbordingData } = useUserStore();
  const router = useRouter();

  const [name, setName] = useState(user?.firstName || "");
  const [lastname, setLastname] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");

  useEffect(() => {
    if (user) {
      setName(user.firstName || "");
      setLastname(user.lastName || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSaveEdit = () => {
    updateProfile({ firstName: name, lastName: lastname, bio: bio });
    submitOnbordingData();
    router.replace("/settings");
  };
  const handleBack = () => router.back();

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, width: "100%" }}
    >
      <View style={commonStyles.container}>
        {/* ScrollView позволяет всему контенту растягиваться по ширине экрана */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          style={{ width: "100%" }}
        >
          <View style={commonStyles.mainHeader}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Image source={ReturnIcon} style={{ width: 12, height: 22 }} />
            </Pressable>
            <Typography variant="h1" style={{ marginBottom: 16 }}>
              Профиль
            </Typography>
          </View>

          <View style={styles.containerInput}>
            <Input
              style={styles.input}
              placeholder="Имя"
              value={name}
              autoCapitalize="none"
              onChangeText={setName}
            />
            <Input
              style={styles.input}
              placeholder="Фамилия"
              value={lastname}
              autoCapitalize="none"
              onChangeText={setLastname}
            />
            <Input
              style={[styles.input, styles.bioInput]}
              placeholder="О себе"
              value={bio}
              autoCapitalize="none"
              multiline={true}
              numberOfLines={3}
              maxLength={105}
              textAlignVertical="top"
              onChangeText={setBio}
            />
          </View>

          {/* Перенесли кнопку внутрь скролла — теперь она адаптивно растягивается снизу контента */}
          <MainButton
            style={styles.button}
            title="Сохранить изменения"
            onPress={handleSaveEdit}
          />
        </ScrollView>
      </View>
    </View>
  );
}
