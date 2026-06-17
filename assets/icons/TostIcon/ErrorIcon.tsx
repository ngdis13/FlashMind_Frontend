import React from 'react';
import { ImageStyle, Image } from 'react-native';

interface ErrorIconProps {
  size?: number;
  style?: ImageStyle;
}

export const ErrorIcon = ({ size = 18, style }: ErrorIconProps) => (
  <Image
    source={require('@/assets/icons/ErrorIcon.png')}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);