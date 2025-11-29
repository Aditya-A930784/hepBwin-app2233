import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';

export default function ShieldIcon() {
  return (
    <View style={styles.container}>
      <Svg width="120" height="80" viewBox="0 0 400 150" fill="none">
        <Defs>
          <LinearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#3D4B8C" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4A5BA6" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Letter H */}
        <Path
          d="M 30 40 L 30 110 M 30 75 L 70 75 M 70 40 L 70 110"
          stroke="#3D4B8C"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter e */}
        <Path
          d="M 110 62 Q 92 62 92 75 Q 92 88 110 88 Q 125 88 125 75 L 92 75"
          stroke="#3D4B8C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter p */}
        <Path
          d="M 145 62 L 145 110 M 145 62 Q 165 62 165 75 Q 165 88 145 88"
          stroke="#3D4B8C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter B with shield design */}
        <G transform="translate(185, 35)">
          {/* B top curve */}
          <Path
            d="M 0 0 L 0 75 M 0 0 Q 35 0 35 18.75 Q 35 37.5 0 37.5"
            stroke="#3D4B8C"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* B bottom curve */}
          <Path
            d="M 0 37.5 Q 40 37.5 40 56.25 Q 40 75 0 75"
            stroke="#3D4B8C"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Shield overlay on B */}
          <Path
            d="M 15 8 L 8 12 L 8 22 Q 8 32 15 37 Q 22 32 22 22 L 22 12 Z"
            fill="none"
            stroke="#5A8CD9"
            strokeWidth="2"
          />
        </G>
        
        {/* Letter w */}
        <Path
          d="M 245 62 L 255 100 L 270 62 L 285 100 L 295 62"
          stroke="#3D4B8C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter i */}
        <Circle cx="320" cy="55" r="6" fill="#3D4B8C" />
        <Path
          d="M 320 68 L 320 100"
          stroke="#3D4B8C"
          strokeWidth="14"
          strokeLinecap="round"
        />
        
        {/* Letter n */}
        <Path
          d="M 345 100 L 345 62 Q 345 62 360 62 Q 375 62 375 75 L 375 100"
          stroke="#3D4B8C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Blue dot accent */}
        <Circle cx="390" cy="55" r="8" fill="#5A8CD9" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
