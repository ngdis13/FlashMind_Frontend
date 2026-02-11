// Основные рабочие импорты
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Стили
import { Typography } from '@/styles/Typography';
import { styles } from '../styles/FirstStep.styles';

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
 * Выбор цели используется для персонализации дальнейшего процесса обучения
 * и управления навигацией к следующему шагу онбординга.
 *
 * Особенности:
 * - Отображает прогресс-линию с текущим шагом.
 * - Предоставляет три варианта выбора цели с иконками.
 * - При выборе варианта выполняется переход к следующему шагу.
 *
 * @example
 * ```tsx
 * <FirstStepScreen />
 * ```
 *
 * @returns {JSX.Element} Компонент экрана первого шага онбординга
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
    <SafeAreaView style={styles.container}>
      {/* Прогресс-линию */}
      <View style={styles.progressLineBox}>
        <ProgressLineAnimated currentStep={1} />
      </View>

      {/* Контент экрана */}
      <View style={styles.content}>
        <Typography
          variant="h1"
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
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
    </SafeAreaView>
  );
}
