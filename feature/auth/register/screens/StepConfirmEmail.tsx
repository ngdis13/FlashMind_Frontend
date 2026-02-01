import React, { useState, useEffect } from 'react';
import { styles } from '../styles/StepConfirmEmail.styles';
import { Pressable, View } from 'react-native';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CodeInput } from '../components/CodeInput';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/Colors';

export default function StepConfirmEmail() {
  const [secondLeft, setSecondLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (secondLeft === 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondLeft]);

  const handleCodeFilled = (code: string) => {
    // тут будет проверка кода на сервере
    const isValidCode = true; // временно, потом API

    if (!isValidCode) {
      // тут позже можно показать ошибку
      return;
    }
    router.push('/onboarding');
  };

  const handleResendCode = () => {
    // тут потом будет запрос на отправку кода
    setSecondLeft(60);
    setCanResend(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Мы отправили код подтверждения регистрации на вашу почту
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">Пожалуйста, введите код</Typography>

        <Typography variant="h3" color={'#585858'}>
          Если код не пришел, проверьте папку спам
        </Typography>
      </View>

      <CodeInput length={6} onCodeFilled={handleCodeFilled} />
      {canResend ? (
        <Pressable onPress={handleResendCode}>
          <Typography
            variant="h3"
            color={colors.darkMainColor}
            style={{ textDecorationLine: 'underline' }}
          >
            Отправить код повторно
          </Typography>
        </Pressable>
      ) : (
        <Typography variant="h3" color={colors.darkGray}>
          Отправить код повторно через {secondLeft} сек
        </Typography>
      )}
    </SafeAreaView>
  );
}
