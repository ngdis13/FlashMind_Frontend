//Основные рабочие импорты
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

//Стили
import { styles } from '../styles/SecondStep.styles';
import { Typography } from '@/styles/Typography';
import { commonStyles } from '@/styles/Common';

//Дополнительные компоненты
import { ProgressLineAnimated } from '@/components/ProgressLine';
import { MainButton } from '@/components/MainButton';
import { MinutesSelectionField } from '../components/MinutesSelectionField';

/**
 * Второй шаг онбординга.
 *
 * Экран позволяет пользователю выбрать,
 * сколько времени в день он готов уделять обучению.
 */
export default function SecondStepScreen() {
  const router = useRouter();

  /**
   * Переход к следующему шагу онбординга.
   */
  const handleNextStep = () => {
    router.push('/onboarding/third-step');
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
      <View style={commonStyles.buttonContainer}>
        <MainButton title="Дальше" onPress={handleNextStep} />
      </View>
    </SafeAreaView>
  );
}
