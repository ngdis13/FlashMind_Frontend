// import { useRouter } from 'expo-router'
import React, { useState } from 'react';
import { styles } from '../styles/SecondStep.styles';

import { View } from 'react-native';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CodeInput } from '../../register/components/CodeInput';
import { useRouter } from 'expo-router';

export default function SecondStepResetPassword() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/reset-password/third-step');
  };
  const handleCodeFilled = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Мы отправили код подтверждения сброса пароля на вашу почту
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">Пожалуйста, введите код</Typography>

        <Typography variant="h3" color={'#585858'}>
          Если код не пришел, проверьте папку спам
        </Typography>
      </View>

      <CodeInput length={6} onCodeFilled={handleCodeFilled} />
      <Typography variant="h3" color={'#585858'}>
        Отправить код повторно через 60 сек
      </Typography>

      <View style={styles.buttonContainer}>
        <MainButton title="Подтвердить" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
