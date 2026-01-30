import React from 'react';
import { ImageStyle, Image } from 'react-native';
import { images } from '../index';

interface addAvatarProps {
  size?: number;
  style?: ImageStyle;
}

export const AddAvatar = ({ size = 174, style }: addAvatarProps) => (
  <Image
    source={images.addAvatar}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
