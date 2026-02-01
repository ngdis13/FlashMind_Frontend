// import { useRouter } from 'expo-router'
import React, { useState } from 'react';
import { styles } from '../styles/FirstStep.styles';

import { View } from 'react-native';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/Input';
import { useRouter } from 'expo-router';
import { isValidEmail } from '../../validators/email.validator';
import { colors } from '@/styles/Colors';

export default function FirstStepResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const isButtonActive = email.trim() !== '';

  const router = useRouter();

  const handleContinue = () => {
    if (isValidEmail(email)) {
      router.push('/reset-password/second-step');
    } else {
      setError('Неверный email');
    }
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

        <Input
          style={[
            styles.input,
            error ? styles.inputError : undefined,
          ]}
          placeholder="Email*"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {error ? (
          <Typography
            variant="h2"
            color={colors.errorColor}
            style={{ alignSelf: 'center' }}
          >
            {error}
          </Typography>
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <MainButton
          title="Сбросить пароль"
          onPress={handleContinue}
          disabled={!isButtonActive}
        />
      </View>
    </SafeAreaView>
  );
}
