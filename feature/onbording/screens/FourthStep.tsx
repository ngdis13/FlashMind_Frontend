import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, Image, Pressable } from 'react-native';
import { styles } from '../styles/FourthStep.styles';
import { useRouter } from 'expo-router';
import { TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/styles/Typography';
import { commonStyles } from '@/styles/Common';
import { AddAvatar } from '../assets/assetsComponents/AddAvatar';
import { ProgressLineAnimated } from '@/components/ProgressLine';
import { MainButton } from '@/components/MainButton';

export default function FourthStepScreen() {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const handlePress = () => {
    router.push('/onbording/welcome-last-step');
  };

  const handlePickAvatar = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Нужно разрешение на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
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
        <Typography
          variant="h1"
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          Сделаем твой профиль еще красивее?
        </Typography>

        <Typography
          variant="h2"
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          Добавь свою фотографию сейчас или позже в режиме
          редактирования профиля
        </Typography>
      </View>
      <View style={commonStyles.buttonContainer}>
        <MainButton title="Вперед к знаниям" onPress={handlePress} />
      </View>
    </SafeAreaView>
  );
}
