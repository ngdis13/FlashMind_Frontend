import { Input } from "@/components/Input";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useEffect, useState } from "react";
import { Pressable, View, Image } from "react-native";
import { styles } from "../styles/editProfile.style";
import { MainButton } from "@/components/MainButton";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import ReturnIcon from "@/assets/icons/ReturnIcon.png";

export default function EditProfile() {
  const { user, updateProfile, submitOnbordingData } = useUserStore();
  const router = useRouter();

  // 1. Сразу подставляем значения из стора в начальный стейт
  const [name, setName] = useState(user?.firstName || "");
  const [lastname, setLastname] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");

  // 2. Если данные в сторе появятся чуть позже (после загрузки), 
  // этот эффект обновит поля ввода
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
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <View style={commonStyles.mainHeader}>
          <Pressable onPress={handleBack}>
            <Image source={ReturnIcon} style={{ width: 12, height: 22, top: -7 }} />
          </Pressable>
          <Typography variant="h1" style={{ marginBottom: 16 }}>
            Профиль
          </Typography>
        </View>
        <View style={styles.containerInput}>
          <Input
            style={[styles.input]}
            placeholder="Имя" // Здесь теперь просто статичный плейсхолдер
            value={name}      // Реальное значение, которое можно редактировать
            autoCapitalize="none"
            onChangeText={setName}
          />
          <Input
            style={[styles.input]}
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
      </View>
      <MainButton
        style={styles.button}
        title="Сохранить изменения"
        onPress={handleSaveEdit}
      />
    </View>
  );
}