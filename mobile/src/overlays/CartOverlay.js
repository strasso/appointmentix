import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
  return (
    <View style={styles.overlayLayer} pointerEvents="box-none">
      <Pressable style={styles.overlayBackdrop} onPress={closeHeaderCart} />
      <View style={styles.cartOverlayCard}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.overlayCardGloss} />
        <View style={styles.searchOverlayHeader}>
          <View style={styles.overlayTitleStack}>
            <Text style={styles.overlayEyebrow}>CHECKOUT</Text>
            <Text style={styles.searchOverlayTitle}>Warenkorb</Text>
          </View>
          <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderCart}>
            <Ionicons name="close" size={20} color={THEME.inkSoft} />
          </Pressable>
        </View>
        <Text style={styles.overlaySubTitle}>Pruefe deine Auswahl und schliesse den Kauf sauber ab.</Text>

        {cartItems.length === 0 ? (
          <Text style={styles.searchOverlayHint}>Dein Warenkorb ist aktuell leer.</Text>
        ) : (
          <ScrollView
            style={styles.searchOverlayResults}
            contentContainerStyle={styles.searchOverlayResultsContent}
          >
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartOverlayRow}>
                <View style={styles.cartOverlayMain}>
                  <Text style={styles.cartOverlayName}>{item.name}</Text>
                  <Text style={styles.cartOverlayMeta}>Einzelpreis: {formatPrice(item.unitCents)}</Text>
                  <View style={styles.cartOverlayControlsRow}>
                    <Pressable
                      style={styles.cartOverlayStepBtn}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) - 1)}
                    >
                      <Text style={styles.cartOverlayStepBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.cartOverlayUnitsText}>{Math.max(1, Number(item.units || 1))}</Text>
                    <Pressable
                      style={styles.cartOverlayStepBtn}
                      onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) + 1)}
                    >
                      <Text style={styles.cartOverlayStepBtnText}>+</Text>
                    </Pressable>
                    <Pressable style={styles.cartOverlayRemoveBtn} onPress={() => removeCartItem(item.id)}>
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
                  style={[styles.checkoutMethodChip, active && styles.checkoutMethodChipActive]}
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
          style={[styles.primaryCta, (checkoutLoading || cartSyncing || cartItems.length === 0) && styles.ctaDisabled]}
          disabled={checkoutLoading || cartSyncing || cartItems.length === 0}
          onPress={() => {
            void runCheckout();
          }}
        >
          <Text style={styles.primaryCtaText}>{checkoutCtaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
