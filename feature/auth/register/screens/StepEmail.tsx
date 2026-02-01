import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Keyboard, Pressable } from 'react-native';
import { styles } from '../styles/StepEmail.styles';
import { View } from 'react-native';
import { Input } from '@/components/Input';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { OpenEyesIcon } from '../../assets/Icons/OpenEyesIcon';
import { CloseEyesIcon } from '../../assets/Icons/CloseEyesIcon';
import { colors } from '@/styles/Colors';

import { isValidEmail } from '../../validators/email.validator';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const isFormFilled =
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  const handleContinue = () => {
    Keyboard.dismiss();
    let hasError = false;

    setPasswordError(false);
    setConfirmError(false);
    setError('');

    if (password.length < 8) {
      setPasswordError(true);
      setError('Пароль должен быть не менее 8 символов');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      if (!passwordError) {
        setError('Пароли не совпадают');
      }
      hasError = true;
    }

    if (!isValidEmail(email)) {
      setEmailError(true);
      setError('Неверный email');
      hasError = true;
    }

    if (hasError) return;

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
          style={[
            styles.input,
            emailError ? styles.inputError : undefined,
          ]}
          placeholder="Email*"
          value={email}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) {
              // Сбрасываем ошибку, если она была
              setEmailError(false);
              setError(''); // Убираем текст ошибки
            }
          }}
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

        <Input
          style={[
            styles.input,
            confirmError ? styles.inputError : undefined,
          ]}
          placeholder="Подтверждение пароля*"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
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
          title="Продолжить"
          onPress={handleContinue}
          disabled={!isFormFilled}
        />
        <Pressable onPress={handleHavingAccount}>
          <Typography variant="h2">
            У вас уже есть аккаунт?
          </Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
