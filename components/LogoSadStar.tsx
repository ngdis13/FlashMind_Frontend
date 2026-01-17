import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { Images } from '@/assets';

type LogoProps = {
  size?: number;
  style?: ImageStyle;
};

export const LogoSadStar = ({ size = 150, style }: LogoProps) => (
    <Image
        source={Images.logoSadStar}
        style={[{ width: size, height: size, marginBottom: 12 }, style]}
        resizeMode="contain"
    />
);
