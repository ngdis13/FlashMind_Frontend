import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './welcome.styles';
import { useRouter } from 'expo-router';
import { TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/styles';
import { Logo } from '@/components/Logo';

export default function WelcomeScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/onbording');
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Logo size={190} />
          <Typography variant="h1" style={{ textAlign: 'center' }}>
            Добро пожаловать в FlashMind!
          </Typography>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
