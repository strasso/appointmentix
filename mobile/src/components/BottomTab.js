import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function BottomTab({ styles, label, active, onPress }) {
  const isCenterTab = label === 'Scan';
  const iconByTab = {
    Start: { active: 'home', inactive: 'home-outline' },
    Shop: { active: 'bag-handle', inactive: 'bag-handle-outline' },
    Scan: { active: 'qr-code', inactive: 'qr-code-outline' },
    Vorteile: { active: 'gift', inactive: 'gift-outline' },
    Profil: { active: 'person', inactive: 'person-outline' },
  };
  const iconSpec = iconByTab[label] || { active: 'ellipse', inactive: 'ellipse-outline' };
  const iconColor = isCenterTab ? '#FFFFFF' : active ? THEME.ink : THEME.mutedSoft;
  const labelColorStyle = isCenterTab ? styles.bottomTabLabelCenter : active ? styles.bottomTabLabelActive : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bottomTabBtn,
        isCenterTab && styles.bottomTabBtnCenter,
        active && styles.bottomTabBtnActive,
        active && isCenterTab && styles.bottomTabBtnCenterActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      {active && <View pointerEvents="none" style={styles.bottomTabActiveGlow} />}
      {active && <View pointerEvents="none" style={styles.bottomTabActiveBeam} />}
      <Ionicons
        name={active ? iconSpec.active : iconSpec.inactive}
        size={18}
        color={iconColor}
      />
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive, labelColorStyle]}>{label}</Text>
    </Pressable>
  );
}
