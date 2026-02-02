import React from 'react';
import { View } from 'react-native';
import FirstStepResetPassword from '@/feature/auth/reset-password/screens/FirstStep';

export default function RegisterIndex() {
  return (
    <View style={{ flex: 1 }}>
      <FirstStepResetPassword />
    </View>
  );
}
