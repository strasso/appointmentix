import React, { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FaceContourIcon from '../components/FaceContourIcon';
import HairFollicleIcon from '../components/HairFollicleIcon';
import InjectableIcon from '../components/InjectableIcon';
import { createMowgliTheme } from '../theme/tokens';

function HeaderAction({ styles, theme, icon, onPress, badge = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliHeaderAction,
        { backgroundColor: 'transparent', borderColor: 'transparent' },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={21} color={theme.text} />
      {badge && <View style={[styles.mowgliHeaderActionDot, { backgroundColor: theme.accent }]} />}
    </Pressable>
  );
}

function ShopTab({ styles, theme, label, active, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliShopTab,
        { backgroundColor: active ? theme.surface : 'transparent', borderColor: active ? theme.borderStrong : 'transparent' },
        active && styles.mowgliShopTabActive,
        pressed && !active && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.mowgliShopTabText,
          { color: active ? theme.accent : theme.textMuted },
          active && styles.mowgliShopTabTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryIcon({ catId, active }) {
  const normalized = String(catId || '').toLowerCase();
  if (normalized === 'gesicht') return <FaceContourIcon active={active} />;
  if (normalized === 'haare') return <HairFollicleIcon active={active} />;
  if (normalized === 'injectables') return <InjectableIcon active={active} />;
  return null;
}

function CategoryPill({ styles, theme, cat, active, onPress, categoryIconName }) {
  const fallbackIcon = categoryIconName(cat.id);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliCategoryPill,
        {
          backgroundColor: active ? theme.surface : theme.surfaceAlt,
          borderColor: active ? theme.borderStrong : theme.border,
        },
        active && styles.mowgliCategoryPillActive,
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.mowgliCategoryIconWrap,
          {
            backgroundColor: active ? theme.accentSurface : theme.input,
            borderColor: active ? theme.accentBorder : theme.border,
          },
          active && styles.mowgliCategoryIconWrapActive,
        ]}
      >
        <CategoryIcon catId={cat.id} active={active} />
        {!['gesicht', 'haare', 'injectables'].includes(String(cat.id || '').toLowerCase()) && (
          <Ionicons name={fallbackIcon} size={17} color={active ? theme.accent : theme.textMuted} />
        )}
      </View>
      <Text
        style={[
          styles.mowgliCategoryPillText,
          { color: active ? theme.text : theme.textSoft },
          active && styles.mowgliCategoryPillTextActive,
        ]}
      >
        {cat.label}
      </Text>
    </Pressable>
  );
}

