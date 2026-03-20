import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function HeaderSearchOverlay({
  styles,
  closeHeaderSearch,
  headerSearchQuery,
  setHeaderSearchQuery,
  globalSearchResults,
  searchResultIcon,
  onGlobalSearchSelect,
}) {
  return (
    <View style={styles.overlayLayer} pointerEvents="box-none">
      <Pressable style={styles.overlayBackdrop} onPress={closeHeaderSearch} />
      <View style={styles.searchOverlayCard}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.overlayCardGloss} />
        <View style={styles.searchOverlayHeader}>
          <View style={styles.overlayTitleStack}>
            <Text style={styles.overlayEyebrow}>DISCOVER</Text>
            <Text style={styles.searchOverlayTitle}>Suchen</Text>
          </View>
          <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderSearch}>
            <Ionicons name="close" size={20} color={THEME.inkSoft} />
          </Pressable>
        </View>
        <Text style={styles.overlaySubTitle}>Treatments, Memberships und Artikel an einem Ort.</Text>
        <TextInput
          style={styles.searchOverlayInput}
          value={headerSearchQuery}
          onChangeText={setHeaderSearchQuery}
          placeholder="Treatments, Memberships, Artikel"
          placeholderTextColor={THEME.muted}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {!headerSearchQuery.trim() && (
          <Text style={styles.searchOverlayHint}>
            Tipp: Suche nach „Laser“, „Mikrodermabrasion“ oder „Silber“.
          </Text>
        )}

        {!!headerSearchQuery.trim() && globalSearchResults.length === 0 && (
          <Text style={styles.searchOverlayHint}>Keine Ergebnisse gefunden.</Text>
        )}

        {!!headerSearchQuery.trim() && globalSearchResults.length > 0 && (
          <ScrollView
            style={styles.searchOverlayResults}
            contentContainerStyle={styles.searchOverlayResultsContent}
            keyboardShouldPersistTaps="handled"
          >
            {globalSearchResults.map((item) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                style={styles.searchOverlayRow}
                onPress={() => onGlobalSearchSelect(item)}
              >
                <View style={styles.searchOverlayIconWrap}>
                  <Ionicons name={searchResultIcon(item.type)} size={16} color={THEME.accent} />
                </View>
                <View style={styles.searchOverlayMain}>
                  <Text style={styles.searchOverlayRowTitle}>{item.title}</Text>
                  <Text style={styles.searchOverlayRowMeta}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={THEME.mutedSoft} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
