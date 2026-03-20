import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import TopHeader from '../components/TopHeader';
import { THEME } from '../theme/tokens';

export default function HomeScreen({
  styles,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  liquidShineAnim,
  floatingAuraAnim,
  activeMembershipName,
  onViewOffers,
  homeArticles,
  clinicMapRegion,
  clinicCoordinates,
  openClinicInMaps,
  callClinicNow,
  openProfile,
}) {
  const featuredArticle = homeArticles[0];
  const secondaryArticles = homeArticles.slice(1, 3);

  return (
    <View>
      <TopHeader
        styles={styles}
        title="Start"
        sectionLabel="Täglicher Überblick"
        subtitle="Heute für dich kuratiert"
        clinicShortName={clinicProfile.shortName}
        clinicName={clinicProfile.name}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        cartCount={cartCount}
      />

      <View style={styles.heroCard}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroLiquidShine,
            {
              transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroAeroCluster,
            {
              transform: [
                {
                  translateY: floatingAuraAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -14],
                  }),
                },
                {
                  translateX: floatingAuraAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 8],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroAeroHalo} />
          <View style={styles.heroAeroCore} />
          <View style={styles.heroAeroRing} />
          <View style={styles.heroAeroDot} />
        </Animated.View>
        <View pointerEvents="none" style={styles.heroGlossArc} />
        <View pointerEvents="none" style={styles.heroGlassPill} />
        <View pointerEvents="none" style={styles.heroPearl} />
        <View pointerEvents="none" style={styles.heroGlowPrimary} />
        <View pointerEvents="none" style={styles.heroGlowSecondary} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroLabelChip}>
            <Text style={styles.heroLabelChipText}>PERSÖNLICHER MODUS</Text>
          </View>
          <View style={styles.heroSoftPill}>
            <Text style={styles.heroSoftPillText}>{activeMembershipName}</Text>
          </View>
        </View>
        <Text style={styles.heroEyebrow}>INSPIRIERT VON DEINER KLINIK</Text>
        <Text style={styles.heroTitle}>Alles, was deine Klinik für dich freigeschaltet hat.</Text>
        <Text style={styles.heroBody}>
          Behandlungen, Punkte, Mitgliedschaft und Kontakt liegen in einer klaren Oberfläche an einem Ort.
        </Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>{activeMembershipName}</Text>
            <Text style={styles.heroStatLabel}>Aktiver Zugang</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>Vorteile</Text>
            <Text style={styles.heroStatLabel}>Punkte & Vorteile</Text>
          </View>
        </View>
        <Pressable style={styles.heroCta} onPress={onViewOffers}>
          <Text style={styles.heroCtaText}>Vorteile ansehen</Text>
        </Pressable>
      </View>

      <View style={styles.financeBanner}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.surfaceBlueAura} />
        <View pointerEvents="none" style={styles.financeGlow} />
        <Text style={styles.sectionEyebrow}>FLEXIBLE CARE</Text>
        <Text style={styles.financeTitle}>Heute behandeln. Später zahlen. Punkte sammeln.</Text>
        <Text style={styles.financeBody}>Flexible Monatsraten und Vorteile für wiederkehrende Besuche.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>WISSEN</Text>
        <Text style={styles.sectionTitle}>Tipps für deine Routine</Text>
        <Text style={styles.sectionLead}>
          Kurze Hinweise deiner Klinik, damit Ergebnisse zwischen Terminen besser halten.
        </Text>
      </View>
      {!!featuredArticle && (
        <View style={[styles.articleCard, styles.articleCardFeatured, styles.articleCardEditorial]}>
          <View pointerEvents="none" style={styles.surfaceRim} />
          <View pointerEvents="none" style={styles.surfaceGlossStrip} />
          <View pointerEvents="none" style={styles.articleEditorialGlow} />
          <Text style={styles.articleTag}>{featuredArticle.tag}</Text>
          <Text style={[styles.articleTitle, styles.articleTitleFeatured]}>{featuredArticle.title}</Text>
          <Text style={[styles.articleBody, styles.articleBodyFeatured]}>{featuredArticle.body}</Text>
        </View>
      )}
      <View style={styles.articleCompactGrid}>
        {secondaryArticles.map((article) => (
          <View key={article.id} style={[styles.articleCard, styles.articleCardCompact]}>
            <View pointerEvents="none" style={styles.surfaceRimSoft} />
            <View pointerEvents="none" style={styles.surfaceGlossStrip} />
            <Text style={styles.articleTag}>{article.tag}</Text>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleBody}>{article.body}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.sectionHeader, styles.sectionHeaderCompact]}>
        <Text style={styles.sectionEyebrow}>MEDSPA</Text>
        <Text style={styles.sectionTitle}>Dein Standort und Kontakt</Text>
        <Text style={styles.sectionLead}>
          Alles Wichtige für Anfahrt, Öffnungszeiten und den direkten Draht zur Klinik.
        </Text>
      </View>
      <View style={styles.clinicCard}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.surfaceBlueAura} />
        <View pointerEvents="none" style={styles.cardChrome} />
        <View style={styles.clinicHeadingRow}>
          <View>
            <Text style={styles.clinicName}>{clinicProfile.name}</Text>
            <Text style={styles.clinicCaption}>Direktkontakt, Adresse und Profil auf einen Blick.</Text>
          </View>
          <View style={styles.clinicStatusPill}>
            <Text style={styles.clinicStatusPillText}>Verbunden</Text>
          </View>
        </View>
        <Pressable style={styles.mapWrap} onPress={() => { void openClinicInMaps(); }}>
          <MapView style={styles.mapView} initialRegion={clinicMapRegion}>
            <Marker
              coordinate={clinicCoordinates}
              title={clinicProfile.name || 'MedSpa'}
              description={clinicProfile.address || clinicProfile.city || 'Standort'}
            />
          </MapView>
          <View style={styles.mapOpenHint}>
            <Ionicons name="map-outline" size={13} color="#FFFFFF" />
            <Text style={styles.mapOpenHintText}>In Maps öffnen</Text>
          </View>
        </Pressable>
        <View style={styles.clinicMetaRow}>
          <Ionicons name="location-outline" size={14} color={THEME.mutedSoft} />
          <Text style={styles.clinicMeta}>{clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}</Text>
        </View>
        <View style={styles.clinicMetaRow}>
          <Ionicons name="time-outline" size={14} color={THEME.mutedSoft} />
          <Text style={styles.clinicMeta}>{clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}</Text>
        </View>
        <View style={styles.clinicActionRow}>
          <Pressable style={[styles.callNowCta, styles.clinicPrimaryAction]} onPress={() => { void callClinicNow(); }}>
            <Text style={styles.callNowCtaText}>Klinik anrufen</Text>
          </Pressable>
          <Pressable style={[styles.secondaryCta, styles.clinicSecondaryAction]} onPress={openProfile}>
            <Text style={styles.secondaryCtaText}>Profil öffnen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
