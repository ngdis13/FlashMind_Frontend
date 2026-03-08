//Основные рабочие импорты
import React, { useEffect } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

//Стили
import { styles } from '../styles/WelcomeStep.styles';
import { Typography } from '@/styles/Typography';

//Иконки
import { Logo } from '@/components/Logo';
import { useUserStore } from '@/store/userStore';

/**
 * Приветственный экран приложения. Финальный экран онбординга
 *
 * Первый экран онбординга, который знакомит пользователя
 * с приложением и брендом.
 *
 * Нажатие в любую область переводит пользователя на профиль
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { user, submitOnbordingData, isLoading } = useUserStore();

    // Проверяем данные перед отправкой
  useEffect(() => {
    console.log('=== Финальный экран ===');
    console.log('Данные пользователя:', {
      firstName: user?.firstName,
      lastName: user?.lastName,
      hasAvatarFile: user?.avatarFile ? 'Да' : 'Нет',
      avatarFileName: user?.avatarFile?.name,
      avatarFileType: user?.avatarFile?.type,
      avatarFileUri: user?.avatarFile?.uri ? 'Есть URI' : 'Нет URI'
    });
  }, []);

  const handleStart = async () => {
    try{
      console.log('Начинаем отправку на сервер')
      await submitOnbordingData()
      console.log('онбординг завершен')
      router.push('/profile');

    } catch(error){
      console.error('ошибка:', error)
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleStart}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Logo size={190} />
          <Typography variant="h1" style={{ textAlign: 'center' }}>
            Добро пожаловать в FlashMind!
          </Typography>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
