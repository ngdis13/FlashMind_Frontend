import React from 'react';
import { ImageStyle, Image } from 'react-native';
import settingsIcon from '@/assets/icons/SettingsIcon.png'

interface SettingsIconProps {
  size?: number;
  style?: ImageStyle;
}

export const SettingsIcon = ({ size = 20, style }: SettingsIconProps) => (
  <Image
    source={settingsIcon}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
