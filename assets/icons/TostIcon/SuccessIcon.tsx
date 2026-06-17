import React from 'react';
import { ImageStyle, Image } from 'react-native';

interface SuccessIconProps {
  size?: number;
  style?: ImageStyle;
}

export const SuccessIcon = ({ size = 18, style }: SuccessIconProps) => (
  <Image
    source={require('@/assets/icons/SuccessIcon.png')}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);