import React from 'react';
import { Pressable, Text } from 'react-native';

export default function TabButton({ styles, label, active, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.segmentBtn,
        active && styles.segmentBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}
