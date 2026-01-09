import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { Typography } from '@/styles/Typography';
import { styles } from './notfound.styles';

export default function NotFoundPage() {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.logoText}>404</Text>
          <Image
            source={require('../../assets/FlashMindSadStar.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Typography variant="h2" color="#FFFFFF" style={styles.mainText}>
            Упс, кажется разработчики еще не создали эту страницу
          </Typography>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
