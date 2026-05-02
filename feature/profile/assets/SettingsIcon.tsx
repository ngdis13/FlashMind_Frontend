import React from 'react';
import { ImageStyle, Image } from 'react-native';

interface SettingsIconProps {
  size?: number;
  style?: ImageStyle;
}

export const SettingsIcon = ({ size = 20, style }: SettingsIconProps) => (
  <Image
    source={require('@/assets/icons/SettingsIcon.png')}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
