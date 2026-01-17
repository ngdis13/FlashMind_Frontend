import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, Image, Pressable } from 'react-native';
import { styles } from '../styles/StepConfirmEmail.styles';
import { View } from 'react-native';
import { Input } from '@/components/Input';
import { MainButton } from '@/components/MainButton';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';

import { CodeInput } from '../components/CodeInput';

export default function StepConfirmEmail() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twicePassword, setTwicePassword] = useState('');

  const router = useRouter();
  const handleContinue = () => {
    console.log('pressed');
  };


  const handleCodeFilled = () => {

  }

  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="h1" style={styles.pageNames}>
        Мы отправили код подтверждения регистрации на вашу почту
      </Typography>

      <View style={styles.infoContainer}>
        <Typography variant="h2">Пожалуйста, введите код</Typography>

        <Typography variant="h3" color={'#585858'}>
          Если код не пришел, проверьте папку спам
        </Typography>
      </View>

      <CodeInput length={6} onCodeFilled={handleCodeFilled} />

      <View style={styles.buttonContainer}>
        <MainButton title="Подтвердить" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
