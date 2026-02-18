//Основные рабочие импорты
import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

//Стили
import { styles } from '../styles/WelcomeStep.styles';
import { Typography } from '@/styles/Typography';

//Иконки
import { Logo } from '@/components/Logo';

/**
 * Приветственный экран приложения.
 *
 * Первый экран онбординга, который знакомит пользователя
 * с приложением и брендом.
 *
 * Нажатие в любую область экрана переводит пользователя
 * к первому шагу онбординга.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/profile');
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
