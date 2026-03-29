import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

const TAB_SPECS = [
  { id: 'home', activeIcon: 'home', icon: 'home-outline' },
  { id: 'shop', activeIcon: 'bag-handle', icon: 'bag-handle-outline' },
  { id: 'scan', activeIcon: 'qr-code', icon: 'qr-code-outline', center: true },
  { id: 'rewards', activeIcon: 'gift', icon: 'gift-outline' },
  { id: 'profile', activeIcon: 'person', icon: 'person-outline' },
];

export default function BottomNavigation({ styles, mowgliTheme, mainTab, switchMainTab }) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });

  return (
    <View style={[
      styles.mowgliBottomBar,
      {
        backgroundColor: theme.shell,
        borderColor: theme.border,
      },
    ]}>
      {TAB_SPECS.map((tab) => {
        const active = mainTab === tab.id;
        const isCenter = Boolean(tab.center);
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.mowgliBottomTab,
              isCenter && styles.mowgliBottomTabCenter,
              active && !isCenter && [styles.mowgliBottomTabActive, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }],
              active && isCenter && [styles.mowgliBottomTabCenterActive, { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong }],
              pressed && styles.mowgliLiftSoft,
            ]}
            onPress={() => switchMainTab(tab.id)}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={isCenter ? 22 : 22}
              color={isCenter
                ? (active ? theme.primaryButtonText : theme.text)
                : (active ? theme.accent : theme.textMuted)}
            />
            {!isCenter && active && <View style={[styles.mowgliBottomIndicator, { backgroundColor: theme.accent }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}
