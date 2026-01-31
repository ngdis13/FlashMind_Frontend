// import { useRouter } from 'expo-router'
import React, { useState } from 'react';
import { styles } from '../styles/FirstStep.styles';

import { View } from 'react-native';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/Input';
import { useRouter } from 'expo-router';

export default function FirstStepResetPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    router.push('/reset-password/second-step');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Введите ваш адрес электронной почты
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">
          Мы отправим вам код для сброса пароля
        </Typography>
      </View>

      <Input
        style={styles.input}
        placeholder="Email*"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <View style={styles.buttonContainer}>
        <MainButton
          title="Сбросить пароль"
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}
