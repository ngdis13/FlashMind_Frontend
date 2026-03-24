import { Input } from "@/components/Input";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useState } from "react";
import { View } from "react-native";
import { styles } from "../styles/editProfile.style";
import { MainButton } from "@/components/MainButton";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const { user, updateProfile, submitOnbordingData } = useUserStore();

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [bio, setBio] = useState("");

  const router = useRouter();

  const handleSaveEdit = () => {
    updateProfile({ firstName: name, lastName: lastname, bio: bio });
    submitOnbordingData();
    router.replace("/settings");
  };
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <Typography variant="h1" style={{ marginBottom: 16 }}>
          Профиль
        </Typography>
        <View style={styles.containerInput}>
          <Input
            style={[styles.input]}
            placeholder={user?.firstName || "Имя"}
            value={name}
            autoCapitalize="none"
            onChangeText={(text) => {
              setName(text);
            }}
          />
          <Input
            style={[styles.input]}
            placeholder={user?.lastName || "Фамилия"}
            value={lastname}
            autoCapitalize="none"
            onChangeText={(text) => {
              setLastname(text);
            }}
          />
          <Input
            style={[styles.input, styles.bioInput]}
            placeholder={user?.bio || "О себе"}
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
