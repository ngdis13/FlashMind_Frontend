import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { styles } from '../styles/StepEmail.styles';
import { View } from 'react-native';
import { Input } from '@/components/Input';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twicePassword, setTwicePassword] = useState('');

  const router = useRouter();
  const handleContinue = () => {
    router.push('/register/step-confirm-email');
  };

  const handleHavingAccount = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />

      <Typography variant="h1" style={styles.pageNames}>
        Регистрация
      </Typography>

      <View style={styles.inputContainer}>
        <Input
          placeholder="Email*"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Input
          placeholder="Пароль*"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          placeholder="Подтверждение пароля*"
          value={twicePassword}
          onChangeText={setTwicePassword}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <MainButton title="Продолжить" onPress={handleContinue} />
        <Pressable onPress={handleHavingAccount}>
          <Typography variant="h2">
            У вас уже есть аккаунт?
          </Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
