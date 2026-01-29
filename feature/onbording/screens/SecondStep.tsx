import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/SecondStep.styles';
import { useRouter } from 'expo-router';
import { TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/styles';
import { ProgressLineAnimated } from '@/components/ProgressLine';
import { MainButton } from '@/components/MainButton';
import { MinutesSelectionField } from '../components/MinutesSelectionField';

export default function SecondStepScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/onbording/second-step');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressLineBox}>
        <ProgressLineAnimated currentStep={2} />
      </View>

      <View style={styles.content}>
        <Typography
          variant="h1"
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          Сколько минут в день ты планируешь уделять обучению?
        </Typography>
        <MinutesSelectionField />
      </View>
      <View style={styles.buttonContainer}>
        <MainButton title="Вперед к знаниям" onPress={handlePress} />
      </View>
    </SafeAreaView>
  );
}
