import React, { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { MainButton } from '@/components/MainButton';
import { SecondButton } from '@/components/SecondButton';
import { useRouter } from 'expo-router';
import { styles } from '../styles/login.styles';
import { Typography } from '@/styles/Typography';
import { Input } from '@/components/Input';
import { Logo } from '@/components/Logo';
import { OpenEyesIcon } from '../../assets/Icons/OpenEyesIcon';
import { CloseEyesIcon } from '../../assets/Icons/CloseEyesIcon';
import { isValidEmail } from '../../validators/email.validator';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [passwordError, setPasswordError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const isButtonActive =
    email.trim() !== '' && password.trim() !== '';

  const router = useRouter();

  const handleLogin = async () => {
    //тут запрос на сервер должен быть
    if (isValidEmail(email)) {
      Alert.alert('Успех', 'Вы вошли в систему!');
      router.push('/not-found');
    } else {
      setEmailError(true);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };
  const handleChangePassword = () => {
    router.push('/reset-password');
  };

  return (
    <View style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />
      <Typography variant="h1" style={styles.title}>
        Добро пожаловать в Flashmind!
      </Typography>

      <View style={styles.inputContainer}>
        <Input
          style={[
            styles.input,
            emailError ? styles.inputError : undefined,
          ]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordWrapper}>
          <Input
            style={[
              styles.input,
              passwordError ? styles.inputError : undefined,
            ]}
            placeholder="Пароль*"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
          />

          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Скрыть пароль' : 'Показать пароль'
            }
          >
            {showPassword ? <OpenEyesIcon /> : <CloseEyesIcon />}
          </Pressable>
        </View>
      </View>

      <Pressable onPress={handleChangePassword}>
        <Typography variant="h2">Забыли пароль?</Typography>
      </Pressable>

      <View style={styles.buttonContainer}>
        <MainButton
          title="Войти"
          onPress={handleLogin}
          disabled={!isButtonActive}
        />
        <SecondButton title="Регистрация" onPress={handleRegister} />
      </View>
    </View>
  );
}
