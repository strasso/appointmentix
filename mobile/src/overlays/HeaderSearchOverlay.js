import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
          styles.searchOverlayCard,
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
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.overlayCardGloss} />
        <View style={styles.searchOverlayHeader}>
          <View style={styles.overlayTitleStack}>
            <Text style={styles.overlayEyebrow}>SUCHE</Text>
            <Text style={styles.searchOverlayTitle}>Schnell finden</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.overlayCloseBtn, pressed && styles.tapScaleSoft]}
            onPress={closeHeaderSearch}
          >
            <Ionicons name="close" size={20} color={THEME.inkSoft} />
          </Pressable>
        </View>
        <Text style={styles.overlaySubTitle}>Treatments, Mitgliedschaften und Beiträge deiner Klinik an einem Ort.</Text>
        <View style={styles.overlayHeaderDivider} />
        <View style={styles.searchOverlayInputShell}>
          <Ionicons name="search-outline" size={18} color={THEME.mutedSoft} />
          <TextInput
            style={styles.searchOverlayInput}
            value={headerSearchQuery}
            onChangeText={setHeaderSearchQuery}
            placeholder="Treatments, Mitgliedschaften, Beiträge"
            placeholderTextColor={THEME.muted}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

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
            <Text style={styles.overlaySectionLabel}>Ergebnisse</Text>
            {globalSearchResults.map((item) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                style={({ pressed }) => [styles.searchOverlayRow, pressed && styles.listRowPressed]}
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
      </Animated.View>
    </View>
  );
}
