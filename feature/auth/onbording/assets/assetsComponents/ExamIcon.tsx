import React from 'react';
import { ImageStyle, Image } from 'react-native';
import { Icons } from '..';

interface IconProps {
  size?: number;
  style?: ImageStyle;
}

export const ExamIcon = ({ size = 24, style }: IconProps) => (
  <Image
    source={Icons.Exam}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
