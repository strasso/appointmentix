import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

function HeaderAction({ styles, theme, icon, onPress, badge = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliHeaderAction,
        { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={21} color={theme.text} />
      {badge && <View style={[styles.mowgliHeaderActionDot, { backgroundColor: theme.accent }]} />}
    </Pressable>
  );
}

function QuickActionCard({ styles, theme, icon, title, caption, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliQuickActionCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliQuickActionPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.mowgliQuickActionIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name={icon} size={18} color={theme.accent} />
      </View>
      <Text style={[styles.mowgliQuickActionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.mowgliQuickActionCaption, { color: theme.textMuted }]}>{caption}</Text>
    </Pressable>
  );
}

export default function HomeScreen({
  styles,
  mowgliTheme,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  activeMembershipName,
  onViewOffers,
  homeArticles,
  clinicMapRegion,
  clinicCoordinates,
  openClinicInMaps,
  callClinicNow,
  openProfile,
}) {
  const theme = mowgliTheme || {
    accent: '#C8A97E',
    page: '#0B0B0D',
    header: '#0E0E10',
    shell: '#121214',
    shellAlt: '#151518',
    surface: '#151518',
    surfaceAlt: '#18181B',
    input: '#101013',
    border: 'rgba(200,169,126,0.14)',
    borderStrong: 'rgba(200,169,126,0.24)',
    text: '#F2ECE3',
    textSoft: '#A59A8E',
    textMuted: '#8F8579',
    textInverse: '#0A0A0C',
    chipBg: 'rgba(200,169,126,0.08)',
    chipText: '#E8D8BE',
    heroGlow: 'rgba(200,169,126,0.10)',
    primaryButtonBg: '#F2ECE3',
    primaryButtonText: '#0A0A0C',
    secondaryButtonBg: '#18181B',
    secondaryButtonText: '#F2ECE3',
    secondaryButtonBorder: 'rgba(200,169,126,0.16)',
  };
  const featuredArticle = homeArticles[0];
  const articleList = homeArticles.slice(0, 3);
  const membershipLabel = String(activeMembershipName || 'Gast').trim() || 'Gast';

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={[styles.mowgliHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <View style={styles.mowgliHeaderCopy}>
          <View style={styles.mowgliHeaderBrandRow}>
            <Ionicons name="sparkles-outline" size={15} color={theme.accent} />
            <Text style={[styles.mowgliHeaderBrandText, { color: theme.accent }]}>Curabo</Text>
          </View>
          <Text style={[styles.mowgliHeaderTitle, { color: theme.text }]}>Willkommen zurück</Text>
          <Text style={[styles.mowgliHeaderSubtitle, { color: theme.textMuted }]}>{clinicProfile.name || 'Deine Klinik auf einen Blick'}</Text>
        </View>

        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} badge={false} />
          <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={[styles.mowgliHeroCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View pointerEvents="none" style={[styles.mowgliHeroGlow, { backgroundColor: theme.heroGlow }]} />
        <View pointerEvents="none" style={[styles.mowgliHeroShimmer, { backgroundColor: theme.borderStrong }]} />
        <View style={styles.mowgliHeroTopRow}>
          <View style={[styles.mowgliHeroChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.mowgliHeroChipText, { color: theme.accent }]}>CURABO EDIT</Text>
          </View>
          <View style={[styles.mowgliHeroStatus, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Ionicons name="diamond-outline" size={13} color={theme.accent} />
            <Text style={[styles.mowgliHeroStatusText, { color: theme.chipText }]}>{membershipLabel}</Text>
          </View>
        </View>
        <Text style={[styles.mowgliHeroEyebrow, { color: theme.textMuted }]}>Persönlicher Überblick</Text>
        <Text style={[styles.mowgliHeroTitle, { color: theme.text }]}>Deine Klinik, Vorteile und Treatments in einer ruhigen Oberfläche.</Text>
        <Text style={[styles.mowgliHeroBody, { color: theme.textSoft }]}>
          Curabo bündelt Mitgliedschaft, Wissen, Standort und nächste Schritte an einem Ort, ohne dass sich die App wie ein unruhiger Katalog anfühlt.
        </Text>
        <Pressable style={({ pressed }) => [styles.mowgliHeroCta, { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong }, pressed && styles.mowgliLiftSoft]} onPress={onViewOffers}>
          <Text style={[styles.mowgliHeroCtaText, { color: theme.primaryButtonText }]}>Vorteile ansehen</Text>
          <Ionicons name="arrow-forward" size={15} color={theme.primaryButtonText} />
        </Pressable>
      </View>

      <View style={styles.mowgliQuickActionsGrid}>
        <QuickActionCard
          styles={styles}
          theme={theme}
          icon="pricetags-outline"
          title="Vorteile"
          caption="Wallet, Punkte und aktuelle Extras"
          onPress={onViewOffers}
        />
        <QuickActionCard
          styles={styles}
          theme={theme}
          icon="call-outline"
          title="Kontakt"
          caption="Klinik direkt anrufen"
          onPress={() => { void callClinicNow(); }}
        />
        <QuickActionCard
          styles={styles}
          theme={theme}
          icon="location-outline"
          title="Anfahrt"
          caption="Standort in Maps öffnen"
          onPress={() => { void openClinicInMaps(); }}
        />
      </View>

      <View style={[styles.mowgliMembershipCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View pointerEvents="none" style={[styles.mowgliMembershipGlow, { backgroundColor: theme.heroGlow }]} />
        <View style={styles.mowgliMembershipTopRow}>
          <View>
            <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Aktive Mitgliedschaft</Text>
            <Text style={[styles.mowgliMembershipTitle, { color: theme.text }]}>{membershipLabel}</Text>
          </View>
          <View style={[styles.mowgliMembershipIcon, { backgroundColor: theme.shellAlt, borderColor: theme.border }]}>
            <Ionicons name="diamond-outline" size={18} color={theme.accent} />
          </View>
        </View>
        <Text style={[styles.mowgliMembershipBody, { color: theme.textSoft }]}>
          Vorteile, bessere Preise und eine klarere Wiederkehr-Experience bleiben zentral gebündelt statt über einzelne Flows verteilt.
        </Text>
        <Pressable style={({ pressed }) => [styles.mowgliTextLink, pressed && styles.mowgliLiftSoft]} onPress={openProfile}>
          <Text style={[styles.mowgliTextLinkText, { color: theme.accent }]}>Profil und Mitgliedschaft öffnen</Text>
          <Ionicons name="arrow-forward" size={13} color={theme.accent} />
        </Pressable>
      </View>

      <View style={styles.mowgliSectionBlock}>
        <View style={styles.mowgliSectionHead}>
          <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Wissen & Tipps</Text>
          <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Kuratiert von deiner Klinik</Text>
        </View>

        {!!featuredArticle && (
          <View style={[styles.mowgliArticleFeatured, { backgroundColor: theme.shell, borderColor: theme.border }]}>
            <View pointerEvents="none" style={[styles.mowgliArticleFeaturedGlow, { backgroundColor: theme.heroGlow }]} />
            <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>{featuredArticle.tag}</Text>
            <Text style={[styles.mowgliArticleFeaturedTitle, { color: theme.text }]}>{featuredArticle.title}</Text>
            <Text style={[styles.mowgliArticleFeaturedBody, { color: theme.textSoft }]}>{featuredArticle.body}</Text>
          </View>
        )}

        <View style={styles.mowgliArticleList}>
          {articleList.slice(featuredArticle ? 1 : 0).map((article) => (
            <View key={article.id} style={[styles.mowgliArticleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.mowgliArticleThumb, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <Ionicons name="reader-outline" size={18} color={theme.accent} />
              </View>
              <View style={styles.mowgliArticleCopy}>
                <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>{article.tag}</Text>
                <Text style={[styles.mowgliArticleTitle, { color: theme.text }]}>{article.title}</Text>
                <Text style={[styles.mowgliArticleBody, { color: theme.textMuted }]} numberOfLines={2}>{article.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.mowgliClinicCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View style={styles.mowgliSectionHeadCompact}>
          <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Standort & Kontakt</Text>
          <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>{clinicProfile.name}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.mowgliMapWrap, pressed && styles.mowgliLiftSoft]} onPress={() => { void openClinicInMaps(); }}>
          <MapView style={styles.mapView} initialRegion={clinicMapRegion}>
            <Marker
              coordinate={clinicCoordinates}
              title={clinicProfile.name || 'MedSpa'}
              description={clinicProfile.address || clinicProfile.city || 'Standort'}
            />
          </MapView>
          <View style={[styles.mowgliMapHint, { backgroundColor: theme.shellAlt, borderColor: theme.border }]}>
            <Ionicons name="map-outline" size={13} color={theme.text} />
            <Text style={[styles.mowgliMapHintText, { color: theme.text }]}>In Maps öffnen</Text>
          </View>
        </Pressable>

        <View style={styles.mowgliClinicMetaList}>
          <View style={styles.mowgliClinicMetaRow}>
            <Ionicons name="location-outline" size={14} color={theme.accent} />
            <Text style={[styles.mowgliClinicMetaText, { color: theme.textSoft }]}>
              {clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}
            </Text>
          </View>
          <View style={styles.mowgliClinicMetaRow}>
            <Ionicons name="time-outline" size={14} color={theme.accent} />
            <Text style={[styles.mowgliClinicMetaText, { color: theme.textSoft }]}>
              {clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}
            </Text>
          </View>
        </View>

        <View style={styles.mowgliClinicActionRow}>
          <Pressable style={({ pressed }) => [styles.mowgliClinicPrimary, { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong }, pressed && styles.mowgliLiftSoft]} onPress={() => { void callClinicNow(); }}>
            <Text style={[styles.mowgliClinicPrimaryText, { color: theme.primaryButtonText }]}>Klinik anrufen</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.mowgliClinicSecondary, { backgroundColor: theme.secondaryButtonBg, borderColor: theme.secondaryButtonBorder }, pressed && styles.mowgliLiftSoft]} onPress={openProfile}>
            <Text style={[styles.mowgliClinicSecondaryText, { color: theme.secondaryButtonText }]}>Profil öffnen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
