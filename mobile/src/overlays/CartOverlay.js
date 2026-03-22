import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

export default function CartOverlay({
  styles,
  mowgliTheme,
  closeHeaderCart,
  cartItems,
  formatPrice,
  updateCartItemUnits,
  removeCartItem,
  checkoutMethodOptions,
  selectedCheckoutMethod,
  setSelectedCheckoutMethod,
  totalCartCents,
  checkoutLoading,
  cartSyncing,
  runCheckout,
  checkoutCtaLabel,
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
        <Pressable style={styles.overlayBackdropTouch} onPress={closeHeaderCart} />
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
            <Text style={[styles.mowgliOverlayEyebrow, { color: theme.accent }]}>CHECKOUT</Text>
            <Text style={[styles.mowgliOverlayTitle, { color: theme.text }]}>Warenkorb</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.mowgliHeaderAction,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
              pressed && styles.mowgliLiftSoft,
            ]}
            onPress={closeHeaderCart}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </Pressable>
        </View>
        <Text style={[styles.mowgliOverlaySubtitle, { color: theme.textMuted }]}>
          Prüfe deine Auswahl und schließe den Kauf sauber ab.
        </Text>
        <View style={[styles.mowgliOverlayDivider, { backgroundColor: theme.border }]} />

        {cartItems.length === 0 ? (
          <Text style={[styles.mowgliOverlayHint, { color: theme.textMuted }]}>Dein Warenkorb ist aktuell leer.</Text>
        ) : (
          <ScrollView
            style={styles.mowgliOverlayResults}
            contentContainerStyle={styles.mowgliOverlayResultsContent}
          >
            <Text style={[styles.mowgliOverlaySectionLabel, { color: theme.textMuted }]}>Ausgewählte Behandlungen</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={[styles.mowgliCartOverlayRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.mowgliCartOverlayMain}>
                  <Text style={[styles.mowgliCartOverlayName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.mowgliCartOverlayMeta, { color: theme.textMuted }]}>Einzelpreis: {formatPrice(item.unitCents)}</Text>
                  <View style={styles.mowgliCartOverlayControlsRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.mowgliCartOverlayStepBtn,
                        { backgroundColor: theme.input, borderColor: theme.border },
                        pressed && styles.mowgliLiftSoft,
                      ]}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) - 1)}
                    >
                      <Text style={[styles.mowgliCartOverlayStepBtnText, { color: theme.text }]}>−</Text>
                    </Pressable>
                    <Text style={[styles.mowgliCartOverlayUnitsText, { color: theme.text }]}>{Math.max(1, Number(item.units || 1))}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.mowgliCartOverlayStepBtn,
                        { backgroundColor: theme.input, borderColor: theme.border },
                        pressed && styles.mowgliLiftSoft,
                      ]}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) + 1)}
                    >
                      <Text style={[styles.mowgliCartOverlayStepBtnText, { color: theme.text }]}>+</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.mowgliCartOverlayRemoveBtn,
                        { backgroundColor: theme.input, borderColor: theme.border },
                        pressed && styles.mowgliLiftSoft,
                      ]}
                      onPress={() => removeCartItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={theme.accent} />
                      <Text style={[styles.mowgliCartOverlayRemoveText, { color: theme.textSoft }]}>Entfernen</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={[styles.mowgliCartOverlayPrice, { color: theme.text }]}>{formatPrice(item.totalCents)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.mowgliOverlayFooterSection}>
          <Text style={[styles.mowgliOverlaySectionLabel, { color: theme.textMuted }]}>Zahlart</Text>
          <View style={styles.mowgliCheckoutMethodRow}>
            {checkoutMethodOptions.map((option) => {
              const active = selectedCheckoutMethod === option.id;
              return (
                <Pressable
                  key={`overlay-${option.id}`}
                  style={({ pressed }) => [
                    styles.mowgliCheckoutMethodChip,
                    {
                      backgroundColor: active ? theme.primaryButtonBg : theme.secondaryButtonBg,
                      borderColor: active ? theme.borderStrong : theme.secondaryButtonBorder,
                    },
                    pressed && styles.mowgliLiftSoft,
                  ]}
                  onPress={() => setSelectedCheckoutMethod(option.id)}
                >
                  <Text
                    style={[
                      styles.mowgliCheckoutMethodChipText,
                      { color: active ? theme.primaryButtonText : theme.secondaryButtonText },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.mowgliCartOverlayFooter, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[styles.mowgliCartOverlayTotalLabel, { color: theme.textMuted }]}>Gesamt</Text>
          <Text style={[styles.mowgliCartOverlayTotalValue, { color: theme.text }]}>{formatPrice(totalCartCents)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.mowgliHeroCta,
            { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
            (checkoutLoading || cartSyncing || cartItems.length === 0) && styles.ctaDisabled,
            pressed && !(checkoutLoading || cartSyncing || cartItems.length === 0) && styles.mowgliLiftSoft,
          ]}
          disabled={checkoutLoading || cartSyncing || cartItems.length === 0}
          onPress={() => {
            void runCheckout();
          }}
        >
          <Text style={[styles.mowgliHeroCtaText, { color: theme.primaryButtonText }]}>{checkoutCtaLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
