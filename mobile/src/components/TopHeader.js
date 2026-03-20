import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function TopHeader({
  styles,
  title,
  clinicShortName,
  onSearchPress,
  onCartPress,
  cartCount = 0,
}) {
  const safeCartCount = Math.max(0, Number(cartCount || 0));
  const cartBadgeText = safeCartCount > 99 ? '99+' : String(safeCartCount);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{String(clinicShortName || 'A').slice(0, 1)}</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerClinic}>{clinicShortName || 'APP'}</Text>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButtonWrap,
            pressed && styles.tapScaleSoft,
          ]}
          onPress={onSearchPress}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color={THEME.inkSoft} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButtonWrap,
            pressed && styles.tapScaleSoft,
          ]}
          onPress={onCartPress}
          hitSlop={8}
        >
          <Ionicons name="bag-handle-outline" size={21} color={THEME.inkSoft} />
          {safeCartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>{cartBadgeText}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
