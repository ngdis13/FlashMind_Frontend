import React, { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { MainButton } from '../../components/MainButton';
import { SecondButton } from '@/components/SecondButton';
import { useUserStore } from '../../store/userStore';
import { useRouter } from 'expo-router';
import { styles } from './login.styles';
import { Image } from 'react-native';
import { Typography } from '@/styles/Typography';
import { Input } from '@/components/Input';
import {Logo } from '@/components/Logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useUserStore((state: { login: any }) => state.login);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Успех', 'Вы вошли в систему!');
      router.push('/'); // переход на главную
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };
  const handleChangePassword = () => {
    router.push('/not-found');
  };

  return (
    <View style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />
      <Typography variant="h1" style={styles.title}>
        Добро пожаловать в Flashmind!
      </Typography>

      <View style={styles.inputContainer}>
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Input placeholder="Пароль" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <Pressable onPress={handleChangePassword}>
        <Typography variant="h2">Забыли пароль?</Typography>
      </Pressable>

      <View style={styles.buttonContainer}>
        <MainButton title="Войти" onPress={handleLogin} />
        <SecondButton title="Регистрация" onPress={handleRegister} />
      </View>
    </View>
  );
}
