import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

function PopularCard({ styles, theme, treatment, imageUrl, formatPrice, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliPopularCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={() => onPress(treatment)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.mowgliPopularCardImage} />
      ) : (
        <View style={[styles.mowgliPopularCardFallback, { backgroundColor: theme.input }]}>
          <Ionicons name="sparkles-outline" size={22} color={theme.accent} />
        </View>
      )}
      <View style={styles.mowgliPopularCardBody}>
        <Text style={[styles.mowgliPopularCardTitle, { color: theme.text }]} numberOfLines={2}>
          {treatment.name}
        </Text>
        <View style={styles.mowgliPopularCardMetaRow}>
          <Text style={[styles.mowgliPopularCardMeta, { color: theme.accent }]}>
            {treatment.durationMinutes || 60} Min
          </Text>
          <Text style={[styles.mowgliPopularCardPrice, { color: theme.text }]}>
            {formatPrice(treatment.priceCents)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function ActionSquare({ styles, theme, icon, title, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliActionSquare,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View style={[styles.mowgliActionSquareIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <Text style={[styles.mowgliActionSquareTitle, { color: theme.text }]}>{title}</Text>
    </Pressable>
  );
}

function KnowledgeRow({ styles, theme, article }) {
  return (
    <View style={styles.mowgliKnowledgeRow}>
      <View style={[styles.mowgliKnowledgeThumb, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name="reader-outline" size={20} color={theme.accent} />
      </View>
      <View style={[styles.mowgliKnowledgeCopy, { borderColor: theme.border }]}>
        <Text style={[styles.mowgliKnowledgeTitle, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.mowgliKnowledgeBody, { color: theme.textMuted }]} numberOfLines={2}>
          {article.body}
        </Text>
      </View>
    </View>
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
  treatments,
  preferredTreatmentImage,
  openTreatmentFromHome,
  openMembershipTab,
  formatPrice,
}) {
  const theme = mowgliTheme || {
    mode: 'dark',
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
    chipBg: 'rgba(200,169,126,0.08)',
    chipText: '#E8D8BE',
    heroGlow: 'rgba(200,169,126,0.10)',
    primaryButtonBg: '#F2ECE3',
    primaryButtonText: '#0A0A0C',
    secondaryButtonBg: '#18181B',
    secondaryButtonText: '#F2ECE3',
    secondaryButtonBorder: 'rgba(200,169,126,0.16)',
  };

  const featuredTreatment = Array.isArray(treatments) ? treatments[0] : null;
  const featuredImage = featuredTreatment ? preferredTreatmentImage(featuredTreatment) : '';
  const popularTreatments = Array.isArray(treatments) ? treatments.slice(0, 4) : [];
  const articles = Array.isArray(homeArticles) ? homeArticles.slice(0, 2) : [];
  const displayName = String(clinicProfile.name || 'Deine Klinik').trim();
  const membershipLabel = String(activeMembershipName || 'Gastzugang').trim() || 'Gastzugang';

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={[styles.mowgliHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <View style={styles.mowgliHeaderCopy}>
          <View style={styles.mowgliHeaderBrandRow}>
            <Ionicons name="sparkles-outline" size={15} color={theme.accent} />
            <Text style={[styles.mowgliHeaderBrandText, { color: theme.accent }]}>Curabo</Text>
          </View>
          <Text style={[styles.mowgliHeaderTitle, { color: theme.text }]}>Willkommen zurück</Text>
          <Text style={[styles.mowgliHeaderSubtitle, { color: theme.textMuted }]}>{displayName}</Text>
        </View>
        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={styles.mowgliShopSection}>
        <View style={styles.mowgliSectionHeadCompact}>
          <Text style={[styles.mowgliSectionEyebrow, { color: theme.accent }]}>Featured</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.mowgliFeaturedHero,
            { backgroundColor: theme.shell, borderColor: theme.border },
            pressed && styles.mowgliLiftSoft,
          ]}
          onPress={() => {
            if (featuredTreatment) openTreatmentFromHome(featuredTreatment);
          }}
        >
          {featuredImage ? (
            <Image source={{ uri: featuredImage }} style={styles.mowgliFeaturedHeroImage} />
          ) : (
            <View style={[styles.mowgliFeaturedHeroFallback, { backgroundColor: theme.surfaceAlt }]}>
              <Ionicons name="sparkles-outline" size={34} color={theme.accent} />
            </View>
          )}
          <View style={[styles.mowgliFeaturedHeroOverlay, { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.46)' : 'rgba(15,10,8,0.24)' }]} />
          <View style={styles.mowgliFeaturedHeroContent}>
            <Text style={[styles.mowgliFeaturedTag, { color: theme.accent }]}>Signature</Text>
            <Text style={[styles.mowgliFeaturedTitle, { color: theme.text }]}>
              {featuredTreatment?.name || 'Signature Treatment'}
            </Text>
            <Text style={[styles.mowgliFeaturedBody, { color: theme.textSoft }]} numberOfLines={2}>
              {featuredTreatment?.description || 'Die führenden Leistungen deiner Klinik bleiben direkt sichtbar und ruhig inszeniert.'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.mowgliSectionHeaderRow}>
          <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Beliebte Treatments</Text>
          <Pressable onPress={onViewOffers}>
            <Text style={[styles.mowgliSectionLink, { color: theme.accent }]}>Alle</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mowgliPopularRow}>
          {popularTreatments.map((item) => (
            <PopularCard
              key={item.id}
              styles={styles}
              theme={theme}
              treatment={item}
              imageUrl={preferredTreatmentImage(item)}
              formatPrice={formatPrice}
              onPress={openTreatmentFromHome}
            />
          ))}
        </ScrollView>

        <View
          style={[
            styles.mowgliMembershipPanel,
            { backgroundColor: theme.shell, borderColor: theme.border },
          ]}
        >
          <View style={styles.mowgliMembershipPanelRow}>
            <View>
              <View style={styles.mowgliHeaderBrandRow}>
                <Ionicons name="diamond-outline" size={15} color={theme.accent} />
                <Text style={[styles.mowgliHeaderBrandText, { color: theme.accent }]}>Active Membership</Text>
              </View>
              <Text style={[styles.mowgliMembershipPanelTitle, { color: theme.text }]}>
                {membershipLabel}
              </Text>
            </View>
            <Ionicons name="diamond-outline" size={26} color={theme.accent} />
          </View>
          <Text style={[styles.mowgliMembershipPanelBody, { color: theme.textMuted }]}>
            Vorteile, priorisierte Buchung und ein ruhigerer Zugang zu wiederkehrenden Behandlungen.
          </Text>
          <Pressable style={styles.mowgliTextLink} onPress={openMembershipTab}>
            <Text style={[styles.mowgliTextLinkText, { color: theme.accent }]}>Mitgliedschaft ansehen</Text>
            <Ionicons name="arrow-forward" size={13} color={theme.accent} />
          </Pressable>
        </View>

        <View style={styles.mowgliActionSquareRow}>
          <ActionSquare styles={styles} theme={theme} icon="calendar-outline" title="Termin buchen" onPress={onViewOffers} />
          <ActionSquare styles={styles} theme={theme} icon="star-outline" title="Mitglied werden" onPress={openMembershipTab} />
          <ActionSquare styles={styles} theme={theme} icon="gift-outline" title="Shop öffnen" onPress={onViewOffers} />
        </View>

        <View style={styles.mowgliSectionHeaderRow}>
          <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Wissen & Tipps</Text>
        </View>
        <View style={styles.mowgliKnowledgeList}>
          {articles.map((article) => (
            <KnowledgeRow key={article.id} styles={styles} theme={theme} article={article} />
          ))}
        </View>

        <View style={[styles.mowgliClinicCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
          <View style={styles.mowgliSectionHeadCompact}>
            <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Standort & Kontakt</Text>
            <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>{displayName}</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.mowgliMapWrap, pressed && styles.mowgliLiftSoft]} onPress={() => { void openClinicInMaps(); }}>
            <View pointerEvents="none" style={[styles.mowgliMapPreview, { backgroundColor: theme.input, borderColor: theme.border }]} />
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
            <Pressable
              style={({ pressed }) => [
                styles.mowgliClinicPrimary,
                { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
                pressed && styles.mowgliLiftSoft,
              ]}
              onPress={() => { void callClinicNow(); }}
            >
              <Text style={[styles.mowgliClinicPrimaryText, { color: theme.primaryButtonText }]}>Klinik anrufen</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.mowgliClinicSecondary,
                { backgroundColor: theme.secondaryButtonBg, borderColor: theme.secondaryButtonBorder },
                pressed && styles.mowgliLiftSoft,
              ]}
              onPress={openProfile}
            >
              <Text style={[styles.mowgliClinicSecondaryText, { color: theme.secondaryButtonText }]}>Profil öffnen</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
