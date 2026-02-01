//Основные рабочие импорты
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

//Стили
import { Typography } from '@/styles/Typography';
import { styles } from '../styles/FirstStep.styles';

//Иконки
import { ExamIcon } from '../assets/assetsComponents/ExamIcon';
import { LanguageIcon } from '../assets/assetsComponents/LanguageIcon';
import { OtherIcon } from '../assets/assetsComponents/OtherIcon';

//Дополнительные компоненты
import { SelectionField } from '../components/SelectionField';
import { ProgressLineAnimated } from '@/components/ProgressLine';

/**
 * Первый шаг онбординга.
 *
 * Экран позволяет пользователю выбрать основную цель обучения.
 * Выбор цели используется для дальнейшей персонализации приложения.
 */
export default function FirstStepScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState('');

  /**
   * Обрабатывает выбор цели и переходит к следующему шагу онбординга.
   */
  const handleSelect = (value: string) => {
    setChoice(value);
    router.push('/onboarding/second-step');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressLineBox}>
        <ProgressLineAnimated currentStep={1} />
      </View>
      <View style={styles.content}>
        <Typography
          variant="h1"
          style={{ textAlign: 'center', marginBottom: 24 }}
        >
          Какая твоя цель?
        </Typography>
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
