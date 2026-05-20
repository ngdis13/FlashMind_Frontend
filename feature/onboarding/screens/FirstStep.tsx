// Основные рабочие импорты
import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

// Стили
import { Typography } from '@/styles/Typography';
import { styles } from '../styles/FirstStep.styles';
import { commonStyles } from '@/styles/Common';

// Иконки
import { ExamIcon } from '../assets/assetsComponents/ExamIcon';
import { LanguageIcon } from '../assets/assetsComponents/LanguageIcon';
import { OtherIcon } from '../assets/assetsComponents/OtherIcon';

// Дополнительные компоненты
import { SelectionField } from '../components/SelectionField';
import { ProgressLineAnimated } from '@/components/ProgressLine';

/**
 * Экран первого шага онбординга.
 *
 * @description
 * Пользователь выбирает основную цель обучения. 
 * Выбор цели используется для персонализации дальнейшего процесса обучения.
 */
export default function FirstStepScreen() {
  const router = useRouter();

  // Состояние выбранной цели
  const [_choice, setChoice] = useState('');

  /**
   * Обработчик выбора цели.
   * 
   * @param {string} value - Выбранная пользователем цель
   */
  const handleSelect = (value: string) => {
    setChoice(value);
    router.push('/onboarding/second-step'); // Переход к следующему шагу онбординга
  };

  return (
    <View style={commonStyles.viewContainer}>
      <View style={commonStyles.container}>
        <View style={styles.container}>
          
          {/* Прогресс-линия */}
          <View style={styles.progressLineBox}>
            <ProgressLineAnimated currentStep={1} />
          </View>

          {/* Контент экрана */}
          <View style={styles.content}>
            <Typography variant="h1" style={styles.title}>
              Какая твоя цель?
            </Typography>

            {/* Поля выбора целей */}
            <View style={styles.selectionFields}>
              <SelectionField
                image={<LanguageIcon />}
                title="Выучить новый язык"
                onPress={() => handleSelect('Выучить новый язык')}
              />
              <SelectionField
                image={<ExamIcon />}
                title="Подготовиться к экзамену"
                onPress={() => handleSelect('Подготовиться к экзамену')}
              />
              <SelectionField
                image={<OtherIcon />}
                title="Другое"
                onPress={() => handleSelect('Другое')}
              />
            </View>
          </View>

        </View>
      </View>
    </View>
  );
}
