import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import { styles } from './index.styles';
import { Image } from 'react-native';
import { Typography } from '@/styles/Typography';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Logo } from '@/components/Logo';
export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => router.push('/login');

  return (
    <TouchableWithoutFeedback onPress={handleSkip}>
      <SafeAreaView style={styles.container}>
      <Logo size={150} style={{ marginBottom: 16 }} />
        <Text style={styles.logoText}>flashmind</Text>
        <Typography variant="h2" color="#FFFFFF" style={styles.bottomText}>
          Нажмите, чтобы продолжить
        </Typography>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
