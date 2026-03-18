import { Input } from "@/components/Input";
import { commonStyles } from "@/styles/Common";
import { Typography } from "@/styles/Typography";
import { useState } from "react";
import { View } from "react-native";
import { styles } from "../styles/editProfile.style";
import { MainButton } from "@/components/MainButton";

export default function EditProfile() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [bio, setBio] = useState("");

  const handleSaveEdit = () => {};
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.mainContent}>
        <Typography variant="h1" style={{ marginBottom: 16 }}>
          Профиль
        </Typography>
        <View style={styles.containerInput}>
          <Input
            style={[styles.input]}
            placeholder="Имя"
            value={name}
            autoCapitalize="none"
            onChangeText={(text) => {
              setName(text);
            }}
          />
          <Input
            style={[styles.input]}
            placeholder="Фамилия"
            value={surname}
            autoCapitalize="none"
            onChangeText={(text) => {
              setSurname(text);
            }}
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
