
// Для импорта SVG как React-компонента 
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Для импорта SVG как строки с ?raw 
declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
