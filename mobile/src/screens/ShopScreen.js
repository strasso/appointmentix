import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FaceContourIcon from '../components/FaceContourIcon';
import HairFollicleIcon from '../components/HairFollicleIcon';
import InjectableIcon from '../components/InjectableIcon';

function HeaderAction({ styles, icon, onPress, badge = false }) {
  return (
    <Pressable style={({ pressed }) => [styles.mowgliHeaderAction, pressed && styles.mowgliLiftSoft]} onPress={onPress}>
      <Ionicons name={icon} size={21} color="#F2ECE3" />
      {badge && <View style={styles.mowgliHeaderActionDot} />}
    </Pressable>
  );
}

function ShopTab({ styles, label, active, onPress }) {
  return (
    <Pressable style={({ pressed }) => [
      styles.mowgliShopTab,
      active && styles.mowgliShopTabActive,
      pressed && !active && styles.mowgliLiftSoft,
    ]} onPress={onPress}>
      <Text style={[styles.mowgliShopTabText, active && styles.mowgliShopTabTextActive]}>{label}</Text>
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

function CategoryPill({ styles, cat, active, onPress, categoryIconName }) {
  const fallbackIcon = categoryIconName(cat.id);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliCategoryPill,
        active && styles.mowgliCategoryPillActive,
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View style={[styles.mowgliCategoryIconWrap, active && styles.mowgliCategoryIconWrapActive]}>
        <CategoryIcon catId={cat.id} active={active} />
        {!['gesicht', 'haare', 'injectables'].includes(String(cat.id || '').toLowerCase()) && (
          <Ionicons
            name={fallbackIcon}
            size={17}
            color={active ? '#0A0A0C' : '#C8A97E'}
          />
        )}
      </View>
      <Text style={[styles.mowgliCategoryPillText, active && styles.mowgliCategoryPillTextActive]}>
        {cat.label}
      </Text>
    </Pressable>
  );
}

function ProductCard({ styles, item, onPress, formatPrice, getImageUrl }) {
  const imageUrl = getImageUrl(item);
  return (
    <Pressable style={({ pressed }) => [styles.mowgliProductCard, pressed && styles.mowgliQuickActionPressed]} onPress={() => onPress(item)}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.mowgliProductImage} />
      ) : (
        <View style={styles.mowgliProductImageFallback}>
          <Ionicons name="sparkles-outline" size={22} color="#C8A97E" />
        </View>
      )}
      <View style={styles.mowgliProductBody}>
        <View style={styles.mowgliProductMetaRow}>
          <Text style={styles.mowgliProductMeta}>{item.durationMinutes} Min</Text>
          <Text style={styles.mowgliProductPrice}>ab {formatPrice(item.priceCents)}</Text>
        </View>
        <Text style={styles.mowgliProductTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.mowgliProductDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </Pressable>
  );
}

