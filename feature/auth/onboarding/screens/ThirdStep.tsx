import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/ThirdStep.styles';
import { ProgressLineAnimated } from '@/components/ProgressLine';
import { View } from 'react-native';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { commonStyles } from '@/styles/Common';
import { Input } from '@/components/Input';
import { LogoHappyStar } from '@/components/LogoHappyStar';
import { colors } from '@/styles/Colors';
import { validateNameField } from '../../validators/user-name.validator';

export default function ThirdStepScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(
    null
  );

  const isButtonActive = name.trim() !== '' && lastname.trim() !== '';

  const handlePress = () => {
    const nameError = validateNameField(name, 'Имя');
    const lastNameError = validateNameField(lastname, 'Фамилия');

    setNameError(nameError);
    setLastNameError(lastNameError);

    if (nameError || lastNameError) {
      return;
    }

    router.push('/onbording/fourth-step');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressLineBox}>
        <ProgressLineAnimated currentStep={3} />
      </View>

      <View style={styles.content}>
        <LogoHappyStar size={160} style={{ marginBottom: 12 }} />

        <Typography variant="h1" style={styles.typography}>
          Как нам к тебе обращаться?
        </Typography>

        <View style={styles.inputContainer}>
          <View style={styles.field}>
            <Input
              style={[
                styles.input,
                nameError ? styles.inputError : undefined,
              ]}
              placeholder="Имя"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) {
                  setNameError(null);
                }
              }}
              autoCapitalize="none"
            />
            {nameError && (
              <Typography variant="h3" style={styles.errorText}>
                {nameError}
              </Typography>
            )}
          </View>

          <View style={styles.field}>
            <Input
              style={[
                styles.input,
                lastNameError ? styles.inputError : undefined,
              ]}
              placeholder="Фамилия"
              value={lastname}
              onChangeText={(text) => {
                setLastName(text);
                if (nameError) {
                  setNameError(null);
                }
              }}
              autoCapitalize="none"
            />
          </View>
          {lastNameError && (
            <Typography variant="h3" style={styles.errorText}>
              {lastNameError}
            </Typography>
          )}
        </View>
      </View>

      <View style={commonStyles.buttonContainer}>
        <MainButton
          title="Дальше"
          onPress={handlePress}
          disabled={!isButtonActive}
        />
      </View>
    </SafeAreaView>
  );
}
