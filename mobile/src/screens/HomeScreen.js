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
  return (
    <View>
      <TopHeader
        styles={styles}
        title="Start"
        clinicShortName={clinicProfile.shortName}
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
        <Text style={styles.heroEyebrow}>PERSONALISIERT FÜR DICH</Text>
        <Text style={styles.heroTitle}>Mehr Ergebnisse mit deinem {activeMembershipName}</Text>
        <Text style={styles.heroBody}>
          Erhalte exklusive Pakete, Punkte pro Besuch und priorisierte Terminbuchung direkt in der App.
        </Text>
        <Pressable style={styles.heroCta} onPress={onViewOffers}>
          <Text style={styles.heroCtaText}>Angebote ansehen</Text>
        </Pressable>
      </View>

      <View style={styles.financeBanner}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.surfaceBlueAura} />
        <View pointerEvents="none" style={styles.financeGlow} />
        <Text style={styles.sectionEyebrow}>FLEXIBLE CARE</Text>
        <Text style={styles.financeTitle}>Heute behandeln. Später zahlen. Punkte sammeln.</Text>
        <Text style={styles.financeBody}>Flexible Monatsraten und Rewards für wiederkehrende Besuche.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>WISSEN</Text>
        <Text style={styles.sectionTitle}>Tipps fuer deine Routine</Text>
        <Text style={styles.sectionLead}>
          Kurze Hinweise deiner Klinik, damit Ergebnisse zwischen Terminen besser halten.
        </Text>
      </View>
      {homeArticles.map((article, index) => (
        <View key={article.id} style={[styles.articleCard, index === 0 && styles.articleCardFeatured]}>
          <View pointerEvents="none" style={styles.surfaceRim} />
          <View pointerEvents="none" style={styles.surfaceGlossStrip} />
          <Text style={styles.articleTag}>{article.tag}</Text>
          <Text style={[styles.articleTitle, index === 0 && styles.articleTitleFeatured]}>{article.title}</Text>
          <Text style={[styles.articleBody, index === 0 && styles.articleBodyFeatured]}>{article.body}</Text>
        </View>
      ))}

      <View style={[styles.sectionHeader, styles.sectionHeaderCompact]}>
        <Text style={styles.sectionEyebrow}>MEDSPA</Text>
        <Text style={styles.sectionTitle}>Dein Standort und Kontakt</Text>
        <Text style={styles.sectionLead}>
          Alles Wichtige fuer Anfahrt, Oeffnungszeiten und den direkten Draht zur Klinik.
        </Text>
      </View>
      <View style={styles.clinicCard}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.surfaceBlueAura} />
        <View pointerEvents="none" style={styles.cardChrome} />
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
        <Text style={styles.clinicName}>{clinicProfile.name}</Text>
        <View style={styles.clinicMetaRow}>
          <Ionicons name="location-outline" size={14} color={THEME.mutedSoft} />
          <Text style={styles.clinicMeta}>{clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}</Text>
        </View>
        <View style={styles.clinicMetaRow}>
          <Ionicons name="time-outline" size={14} color={THEME.mutedSoft} />
          <Text style={styles.clinicMeta}>{clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}</Text>
        </View>
        <Pressable style={styles.callNowCta} onPress={() => { void callClinicNow(); }}>
          <Text style={styles.callNowCtaText}>Call now</Text>
        </Pressable>
        <Pressable style={styles.secondaryCta} onPress={openProfile}>
          <Text style={styles.secondaryCtaText}>Profil & Mitgliedschaft öffnen</Text>
        </Pressable>
      </View>
    </View>
  );
}
