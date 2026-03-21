import React from 'react';
import { Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import ShopTabButton from '../components/ShopTabButton';
import TreatmentCard from '../components/TreatmentCard';
import FaceContourIcon from '../components/FaceContourIcon';
import HairFollicleIcon from '../components/HairFollicleIcon';
import InjectableIcon from '../components/InjectableIcon';
import { THEME } from '../theme/tokens';

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
  liquidShineAnim,
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
  return (
    <View>
      <TopHeader
        styles={styles}
        title="Shop"
        sectionLabel="Behandlungen & Pakete"
        subtitle="Buchen und vergleichen"
        clinicShortName={clinicProfile.shortName}
        clinicName={clinicProfile.name}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        cartCount={cartCount}
      />

      <View style={styles.shopTabsRow}>
        <ShopTabButton styles={styles} label="Entdecken" active={shopTab === 'browse'} onPress={() => setShopTab('browse')} />
        <ShopTabButton
          styles={styles}
          label={shopMembershipTabLabel === 'Membership' ? 'Mitgliedschaft' : shopMembershipTabLabel}
          active={shopTab === 'membership'}
          onPress={() => setShopTab('membership')}
        />
        <ShopTabButton
          styles={styles}
          label="Katalog"
          active={shopTab === 'treatments'}
          onPress={() => setShopTab('treatments')}
        />
      </View>

      {shopTab === 'browse' && !selectedTreatment && (
        <View>
          <View style={styles.shopPinkHeroCard}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shopPinkLiquidShine,
                {
                  transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                },
              ]}
            />
            <View pointerEvents="none" style={styles.shopPinkHeroGloss} />
            <View pointerEvents="none" style={styles.shopPinkHeroPearl} />
            <View pointerEvents="none" style={styles.shopPinkHeroGlow} />
            <View style={styles.shopHeroTopRow}>
              <View style={styles.shopHeroBadge}>
                <Text style={styles.shopHeroBadgeText}>{clinicProfile.shortName || 'APP'}</Text>
              </View>
              <View style={styles.shopHeroBadgeSoft}>
                <Text style={styles.shopHeroBadgeSoftText}>Mit Vorteilen</Text>
              </View>
            </View>
            <Text style={styles.shopPinkHeroTitle}>Behandlungen und Pakete auf einen Blick.</Text>
            <Text style={styles.shopPinkHeroBody}>Schnell wählen, später zahlen und Vorteile direkt mitnehmen.</Text>
            <View style={styles.shopHeroFactRow}>
              <View style={styles.shopHeroFactPill}>
                <Text style={styles.shopHeroFactText}>Später zahlen</Text>
              </View>
              <View style={styles.shopHeroFactPill}>
                <Text style={styles.shopHeroFactText}>Punkte sammeln</Text>
              </View>
              <View style={styles.shopHeroFactPill}>
                <Text style={styles.shopHeroFactText}>Mitgliedschaft</Text>
              </View>
            </View>
            <Pressable
              style={styles.shopPinkHeroCta}
              onPress={() => {
                setShopTab('membership');
              }}
            >
              <Text style={styles.shopPinkHeroCtaText}>Mitgliedschaften ansehen</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>KATEGORIEN</Text>
            <Text style={styles.sectionTitle}>Finde das passende Treatment</Text>
            <Text style={styles.sectionLead}>
              Wähle zuerst einen Bereich, dann siehst du die passenden Optionen deiner Klinik.
            </Text>
          </View>
          <View style={styles.categoryGrid}>
            {treatmentCategories.map((cat) => (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.categoryTile,
                  categoryId === cat.id && styles.categoryTileActive,
                  pressed && styles.categoryTilePressed,
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <View pointerEvents="none" style={styles.categoryTileGloss} />
                <View
                  style={[
                    styles.categoryTileIconWrap,
                    categoryId === cat.id && styles.categoryTileIconWrapActive,
                  ]}
                >
                  {String(cat.id || '').toLowerCase() === 'gesicht' ? (
                    <FaceContourIcon active={categoryId === cat.id} />
                  ) : String(cat.id || '').toLowerCase() === 'haare' ? (
                    <HairFollicleIcon active={categoryId === cat.id} />
                  ) : String(cat.id || '').toLowerCase() === 'injectables' ? (
                    <InjectableIcon active={categoryId === cat.id} />
                  ) : (
                    <Ionicons
                      name={categoryIconName(cat.id)}
                      size={23}
                      color={categoryId === cat.id ? THEME.ink : THEME.muted}
                    />
                  )}
                </View>
                <Text style={[styles.categoryTileText, categoryId === cat.id && styles.categoryTileTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionMetaPill}>
            <Text style={styles.sectionMetaPillText}>{selectedCategory?.label || categoryId}</Text>
          </View>
          <Text style={styles.shopListTitle}>Behandlungen für „{selectedCategory?.label || categoryId}“</Text>
          <Text style={styles.shopListSubtitle}>{selectedCategoryMeta.description}</Text>
          <View style={styles.treatmentGrid}>
            {browseItems.map((item, index) => (
              <TreatmentCard
                key={item.id}
                styles={styles}
                treatment={item}
                onPress={openTreatment}
                getImageUrl={preferredTreatmentImage}
                formatPrice={formatPrice}
                featured={index === 0}
              />
            ))}
          </View>
          {browseItems.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Keine Behandlungen in dieser Kategorie</Text>
              <Text style={styles.emptyBody}>Passe später den MedSpa-Katalog im Backend an.</Text>
            </View>
          )}
        </View>
      )}

      {shopTab === 'browse' && selectedTreatment && (
        <View style={styles.detailCard}>
          <View pointerEvents="none" style={styles.cardChrome} />
          <Pressable onPress={() => setSelectedTreatment(null)}>
            <Text style={styles.backLink}>← Zurück</Text>
          </Pressable>

          {preferredTreatmentImage(selectedTreatment) ? (
            <Image source={{ uri: preferredTreatmentImage(selectedTreatment) }} style={styles.detailImage} />
          ) : (
            <View style={styles.detailImageMock} />
          )}

          {Array.isArray(selectedTreatment.galleryUrls) && selectedTreatment.galleryUrls.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.detailGalleryRow}
            >
              {selectedTreatment.galleryUrls.slice(0, 6).map((url) => (
                <Image key={`${selectedTreatment.id}-${url}`} source={{ uri: url }} style={styles.detailThumbImage} />
              ))}
            </ScrollView>
          )}

          <Text style={styles.detailTitle}>{selectedTreatment.name}</Text>
          <Text style={styles.detailBody}>{selectedTreatment.description}</Text>
          <Text style={styles.detailMeta}>⏱ {selectedTreatment.durationMinutes} Min / Behandlung</Text>
          <View style={styles.detailQuoteCard}>
            <Text style={styles.detailQuoteText}>
              “{selectedTreatment.name} war schnell, präzise und deutlich angenehmer als erwartet.”
            </Text>
          </View>

          <Text style={styles.sectionSubTitle}>Behandlungsplan wählen</Text>
          <View style={styles.unitsRow}>
            <Pressable
              style={styles.unitsBtn}
              onPress={() => setUnits((prev) => Math.max(1, prev - 1))}
            >
              <Text style={styles.unitsBtnText}>−</Text>
            </Pressable>
            <View style={styles.unitsValueWrap}>
              <Text style={styles.unitsValue}>{units} Behandlung(en)</Text>
            </View>
            <Pressable style={styles.unitsBtn} onPress={() => setUnits((prev) => prev + 1)}>
              <Text style={styles.unitsBtnText}>＋</Text>
            </Pressable>
          </View>

          <View style={styles.detailPlanSummaryRow}>
            <Text style={styles.detailPlanSummaryMain}>
              {formatPrice((selectedTreatment.priceCents || 0) * units)}
            </Text>
            <Text style={styles.detailPlanSummaryDivider}>|</Text>
            <Text style={styles.detailPlanSummaryMember}>
              {hasActiveMembership
                ? `Mitglied: ${formatPrice(((selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents) || 0) * units)}`
                : `Mitglied: ${formatPrice((selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents) || 0)}`}
            </Text>
          </View>

          <Text style={styles.priceLine}>Standard: {formatPrice(selectedTreatment.priceCents)}</Text>
          <Text style={styles.priceLine}>Mitglied: {formatPrice(selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents)}</Text>
          {!hasActiveMembership && (
            <Text style={styles.priceHint}>
              Aktiviere eine Mitgliedschaft, um Mitgliedspreise und inkludierte Behandlungen freizuschalten.
            </Text>
          )}

          <Pressable
            style={[styles.primaryCta, (cartSyncing || checkoutLoading) && styles.ctaDisabled]}
            disabled={cartSyncing || checkoutLoading}
            onPress={() => {
              void addToCart();
            }}
          >
            <Text style={styles.primaryCtaText}>{cartCtaLabel}</Text>
          </Pressable>
        </View>
      )}

      {shopTab === 'membership' && (
        <View>
          <View style={[styles.sectionHeader, styles.sectionHeaderCompact]}>
            <Text style={styles.sectionEyebrow}>MEMBERSHIPS</Text>
            <Text style={styles.sectionTitle}>Monatliche Vorteile mit Mehrwert</Text>
            <Text style={styles.sectionLead}>
              Pakete für Patientinnen, die regelmäßig wiederkommen und bessere Konditionen wollen.
            </Text>
          </View>
          {memberships.map((plan) => {
            const active =
              membershipStatus?.status === 'active' && membershipStatus?.membershipId === plan.id;
            const recovering =
              membershipStatus?.status === 'past_due' && membershipStatus?.membershipId === plan.id;
            const highlightedPerks = (Array.isArray(plan.perks) ? plan.perks : []).slice(0, 4);
            const planIncludedIds = Array.isArray(plan.includedTreatmentIds) ? plan.includedTreatmentIds : [];
            const includedTreatments = treatments
              .filter((item) => planIncludedIds.includes(item.id))
              .slice(0, 4);
            const resultGallery = includedTreatments
              .flatMap((item) => (Array.isArray(item.galleryUrls) ? item.galleryUrls.slice(0, 2) : []))
              .filter(Boolean)
              .slice(0, 6);
            return (
              <View
                key={plan.id}
                style={[styles.shopMembershipBlock, active && styles.shopMembershipBlockActive]}
              >
                <View pointerEvents="none" style={styles.surfaceRim} />
                <View pointerEvents="none" style={styles.surfacePinkAura} />
                <View style={styles.shopMembershipHero}>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.shopMembershipLiquidShine,
                      {
                        transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                      },
                    ]}
                  />
                  <View pointerEvents="none" style={styles.shopMembershipHeroGloss} />
                  <View pointerEvents="none" style={styles.shopMembershipHeroPearl} />
                  <Text style={styles.shopMembershipHeroEyebrow}>MITGLIEDSCHAFT</Text>
                  <Text style={styles.shopMembershipHeroTitle}>{plan.name}</Text>
                  <Text style={styles.shopMembershipHeroBody}>
                    {highlightedPerks[0] || 'Exklusive Mitgliedervorteile mit monatlichem Mehrwert.'}
                  </Text>
                  <View style={styles.shopMembershipPriceRow}>
                    <Text style={styles.shopMembershipHeroPrice}>{formatPrice(plan.priceCents)} / Monat</Text>
                    {active && <Text style={styles.shopMembershipHeroBadge}>Aktiv</Text>}
                  </View>
                </View>

                <View style={styles.shopMembershipBenefitsGrid}>
                  {highlightedPerks.map((perk, index) => (
                    <View
                      key={`${plan.id}-perk-${index}`}
                      style={[
                        styles.shopMembershipBenefitCard,
                        index % 2 === 1 && styles.shopMembershipBenefitCardAlt,
                      ]}
                    >
                      <Text style={styles.shopMembershipBenefitText}>{perk}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.shopMembershipIncludedTitle}>Inkludierte Behandlungen</Text>
                {includedTreatments.length === 0 && (
                  <Text style={styles.shopMembershipIncludedEmpty}>
                    Dieses Paket enthält aktuell keine fixen Inklusiv-Behandlungen.
                  </Text>
                )}
                {includedTreatments.map((item) => (
                  <Pressable
                    key={`${plan.id}-${item.id}`}
                    style={styles.shopMembershipIncludedCard}
                    onPress={() => openMembershipTreatment(item)}
                  >
                    <View pointerEvents="none" style={styles.surfaceRimSoft} />
                    {preferredTreatmentImage(item) ? (
                      <Image source={{ uri: preferredTreatmentImage(item) }} style={styles.shopMembershipIncludedImage} />
                    ) : (
                      <View style={styles.shopMembershipIncludedImageMock} />
                    )}
                    <View style={styles.shopMembershipIncludedBody}>
                      <Text style={styles.shopMembershipIncludedName}>{item.name}</Text>
                      <Text style={styles.shopMembershipIncludedMeta}>1 Behandlung</Text>
                      <Text style={styles.shopMembershipIncludedLink}>Mehr über diese Behandlung</Text>
                    </View>
                  </Pressable>
                ))}

                {resultGallery.length > 0 && (
                  <View style={styles.shopMembershipResultsWrap}>
                    <Text style={styles.shopMembershipResultsTitle}>Ergebnisse</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.shopMembershipResultsRow}
                    >
                      {resultGallery.map((url, index) => (
                        <Image
                          key={`${plan.id}-result-${index}`}
                          source={{ uri: url }}
                          style={styles.shopMembershipResultImage}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Pressable
                  style={[styles.primaryCta, active && styles.secondaryCtaActive]}
                  disabled={membershipSyncing}
                  onPress={() => {
                    void activateMembership(plan.id);
                  }}
                >
                  <Text style={styles.primaryCtaText}>
                    {active
                      ? 'Aktiv'
                      : recovering
                        ? 'Zahlung fehlgeschlagen – reaktivieren'
                        : membershipSyncing
                          ? 'Wird aktiviert...'
                          : 'Mitgliedschaft starten'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {shopTab === 'treatments' && (
        <View>
          <View style={[styles.sectionHeader, styles.sectionHeaderCompact]}>
            <Text style={styles.sectionEyebrow}>KATALOG</Text>
            <Text style={styles.sectionTitle}>Alle Behandlungen im Überblick</Text>
            <Text style={styles.sectionLead}>
              Eine klare Liste für schnelles Scannen, Vergleichen und späteres Buchen.
            </Text>
          </View>
          {treatments.map((item) => (
            <View key={item.id} style={styles.treatmentListCard}>
              <View pointerEvents="none" style={styles.surfaceRimSoft} />
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <Text style={styles.treatmentListTitle}>{item.name}</Text>
              <Text style={styles.treatmentListBody}>{item.description}</Text>
              <Text style={styles.treatmentListMeta}>
                ab {formatPrice(item.priceCents)} • {item.durationMinutes} Min
              </Text>
            </View>
          ))}
        </View>
      )}

      {hasCart && (
        <View style={styles.cartBox}>
          <View pointerEvents="none" style={styles.surfaceRim} />
          <View pointerEvents="none" style={styles.surfaceGlossStrip} />
          <View pointerEvents="none" style={styles.cartBoxGlow} />
          <Text style={styles.sectionEyebrow}>BEREIT ZUM CHECKOUT</Text>
          <Text style={styles.cartTitle}>Warenkorb ({cartItems.length})</Text>
          {cartItems.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.cartItem}>
              {item.name} • {item.units}x • {formatPrice(item.totalCents)}
            </Text>
          ))}
          <Text style={styles.cartTotal}>Gesamt: {formatPrice(totalCartCents)}</Text>
          <View style={styles.checkoutMethodWrap}>
            <Text style={styles.checkoutMethodLabel}>Zahlart</Text>
            <View style={styles.checkoutMethodRow}>
              {checkoutMethodOptions.map((option) => {
                const active = selectedCheckoutMethod === option.id;
                return (
                  <Pressable
                    key={`box-${option.id}`}
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
          <Pressable
            style={[styles.primaryCta, (checkoutLoading || cartSyncing) && styles.ctaDisabled]}
            disabled={checkoutLoading || cartSyncing}
            onPress={() => {
              void runCheckout();
            }}
          >
            <Text style={styles.primaryCtaText}>{checkoutCtaLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