function ProductCard({ styles, theme, item, onPress, formatPrice, getImageUrl, categoryLabel }) {
  const imageUrl = getImageUrl(item);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliProductCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliQuickActionPressed,
      ]}
      onPress={() => onPress(item)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.mowgliProductImage, { height: 180 }]} />
      ) : (
        <View style={[styles.mowgliProductImageFallback, { backgroundColor: theme.input, height: 180 }]}>
          <Ionicons name="sparkles-outline" size={22} color={theme.accent} />
        </View>
      )}
      <View style={styles.mowgliProductBody}>
        <View style={styles.mowgliProductMetaRow}>
          <Text style={[styles.mowgliProductMeta, { color: theme.accent }]}>{categoryLabel}</Text>
          <Text style={[styles.mowgliProductPrice, { color: theme.text }]}>{formatPrice(item.priceCents)}</Text>
        </View>
        <Text style={[styles.mowgliProductTitle, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View
          style={{
            marginTop: 14,
            minHeight: 36,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.accentBorder,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.mode === 'dark' ? theme.surfaceAlt : theme.shellAlt,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>Ansehen</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ShopScreen({
  styles,
  mowgliTheme,
  cartCount,
  onSearchPress,
  onCartPress,
  shopTab,
  setShopTab,
  selectedTreatment,
  treatmentCategories,
  categoryId,
  setCategoryId,
  categoryIconName,
  selectedCategory,
  browseItems,
  openTreatment,
  preferredTreatmentImage,
  setSelectedTreatment,
  units,
  setUnits,
  formatPrice,
  hasActiveMembership,
  cartSyncing,
  checkoutLoading,
  addToCart,
  cartCtaLabel,
  memberships,
  membershipStatus,
  treatments,
  membershipSyncing,
  activateMembership,
  hasCart,
  cartItems,
  totalCartCents,
  selectedCheckoutMethod,
  setSelectedCheckoutMethod,
  checkoutMethodOptions,
  runCheckout,
  checkoutCtaLabel,
  openMembershipTreatment,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMode, setSortMode] = useState('featured');

  const sortedBrowseItems = useMemo(() => {
    const items = [...browseItems];
    if (sortMode === 'price') return items.sort((a, b) => (a.priceCents || 0) - (b.priceCents || 0));
    if (sortMode === 'duration') return items.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    return items;
  }, [browseItems, sortMode]);

  const sortLabel = sortMode === 'featured' ? 'Sortieren' : sortMode === 'price' ? 'Preis' : 'Dauer';

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === 'featured') return 'price';
      if (prev === 'price') return 'duration';
      return 'featured';
    });
  };

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={[styles.mowgliHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <View style={styles.mowgliHeaderCopy}>
          <Text style={[styles.mowgliHeaderTitle, { color: theme.text }]}>Shop</Text>
        </View>
        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={[styles.mowgliShopTabsRow, { backgroundColor: theme.shellAlt, borderColor: theme.border }]}>
        <ShopTab styles={styles} theme={theme} label="Treatments" active={shopTab === 'browse'} onPress={() => setShopTab('browse')} />
        <ShopTab styles={styles} theme={theme} label="Memberships" active={shopTab === 'membership'} onPress={() => setShopTab('membership')} />
        <ShopTab styles={styles} theme={theme} label="Gutscheine" active={shopTab === 'treatments'} onPress={() => setShopTab('treatments')} />
      </View>

      {shopTab === 'browse' && !selectedTreatment && (
        <View style={styles.mowgliShopSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 }}>
            <Pressable
              onPress={() => setFiltersOpen((prev) => !prev)}
              style={({ pressed }) => [pressed && styles.mowgliLiftSoft, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}
            >
              <Ionicons name="options-outline" size={16} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '500' }}>Filter</Text>
            </Pressable>
            <Pressable
              onPress={cycleSortMode}
              style={({ pressed }) => [pressed && styles.mowgliLiftSoft, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}
            >
              <Ionicons name="swap-vertical-outline" size={16} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: '500' }}>{sortLabel}</Text>
            </Pressable>
          </View>

          {filtersOpen && (
            <View style={styles.mowgliCategoryPillRow}>
              {treatmentCategories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  styles={styles}
                  theme={theme}
                  cat={cat}
                  active={categoryId === cat.id}
                  categoryIconName={categoryIconName}
                  onPress={() => setCategoryId(cat.id)}
                />
              ))}
            </View>
          )}

          <View style={styles.mowgliProductGrid}>
            {sortedBrowseItems.map((item) => (
              <ProductCard
                key={item.id}
                styles={styles}
                theme={theme}
                item={item}
                onPress={openTreatment}
                getImageUrl={preferredTreatmentImage}
                formatPrice={formatPrice}
                categoryLabel={selectedCategory?.label || item.category || 'Treatment'}
              />
            ))}
          </View>

          {sortedBrowseItems.length === 0 && (
            <View style={[styles.mowgliEmptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search-outline" size={18} color={theme.textMuted} />
              <Text style={[styles.mowgliEmptyTitle, { color: theme.text }]}>Keine Treatments in dieser Kategorie</Text>
              <Text style={[styles.mowgliEmptyBody, { color: theme.textMuted }]}>Passe den Filter an oder wähle eine andere Kategorie.</Text>
            </View>
          )}
        </View>
      )}

      {shopTab === 'browse' && selectedTreatment && (
        <View style={styles.mowgliDetailStage}>
          <View style={styles.mowgliDetailHero}>
            {preferredTreatmentImage(selectedTreatment) ? (
              <Image source={{ uri: preferredTreatmentImage(selectedTreatment) }} style={styles.mowgliDetailHeroImage} />
            ) : (
              <View style={[styles.mowgliDetailImageFallback, { backgroundColor: theme.input }]}>
                <Ionicons name="sparkles-outline" size={28} color={theme.accent} />
              </View>
            )}
            <View style={[styles.mowgliDetailHeroOverlay, { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.44)' : 'rgba(18,14,10,0.18)' }]} />
            <View style={styles.mowgliDetailHeroNavRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.mowgliDetailHeroNavButton,
                  { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                  pressed && styles.mowgliLiftSoft,
                ]}
                onPress={() => setSelectedTreatment(null)}
              >
                <Ionicons name="arrow-back" size={18} color={theme.text} />
              </Pressable>
              <View style={[styles.mowgliDetailHeroNavButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Ionicons name="heart-outline" size={18} color={theme.text} />
              </View>
            </View>
          </View>

          <View style={styles.mowgliDetailContent}>
            <View style={styles.mowgliDetailHeadingRow}>
              <Text style={[styles.mowgliDetailTitle, { color: theme.text }]}>{selectedTreatment.name}</Text>
              <View style={styles.mowgliDetailPriceStack}>
                <Text style={[styles.mowgliDetailHeroPrice, { color: theme.accent }]}>{formatPrice(selectedTreatment.priceCents)}</Text>
                <Text style={[styles.mowgliDetailHeroPriceMeta, { color: theme.textMuted }]}>pro Sitzung</Text>
              </View>
            </View>

            <View style={styles.mowgliDetailTagRow}>
              <View style={[styles.mowgliDetailTagChip, { borderColor: theme.borderStrong }]}>
                <Ionicons name="time-outline" size={13} color={theme.accent} />
                <Text style={[styles.mowgliDetailTagText, { color: theme.accent }]}>{selectedTreatment.durationMinutes} Min</Text>
              </View>
              <View style={[styles.mowgliDetailTagChip, { borderColor: theme.borderStrong }]}>
                <Ionicons name="sparkles-outline" size={13} color={theme.accent} />
                <Text style={[styles.mowgliDetailTagText, { color: theme.accent }]}>
                  {selectedTreatment.categoryLabel || selectedCategory?.label || 'Treatment'}
                </Text>
              </View>
            </View>

            <View style={styles.mowgliDetailSection}>
              <Text style={[styles.mowgliDetailSectionTitle, { color: theme.text }]}>Beschreibung</Text>
              <Text style={[styles.mowgliDetailBody, { color: theme.textSoft }]}>{selectedTreatment.description}</Text>
            </View>

            <View style={styles.mowgliDetailSection}>
              <Text style={[styles.mowgliDetailSectionTitle, { color: theme.text }]}>Vorteile</Text>
              {[
                'Sichtbarer Premium-Effekt direkt nach der Behandlung',
                'Ruhiger, klarer Ablauf innerhalb deiner Klinik-App',
                hasActiveMembership
                  ? 'Mitgliedsvorteile werden automatisch berücksichtigt'
                  : 'Mit aktiver Mitgliedschaft werden Mitgliedspreise freigeschaltet',
              ].map((benefit) => (
                <View key={benefit} style={styles.mowgliDetailBenefitRow}>
                  <Ionicons name="checkmark-outline" size={16} color={theme.accent} />
                  <Text style={[styles.mowgliDetailBenefitText, { color: theme.textSoft }]}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.mowgliUnitsRow}>
              <Pressable style={({ pressed }) => [styles.mowgliUnitsButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }, pressed && styles.mowgliLiftSoft]} onPress={() => setUnits((prev) => Math.max(1, prev - 1))}>
                <Text style={[styles.mowgliUnitsButtonText, { color: theme.text }]}>−</Text>
              </Pressable>
              <View style={[styles.mowgliUnitsValueWrap, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Text style={[styles.mowgliUnitsValue, { color: theme.text }]}>{units} Behandlung(en)</Text>
              </View>
              <Pressable style={({ pressed }) => [styles.mowgliUnitsButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }, pressed && styles.mowgliLiftSoft]} onPress={() => setUnits((prev) => prev + 1)}>
                <Text style={[styles.mowgliUnitsButtonText, { color: theme.text }]}>＋</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.mowgliDetailStickyBar, { backgroundColor: theme.page, borderColor: theme.border }]}>
            <Pressable
              style={({ pressed }) => [
                styles.mowgliDetailSecondaryCta,
                { backgroundColor: theme.secondaryButtonBg, borderColor: theme.secondaryButtonBorder },
                (cartSyncing || checkoutLoading) && styles.ctaDisabled,
                pressed && !(cartSyncing || checkoutLoading) && styles.mowgliLiftSoft,
              ]}
              disabled={cartSyncing || checkoutLoading}
              onPress={() => {
                void addToCart();
              }}
            >
              <Ionicons name="bag-add-outline" size={14} color={theme.secondaryButtonText} />
              <Text style={[styles.mowgliDetailSecondaryCtaText, { color: theme.secondaryButtonText }]}>In den Warenkorb</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.mowgliHeroCta,
                { flex: 1, backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
                (cartSyncing || checkoutLoading) && styles.ctaDisabled,
                pressed && !(cartSyncing || checkoutLoading) && styles.mowgliLiftSoft,
              ]}
              disabled={cartSyncing || checkoutLoading}
              onPress={() => {
                void addToCart();
              }}
            >
              <Text style={[styles.mowgliHeroCtaText, { color: theme.primaryButtonText }]}>{cartCtaLabel}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {shopTab === 'membership' && (
        <View style={styles.mowgliShopSection}>
          <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Memberships</Text>

          {memberships.map((plan) => {
            const active = membershipStatus?.status === 'active' && membershipStatus?.membershipId === plan.id;
            const recovering = membershipStatus?.status === 'past_due' && membershipStatus?.membershipId === plan.id;
            const highlightedPerks = (Array.isArray(plan.perks) ? plan.perks : []).slice(0, 4);
            const planIncludedIds = Array.isArray(plan.includedTreatmentIds) ? plan.includedTreatmentIds : [];
            const includedTreatments = treatments.filter((item) => planIncludedIds.includes(item.id)).slice(0, 3);
            return (
              <View
                key={plan.id}
                style={[
                  styles.mowgliMembershipPlanCard,
                  active && styles.mowgliMembershipPlanCardActive,
                  { backgroundColor: active ? theme.chipBg : theme.shell, borderColor: active ? theme.borderStrong : theme.border },
                ]}
              >
                <View style={styles.mowgliMembershipPlanTopRow}>
                  <View style={styles.mowgliMembershipPlanCopy}>
                    <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Mitgliedschaft</Text>
                    <Text style={[styles.mowgliMembershipPlanTitle, { color: theme.text }]}>{plan.name}</Text>
                  </View>
                  <Text style={[styles.mowgliMembershipPlanPrice, { color: theme.accent }]}>{formatPrice(plan.priceCents)} / Monat</Text>
                </View>

                {highlightedPerks.map((perk, index) => (
                  <View key={`${plan.id}-perk-${index}`} style={styles.mowgliMembershipPerkRow}>
                    <Ionicons name="checkmark-outline" size={15} color={theme.accent} />
                    <Text style={[styles.mowgliMembershipPerkText, { color: theme.textSoft }]}>{perk}</Text>
                  </View>
                ))}

                {includedTreatments.length > 0 && (
                  <View style={styles.mowgliIncludedList}>
                    <Text style={[styles.mowgliIncludedLabel, { color: theme.textMuted }]}>Inklusive Treatments</Text>
                    {includedTreatments.map((item) => (
                      <Pressable
                        key={`${plan.id}-${item.id}`}
                        style={({ pressed }) => [
                          styles.mowgliIncludedCard,
                          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                          pressed && styles.mowgliLiftSoft,
                        ]}
                        onPress={() => openMembershipTreatment(item)}
                      >
                        <Text style={[styles.mowgliIncludedCardTitle, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.mowgliIncludedCardMeta, { color: theme.textMuted }]}>1 Behandlung • Mehr erfahren</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    active ? styles.mowgliMembershipCtaActive : styles.mowgliMembershipCta,
                    {
                      backgroundColor: active ? theme.secondaryButtonBg : theme.primaryButtonBg,
                      borderColor: active ? theme.secondaryButtonBorder : theme.borderStrong,
                    },
                    membershipSyncing && styles.ctaDisabled,
                    pressed && !membershipSyncing && styles.mowgliLiftSoft,
                  ]}
                  disabled={membershipSyncing}
                  onPress={() => {
                    void activateMembership(plan.id);
                  }}
                >
                  <Text
                    style={[
                      active ? styles.mowgliMembershipCtaTextActive : styles.mowgliMembershipCtaText,
                      { color: active ? theme.secondaryButtonText : theme.primaryButtonText },
                    ]}
                  >
                    {active
                      ? 'Aktiv'
                      : recovering
                        ? 'Zahlung fehlgeschlagen – reaktivieren'
                        : membershipSyncing
                          ? 'Wird aktiviert ...'
                          : 'Mitgliedschaft starten'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {shopTab === 'treatments' && (
        <View style={styles.mowgliShopSection}>
          <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Katalog</Text>
          {treatments.map((item) => (
            <View key={item.id} style={[styles.mowgliCatalogRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.mowgliCatalogCopy}>
                <Text style={[styles.mowgliCatalogTitle, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.mowgliCatalogBody, { color: theme.textMuted }]}>{item.description}</Text>
              </View>
              <View style={styles.mowgliCatalogMeta}>
                <Text style={[styles.mowgliCatalogPrice, { color: theme.text }]}>{formatPrice(item.priceCents)}</Text>
                <Text style={[styles.mowgliCatalogDuration, { color: theme.accent }]}>{item.durationMinutes} Min</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {hasCart && (
        <View style={[styles.mowgliCartCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
          <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Checkout</Text>
          <Text style={[styles.mowgliCartTitle, { color: theme.text }]}>Warenkorb ({cartItems.length})</Text>
          {cartItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={[styles.mowgliCartItem, { color: theme.textSoft }]}>
              {item.name} • {item.units}x • {formatPrice(item.totalCents)}
            </Text>
          ))}
          <Text style={[styles.mowgliCartTotal, { color: theme.text }]}>Gesamt: {formatPrice(totalCartCents)}</Text>
          <View style={styles.mowgliCheckoutMethodRow}>
            {checkoutMethodOptions.map((option) => {
              const active = selectedCheckoutMethod === option.id;
              return (
                <Pressable
                  key={`box-${option.id}`}
                  style={({ pressed }) => [
                    styles.mowgliCheckoutMethodChip,
                    {
                      backgroundColor: active ? theme.primaryButtonBg : theme.surfaceAlt,
                      borderColor: active ? theme.borderStrong : theme.border,
                    },
                    active && styles.mowgliCheckoutMethodChipActive,
                    pressed && styles.mowgliLiftSoft,
                  ]}
                  onPress={() => setSelectedCheckoutMethod(option.id)}
                >
                  <Text
                    style={[
                      styles.mowgliCheckoutMethodChipText,
                      { color: active ? theme.primaryButtonText : theme.text },
                      active && styles.mowgliCheckoutMethodChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.mowgliHeroCta,
              { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
              (checkoutLoading || cartSyncing) && styles.ctaDisabled,
              pressed && !(checkoutLoading || cartSyncing) && styles.mowgliLiftSoft,
            ]}
            disabled={checkoutLoading || cartSyncing}
            onPress={() => {
              void runCheckout();
            }}
          >
            <Text style={[styles.mowgliHeroCtaText, { color: theme.primaryButtonText }]}>{checkoutCtaLabel}</Text>
            <Ionicons name="arrow-forward" size={15} color={theme.primaryButtonText} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
