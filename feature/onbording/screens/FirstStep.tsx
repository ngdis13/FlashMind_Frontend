import React from 'react';
import { View } from 'react-native';
import { styles } from '../styles/FirstStep.styles';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/styles';
import { SvgXml } from 'react-native-svg';

import { MainButton } from '@/components/MainButton';
import { ProgressLineAnimated } from '@/components/ProgressLine';

import { ExamIcon } from '../assets/assetsComponents/ExamIcon';
import { LanguageIcon } from '../assets/assetsComponents/LanguageIcon';
import { OtherIcon } from '../assets/assetsComponents/OtherIcon';

import { SelectionField } from '../components/SelectionField';

export default function FirstStepScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/onbording/second-step');
  };

  const handleExam = () => {};

  const handleLanguage = () => {};

  const handleOther = () => {};

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
            onPress={handleLanguage}
          />
          <SelectionField
            image={<ExamIcon />}
            title="Подготовиться к экзамену"
            onPress={handleExam}
          />
          <SelectionField
            image={<OtherIcon />}
            title="Другое"
            onPress={handleOther}
          />
        </View>
        <View style={styles.buttonContainer}>
          <MainButton title="Дальше" onPress={handlePress} />
        </View>
      </View>
    </SafeAreaView>
  );
}
