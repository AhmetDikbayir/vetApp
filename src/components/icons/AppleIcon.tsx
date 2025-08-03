import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AppleIconProps {
  size?: number;
}

export const AppleIcon: React.FC<AppleIconProps> = ({ size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.08-.52-2.07-.53-3.2 0-1.44.71-2.23.51-3.08-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.33.07 2.25.8 3.04.86.79.05 1.8-.69 3.32-.84 1.8-.17 3.47.66 4.42 2.04-3.77 2.35-3.15 8.32.22 11.71ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}; 