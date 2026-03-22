import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

export default function HeaderSearchOverlay({
  styles,
  mowgliTheme,
  closeHeaderSearch,
  headerSearchQuery,
  setHeaderSearchQuery,
  globalSearchResults,
  searchResultIcon,
  onGlobalSearchSelect,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'light' });
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    const runAnimation = (reduceMotion = false) => {
      if (!active) return;
      if (reduceMotion) {
        backdropAnim.setValue(1);
        cardAnim.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 170,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 230,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then(runAnimation)
      .catch(() => runAnimation(false));

    return () => {
      active = false;
    };
  }, [backdropAnim, cardAnim]);

  return (
    <View style={styles.overlayLayer} pointerEvents="box-none">
      <Animated.View style={[styles.overlayBackdrop, { opacity: backdropAnim }]}>
        <Pressable style={styles.overlayBackdropTouch} onPress={closeHeaderSearch} />
      </Animated.View>
      <Animated.View
        style={[
          styles.mowgliOverlayCard,
          {
            backgroundColor: theme.shell,
            borderColor: theme.border,
          },
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View pointerEvents="none" style={[styles.mowgliHeroGlow, { backgroundColor: theme.heroGlow }]} />
        <View pointerEvents="none" style={[styles.mowgliHeroShimmer, { backgroundColor: theme.borderStrong }]} />
        <View style={styles.mowgliOverlayHeader}>
          <View style={styles.mowgliOverlayTitleStack}>
            <Text style={[styles.mowgliOverlayEyebrow, { color: theme.accent }]}>SUCHE</Text>
            <Text style={[styles.mowgliOverlayTitle, { color: theme.text }]}>Schnell finden</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.mowgliHeaderAction,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
              pressed && styles.mowgliLiftSoft,
            ]}
            onPress={closeHeaderSearch}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </Pressable>
        </View>
        <Text style={[styles.mowgliOverlaySubtitle, { color: theme.textMuted }]}>
          Treatments, Mitgliedschaften und Beiträge deiner Klinik an einem Ort.
        </Text>
        <View style={[styles.mowgliOverlayDivider, { backgroundColor: theme.border }]} />
        <View style={[styles.mowgliOverlayInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.mowgliOverlayInput, { color: theme.text }]}
            value={headerSearchQuery}
            onChangeText={setHeaderSearchQuery}
            placeholder="Treatments, Mitgliedschaften, Beiträge"
            placeholderTextColor={theme.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
            selectionColor={theme.accent}
          />
        </View>

        {!headerSearchQuery.trim() && (
          <Text style={[styles.mowgliOverlayHint, { color: theme.textMuted }]}>
            Tipp: Suche nach „Laser“, „Mikrodermabrasion“ oder „Silber“.
          </Text>
        )}

        {!!headerSearchQuery.trim() && globalSearchResults.length === 0 && (
          <Text style={[styles.mowgliOverlayHint, { color: theme.textMuted }]}>Keine Ergebnisse gefunden.</Text>
        )}

        {!!headerSearchQuery.trim() && globalSearchResults.length > 0 && (
          <ScrollView
            style={styles.mowgliOverlayResults}
            contentContainerStyle={styles.mowgliOverlayResultsContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.mowgliOverlaySectionLabel, { color: theme.textMuted }]}>Ergebnisse</Text>
            {globalSearchResults.map((item) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                style={({ pressed }) => [
                  styles.mowgliOverlayResultRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  pressed && styles.mowgliLiftSoft,
                ]}
                onPress={() => onGlobalSearchSelect(item)}
              >
                <View style={[styles.mowgliOverlayResultIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Ionicons name={searchResultIcon(item.type)} size={16} color={theme.accent} />
                </View>
                <View style={styles.mowgliOverlayResultCopy}>
                  <Text style={[styles.mowgliOverlayResultTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.mowgliOverlayResultMeta, { color: theme.textMuted }]}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}
