import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ShopTabButton({ styles, label, active, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.shopTabBtn,
        active && styles.shopTabBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.shopTabText, active && styles.shopTabTextActive]}>{label}</Text>
      <View style={[styles.shopTabUnderline, active && styles.shopTabUnderlineActive]} />
    </Pressable>
  );
}
