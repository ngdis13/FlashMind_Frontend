import React, { useState } from 'react';
import { View, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { styles } from '../styles/ThirdStep.styles';
import { colors } from '@/styles/Colors';

import { Input } from '@/components/Input';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';

import { OpenEyesIcon } from '../../assets/Icons/OpenEyesIcon';
import { CloseEyesIcon } from '../../assets/Icons/CloseEyesIcon';

export default function ThirdStepResetPassword() {
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const isButtonActive =
    password.trim() !== '' && confirmPassword.trim() !== '';

  const router = useRouter();

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

    if (hasError) return;

    router.push('/reset-password/last-step');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Введите новый пароль
      </Typography>

      <View style={styles.content}>
        {/* Password */}
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

        {/* Confirm password */}
        <Typography variant="h2">Подтвердите пароль</Typography>

        <View style={styles.passwordWrapper}>
          <Input
            style={[
              styles.input,
              confirmError ? styles.inputError : undefined,
            ]}
            placeholder="Пароль*"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>

        {error ? (
          <Typography variant="h2" color={colors.errorColor}>
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
