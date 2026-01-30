import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { Images } from '@/assets';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
}

export const LogoHappyStar = ({ size = 150, style }: LogoProps) => (
  <Image
    source={Images.logoHappyStar}
    style={[{ width: size, height: size, marginBottom: 12 }, style]}
    resizeMode="contain"
  />
);
