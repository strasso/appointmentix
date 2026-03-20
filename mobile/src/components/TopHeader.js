import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function TopHeader({
  styles,
  title,
  sectionLabel,
  subtitle,
  clinicShortName,
  clinicName,
  onSearchPress,
  onCartPress,
  cartCount = 0,
}) {
  const safeCartCount = Math.max(0, Number(cartCount || 0));
  const cartBadgeText = safeCartCount > 99 ? '99+' : String(safeCartCount);
  const safeClinicName = String(clinicName || clinicShortName || 'Curabo').trim();
  const safeClinicShortName = String(clinicShortName || clinicName || 'A').trim();

  return (
    <View style={styles.headerShell}>
      <View style={styles.headerContextRow}>
        <View style={styles.headerContextPill}>
          <View style={styles.headerContextDot} />
          <Text style={styles.headerContextText}>{sectionLabel || 'Curabo App'}</Text>
        </View>
        <Text style={styles.headerContextMeta} numberOfLines={1}>
          {safeClinicName}
        </Text>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <View pointerEvents="none" style={styles.headerAvatarGlow} />
            <Text style={styles.headerAvatarText}>{safeClinicShortName.slice(0, 1)}</Text>
          </View>
          <View style={styles.headerTitleStack}>
          <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerMetaRow}>
              <Text style={styles.headerClinic}>{clinicShortName || 'APP'}</Text>
              <Text style={styles.headerSubline}>{subtitle || 'Klinikmodus aktiv'}</Text>
            </View>
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
    </View>
  );
}
