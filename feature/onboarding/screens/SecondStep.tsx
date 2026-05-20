//Основные рабочие импорты
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

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
    <View style={commonStyles.viewContainer}>
      <View style={commonStyles.container}>
        <View style={styles.container}>
          
          {/* Индикатор прогресса */}
          <View style={styles.progressLineBox}>
            <ProgressLineAnimated currentStep={2} />
          </View>

          {/* Центральный контент */}
          <View style={styles.content}>
            <Typography variant="h1" style={styles.title}>
              Сколько минут в день ты планируешь уделять обучению?
            </Typography>
            <MinutesSelectionField />
          </View>

          {/* Контейнер для кнопки */}
          <View style={styles.buttonContainer}>
            <MainButton title="Дальше" onPress={handleNextStep} />
          </View>

        </View>
      </View>
    </View>
  );
}
