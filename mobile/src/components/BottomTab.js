import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function BottomTab({ styles, label, active, onPress }) {
  const iconByTab = {
    Home: { active: 'home', inactive: 'home-outline' },
    Shop: { active: 'bag-handle', inactive: 'bag-handle-outline' },
    Scan: { active: 'qr-code', inactive: 'qr-code-outline' },
    Rewards: { active: 'gift', inactive: 'gift-outline' },
    Profil: { active: 'person', inactive: 'person-outline' },
  };
  const iconSpec = iconByTab[label] || { active: 'ellipse', inactive: 'ellipse-outline' };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bottomTabBtn,
        active && styles.bottomTabBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      {active && <View pointerEvents="none" style={styles.bottomTabActiveGlow} />}
      {active && <View pointerEvents="none" style={styles.bottomTabActiveBeam} />}
      <Ionicons
        name={active ? iconSpec.active : iconSpec.inactive}
        size={18}
        color={active ? THEME.ink : THEME.mutedSoft}
      />
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}
