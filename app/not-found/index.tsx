import { useRouter } from 'expo-router'
import React from 'react'
import { SafeAreaView, View, Text, TouchableWithoutFeedback } from 'react-native'
import { Typography } from '@/styles'
import { styles } from './notfound.styles'

import { LogoSadStar } from '@/components/LogoSadStar'

export default function NotFoundPage() {
  const router = useRouter()

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.logoText}>404</Text>
          <LogoSadStar size={190} style={{ marginBottom: 24 }} />
          <Typography variant="h2" color="#FFFFFF" style={styles.mainText}>
            Упс, кажется разработчики еще не создали эту страницу
          </Typography>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
