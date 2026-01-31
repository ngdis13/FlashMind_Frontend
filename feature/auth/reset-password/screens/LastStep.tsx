import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { styles } from '../styles/LastStep.styles';

import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { Logo } from '@/components/Logo';

export default function LastStepResetPassword() {
  const router = useRouter();

  const handleContinue = () => {
    //сразу переход на страницу пользователя
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo />
      <Typography variant="h1" style={styles.pageNames}>
        Успешный сброс пароля
      </Typography>

      <View style={styles.buttonContainer}>
        <MainButton title="Вход в систему" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