export default function ShopScreen({
  styles,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  shopTab,
  setShopTab,
  shopMembershipTabLabel,
  selectedTreatment,
  treatmentCategories,
  categoryId,
  setCategoryId,
  categoryIconName,
  selectedCategory,
  selectedCategoryMeta,
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
  const membershipTabLabel = shopMembershipTabLabel === 'Membership' ? 'Mitgliedschaft' : shopMembershipTabLabel;

  return (
    <View style={styles.mowgliScreenShell}>
      <View style={styles.mowgliHeader}>
        <View style={styles.mowgliHeaderCopy}>
          <View style={styles.mowgliHeaderBrandRow}>
            <Ionicons name="sparkles-outline" size={15} color="#C8A97E" />
            <Text style={styles.mowgliHeaderBrandText}>Curabo Shop</Text>
          </View>
          <Text style={styles.mowgliHeaderTitle}>Shop</Text>
          <Text style={styles.mowgliHeaderSubtitle}>{clinicProfile.name || 'Treatments, Mitgliedschaften und Checkout'}</Text>
        </View>
        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={styles.mowgliShopTabsRow}>
        <ShopTab styles={styles} label="Treatments" active={shopTab === 'browse'} onPress={() => setShopTab('browse')} />
        <ShopTab styles={styles} label={membershipTabLabel} active={shopTab === 'membership'} onPress={() => setShopTab('membership')} />
        <ShopTab styles={styles} label="Katalog" active={shopTab === 'treatments'} onPress={() => setShopTab('treatments')} />
      </View>

      {shopTab === 'browse' && !selectedTreatment && (
        <View style={styles.mowgliShopSection}>
          <View style={styles.mowgliHeroCard}>
            <View pointerEvents="none" style={styles.mowgliHeroGlow} />
            <View pointerEvents="none" style={styles.mowgliHeroShimmer} />
            <View style={styles.mowgliHeroTopRow}>
              <View style={styles.mowgliHeroChip}>
                <Text style={styles.mowgliHeroChipText}>{clinicProfile.shortName || 'APP'}</Text>
              </View>
              <View style={styles.mowgliHeroStatus}>
                <Ionicons name="bag-check-outline" size={13} color="#C8A97E" />
                <Text style={styles.mowgliHeroStatusText}>Kuratierter Shop</Text>
              </View>
            </View>
            <Text style={styles.mowgliHeroEyebrow}>Behandlungen & Pakete</Text>
            <Text style={styles.mowgliHeroTitle}>Dein Einstieg in Treatments, Mitgliedschaften und Vorteile.</Text>
            <Text style={styles.mowgliHeroBody}>
              Die wichtigsten Leistungen deiner Klinik bleiben sortiert, ruhig und kaufbar, ohne wie ein überladener Katalog zu wirken.
            </Text>
          </View>

          <View style={styles.mowgliSectionHead}>
            <Text style={styles.mowgliSectionEyebrow}>Kategorien</Text>
            <Text style={styles.mowgliSectionTitleSmall}>{selectedCategory?.label || 'Treatments filtern'}</Text>
          </View>
          <View style={styles.mowgliCategoryPillRow}>
            {treatmentCategories.map((cat) => (
              <CategoryPill
                key={cat.id}
                styles={styles}
                cat={cat}
                active={categoryId === cat.id}
                categoryIconName={categoryIconName}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </View>

          <View style={styles.mowgliSectionHeadCompact}>
            <Text style={styles.mowgliSectionEyebrow}>Auswahl</Text>
            <Text style={styles.mowgliSectionTitleSmall}>Für {selectedCategory?.label || categoryId}</Text>
            <Text style={styles.mowgliShopLead}>{selectedCategoryMeta.description}</Text>
          </View>

          <View style={styles.mowgliProductGrid}>
            {browseItems.map((item) => (
              <ProductCard
                key={item.id}
                styles={styles}
                item={item}
                onPress={openTreatment}
                getImageUrl={preferredTreatmentImage}
                formatPrice={formatPrice}
              />
            ))}
          </View>

          {browseItems.length === 0 && (
            <View style={styles.mowgliEmptyCard}>
              <Ionicons name="search-outline" size={18} color="#8F8579" />
              <Text style={styles.mowgliEmptyTitle}>Keine Treatments in dieser Kategorie</Text>
              <Text style={styles.mowgliEmptyBody}>Passe später den Katalog im Backend an oder wähle eine andere Kategorie.</Text>
            </View>
          )}
        </View>
      )}

      {shopTab === 'browse' && selectedTreatment && (
        <View style={styles.mowgliDetailCard}>
          <Pressable style={({ pressed }) => [styles.mowgliTextLink, pressed && styles.mowgliLiftSoft]} onPress={() => setSelectedTreatment(null)}>
            <Text style={styles.mowgliTextLinkText}>Zurück zur Übersicht</Text>
            <Ionicons name="arrow-back" size={13} color="#C8A97E" />
          </Pressable>

          {preferredTreatmentImage(selectedTreatment) ? (
            <Image source={{ uri: preferredTreatmentImage(selectedTreatment) }} style={styles.mowgliDetailImage} />
          ) : (
            <View style={styles.mowgliDetailImageFallback}>
              <Ionicons name="sparkles-outline" size={28} color="#C8A97E" />
            </View>
          )}

          {Array.isArray(selectedTreatment.galleryUrls) && selectedTreatment.galleryUrls.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mowgliDetailGalleryRow}
            >
              {selectedTreatment.galleryUrls.slice(0, 6).map((url) => (
                <Image key={`${selectedTreatment.id}-${url}`} source={{ uri: url }} style={styles.mowgliDetailThumbImage} />
              ))}
            </ScrollView>
          )}

          <Text style={styles.mowgliSectionEyebrow}>Treatment</Text>
          <Text style={styles.mowgliDetailTitle}>{selectedTreatment.name}</Text>
          <Text style={styles.mowgliDetailBody}>{selectedTreatment.description}</Text>
          <Text style={styles.mowgliDetailMeta}>⏱ {selectedTreatment.durationMinutes} Min pro Behandlung</Text>

          <View style={styles.mowgliUnitsRow}>
            <Pressable style={({ pressed }) => [styles.mowgliUnitsButton, pressed && styles.mowgliLiftSoft]} onPress={() => setUnits((prev) => Math.max(1, prev - 1))}>
              <Text style={styles.mowgliUnitsButtonText}>−</Text>
            </Pressable>
            <View style={styles.mowgliUnitsValueWrap}>
              <Text style={styles.mowgliUnitsValue}>{units} Behandlung(en)</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.mowgliUnitsButton, pressed && styles.mowgliLiftSoft]} onPress={() => setUnits((prev) => prev + 1)}>
              <Text style={styles.mowgliUnitsButtonText}>＋</Text>
            </Pressable>
          </View>

          <View style={styles.mowgliDetailPriceCard}>
            <Text style={styles.mowgliDetailPriceMain}>{formatPrice((selectedTreatment.priceCents || 0) * units)}</Text>
            <Text style={styles.mowgliDetailPriceSub}>
              Mitglied: {formatPrice(((selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents) || 0) * units)}
            </Text>
            {!hasActiveMembership && (
              <Text style={styles.mowgliDetailHint}>
                Mit aktiver Mitgliedschaft werden Mitgliedspreise und inkludierte Treatments freigeschaltet.
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.mowgliHeroCta,
              (cartSyncing || checkoutLoading) && styles.ctaDisabled,
              pressed && !(cartSyncing || checkoutLoading) && styles.mowgliLiftSoft,
            ]}
            disabled={cartSyncing || checkoutLoading}
            onPress={() => {
              void addToCart();
            }}
          >
            <Text style={styles.mowgliHeroCtaText}>{cartCtaLabel}</Text>
            <Ionicons name="bag-add-outline" size={15} color="#0A0A0C" />
          </Pressable>
        </View>
      )}

      {shopTab === 'membership' && (
        <View style={styles.mowgliShopSection}>
          <View style={styles.mowgliSectionHead}>
            <Text style={styles.mowgliSectionEyebrow}>Mitgliedschaften</Text>
            <Text style={styles.mowgliSectionTitle}>Monatliche Vorteile mit Substanz</Text>
          </View>

          {memberships.map((plan) => {
            const active = membershipStatus?.status === 'active' && membershipStatus?.membershipId === plan.id;
            const recovering = membershipStatus?.status === 'past_due' && membershipStatus?.membershipId === plan.id;
            const highlightedPerks = (Array.isArray(plan.perks) ? plan.perks : []).slice(0, 4);
            const planIncludedIds = Array.isArray(plan.includedTreatmentIds) ? plan.includedTreatmentIds : [];
            const includedTreatments = treatments.filter((item) => planIncludedIds.includes(item.id)).slice(0, 3);
            return (
              <View key={plan.id} style={[styles.mowgliMembershipPlanCard, active && styles.mowgliMembershipPlanCardActive]}>
                <View style={styles.mowgliMembershipPlanTopRow}>
                  <View style={styles.mowgliMembershipPlanCopy}>
                    <Text style={styles.mowgliSectionEyebrow}>Mitgliedschaft</Text>
                    <Text style={styles.mowgliMembershipPlanTitle}>{plan.name}</Text>
                  </View>
                  <Text style={styles.mowgliMembershipPlanPrice}>{formatPrice(plan.priceCents)} / Monat</Text>
                </View>

                {highlightedPerks.map((perk, index) => (
                  <View key={`${plan.id}-perk-${index}`} style={styles.mowgliMembershipPerkRow}>
                    <Ionicons name="checkmark-outline" size={15} color="#C8A97E" />
                    <Text style={styles.mowgliMembershipPerkText}>{perk}</Text>
                  </View>
                ))}

                {includedTreatments.length > 0 && (
                  <View style={styles.mowgliIncludedList}>
                    <Text style={styles.mowgliIncludedLabel}>Inklusive Treatments</Text>
                    {includedTreatments.map((item) => (
                      <Pressable
                        key={`${plan.id}-${item.id}`}
                        style={({ pressed }) => [styles.mowgliIncludedCard, pressed && styles.mowgliLiftSoft]}
                        onPress={() => openMembershipTreatment(item)}
                      >
                        <Text style={styles.mowgliIncludedCardTitle}>{item.name}</Text>
                        <Text style={styles.mowgliIncludedCardMeta}>1 Behandlung • Mehr erfahren</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    active ? styles.mowgliMembershipCtaActive : styles.mowgliMembershipCta,
                    membershipSyncing && styles.ctaDisabled,
                    pressed && !membershipSyncing && styles.mowgliLiftSoft,
                  ]}
                  disabled={membershipSyncing}
                  onPress={() => {
                    void activateMembership(plan.id);
                  }}
                >
                  <Text style={active ? styles.mowgliMembershipCtaTextActive : styles.mowgliMembershipCtaText}>
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
          <View style={styles.mowgliSectionHead}>
            <Text style={styles.mowgliSectionEyebrow}>Katalog</Text>
            <Text style={styles.mowgliSectionTitle}>Alle Treatments im Überblick</Text>
          </View>
          {treatments.map((item) => (
            <View key={item.id} style={styles.mowgliCatalogRow}>
              <View style={styles.mowgliCatalogCopy}>
                <Text style={styles.mowgliCatalogTitle}>{item.name}</Text>
                <Text style={styles.mowgliCatalogBody}>{item.description}</Text>
              </View>
              <View style={styles.mowgliCatalogMeta}>
                <Text style={styles.mowgliCatalogPrice}>{formatPrice(item.priceCents)}</Text>
                <Text style={styles.mowgliCatalogDuration}>{item.durationMinutes} Min</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {hasCart && (
        <View style={styles.mowgliCartCard}>
          <Text style={styles.mowgliSectionEyebrow}>Checkout</Text>
          <Text style={styles.mowgliCartTitle}>Warenkorb ({cartItems.length})</Text>
          {cartItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.mowgliCartItem}>
              {item.name} • {item.units}x • {formatPrice(item.totalCents)}
            </Text>
          ))}
          <Text style={styles.mowgliCartTotal}>Gesamt: {formatPrice(totalCartCents)}</Text>
          <View style={styles.mowgliCheckoutMethodRow}>
            {checkoutMethodOptions.map((option) => {
              const active = selectedCheckoutMethod === option.id;
              return (
                <Pressable
                  key={`box-${option.id}`}
                  style={({ pressed }) => [
                    styles.mowgliCheckoutMethodChip,
                    active && styles.mowgliCheckoutMethodChipActive,
                    pressed && styles.mowgliLiftSoft,
                  ]}
                  onPress={() => setSelectedCheckoutMethod(option.id)}
                >
                  <Text style={[styles.mowgliCheckoutMethodChipText, active && styles.mowgliCheckoutMethodChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.mowgliHeroCta,
              (checkoutLoading || cartSyncing) && styles.ctaDisabled,
              pressed && !(checkoutLoading || cartSyncing) && styles.mowgliLiftSoft,
            ]}
            disabled={checkoutLoading || cartSyncing}
            onPress={() => {
              void runCheckout();
            }}
          >
            <Text style={styles.mowgliHeroCtaText}>{checkoutCtaLabel}</Text>
            <Ionicons name="arrow-forward" size={15} color="#0A0A0C" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
