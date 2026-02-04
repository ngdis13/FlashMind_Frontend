import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Keyboard, Pressable } from "react-native";
import { styles } from "../styles/StepEmail.styles";
import { View } from "react-native";
import { Input } from "@/components/Input";
import { MainButton } from "@/components/MainButton";
import { Typography } from "@/styles/Typography";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/Logo";
import { OpenEyesIcon } from "../../assets/Icons/OpenEyesIcon";
import { CloseEyesIcon } from "../../assets/Icons/CloseEyesIcon";
import { colors } from "@/styles/Colors";

import { isValidEmail } from "../../validators/email.validator";

import { useStartRegistration } from "../hooks/useStartRegistration";

export default function RegisterScreen() {
  const router = useRouter();
  const { start, loading, error } = useStartRegistration();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const isFormFilled =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  const handleContinue = async () => {
    Keyboard.dismiss();

    setEmailError(false);
    setPasswordError(false);
    setConfirmError(false);

    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }

    if (password.length < 8) {
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      return;
    }

    start(email, password);
  };

  const handleHavingAccount = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />

      <Typography variant="h1" style={styles.pageNames}>
        Регистрация
      </Typography>

      <View style={styles.inputContainer}>
        <Input
          style={[styles.input, emailError ? styles.inputError : undefined]}
          placeholder="Email*"
          value={email}
          autoCapitalize="none"
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) {
              setEmailError(false);
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
              showPassword ? "Скрыть пароль" : "Показать пароль"
            }
          >
            {showPassword ? <OpenEyesIcon /> : <CloseEyesIcon />}
          </Pressable>
        </View>

        <Input
          style={[styles.input, confirmError ? styles.inputError : undefined]}
          placeholder="Подтверждение пароля*"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
        />

        {error ? (
          <Typography
            variant="h3"
            color={colors.errorColor}
            style={{ alignSelf: "center", textAlign: "center" }}
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
          <Typography variant="h2">У вас уже есть аккаунт?</Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
