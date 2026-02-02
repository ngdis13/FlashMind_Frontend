import React from 'react';
import { View } from 'react-native';
import RegisterScreen from '../../feature/auth/register/screens/StepEmail';

export default function RegisterIndex() {
  return (
    <View style={{ flex: 1 }}>
      <RegisterScreen />
    </View>
  );
}
