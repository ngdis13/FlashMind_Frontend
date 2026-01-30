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

export default function ThirdStepScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [lastname, setLastName] = useState('');

  const handlePress = () => {
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
          <Input
            placeholder="Имя"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
          <Input
            placeholder="Фамилия"
            value={lastname}
            onChangeText={setLastName}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={commonStyles.buttonContainer}>
        <MainButton title="Дальше" onPress={handlePress} />
      </View>
    </SafeAreaView>
  );
}
