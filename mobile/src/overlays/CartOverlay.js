import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/tokens';

export default function CartOverlay({
  styles,
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
          styles.cartOverlayCard,
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
            <Text style={styles.overlayEyebrow}>CHECKOUT</Text>
            <Text style={styles.searchOverlayTitle}>Warenkorb</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.overlayCloseBtn, pressed && styles.tapScaleSoft]}
            onPress={closeHeaderCart}
          >
            <Ionicons name="close" size={20} color={THEME.inkSoft} />
          </Pressable>
        </View>
        <Text style={styles.overlaySubTitle}>Prüfe deine Auswahl und schließe den Kauf sauber ab.</Text>
        <View style={styles.overlayHeaderDivider} />

        {cartItems.length === 0 ? (
          <Text style={styles.searchOverlayHint}>Dein Warenkorb ist aktuell leer.</Text>
        ) : (
          <ScrollView
            style={styles.searchOverlayResults}
            contentContainerStyle={styles.searchOverlayResultsContent}
          >
            <Text style={styles.overlaySectionLabel}>Ausgewählte Behandlungen</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartOverlayRow}>
                <View style={styles.cartOverlayMain}>
                  <Text style={styles.cartOverlayName}>{item.name}</Text>
                  <Text style={styles.cartOverlayMeta}>Einzelpreis: {formatPrice(item.unitCents)}</Text>
                  <View style={styles.cartOverlayControlsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.cartOverlayStepBtn, pressed && styles.tapScaleSoft]}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) - 1)}
                    >
                      <Text style={styles.cartOverlayStepBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.cartOverlayUnitsText}>{Math.max(1, Number(item.units || 1))}</Text>
                    <Pressable
                      style={({ pressed }) => [styles.cartOverlayStepBtn, pressed && styles.tapScaleSoft]}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) + 1)}
                    >
                      <Text style={styles.cartOverlayStepBtnText}>+</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.cartOverlayRemoveBtn, pressed && styles.tapScaleSoft]}
                      onPress={() => removeCartItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={THEME.brandStrong} />
                      <Text style={styles.cartOverlayRemoveText}>Entfernen</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.cartOverlayPrice}>{formatPrice(item.totalCents)}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.checkoutMethodWrap}>
          <Text style={styles.checkoutMethodLabel}>Zahlart</Text>
          <View style={styles.checkoutMethodRow}>
            {checkoutMethodOptions.map((option) => {
              const active = selectedCheckoutMethod === option.id;
              return (
                <Pressable
                  key={`overlay-${option.id}`}
                  style={({ pressed }) => [
                    styles.checkoutMethodChip,
                    active && styles.checkoutMethodChipActive,
                    pressed && styles.tapScaleSoft,
                  ]}
                  onPress={() => setSelectedCheckoutMethod(option.id)}
                >
                  <Text style={[styles.checkoutMethodChipText, active && styles.checkoutMethodChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.cartOverlayFooter}>
          <Text style={styles.cartOverlayTotalLabel}>Gesamt</Text>
          <Text style={styles.cartOverlayTotalValue}>{formatPrice(totalCartCents)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryCta,
            (checkoutLoading || cartSyncing || cartItems.length === 0) && styles.ctaDisabled,
            pressed && !(checkoutLoading || cartSyncing || cartItems.length === 0) && styles.tapScaleSoft,
          ]}
          disabled={checkoutLoading || cartSyncing || cartItems.length === 0}
          onPress={() => {
            void runCheckout();
          }}
        >
          <Text style={styles.primaryCtaText}>{checkoutCtaLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
