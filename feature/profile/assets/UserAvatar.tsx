import React from 'react';
import { ImageStyle, Image } from 'react-native';
import userAvatarImage from '@/assets/images/UserAvatar.png'

interface UserAvatarProps {
  size?: number;
  style?: ImageStyle;
}

export const UserAvatar = ({ size = 174, style }: UserAvatarProps) => (
  <Image
    source={userAvatarImage}
    style={[{ width: size, height: size }, style]}
    resizeMode="contain"
  />
);
