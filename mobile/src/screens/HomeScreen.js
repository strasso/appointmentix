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

function OverviewCard({ styles, theme, eyebrow, title, body, icon, onPress, primary = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliOverviewCard,
        {
          backgroundColor: primary ? theme.shellAlt : theme.surface,
          borderColor: primary ? theme.borderStrong : theme.border,
        },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View style={styles.mowgliOverviewCardRow}>
        <View style={styles.mowgliOverviewCardCopy}>
          <Text style={[styles.mowgliSectionEyebrow, { color: primary ? theme.accent : theme.textMuted }]}>
            {eyebrow}
          </Text>
          <Text style={[styles.mowgliOverviewCardTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.mowgliOverviewCardBody, { color: theme.textSoft }]} numberOfLines={2}>
            {body}
          </Text>
        </View>
        <View
          style={[
            styles.mowgliOverviewCardIcon,
            { backgroundColor: theme.input, borderColor: primary ? theme.borderStrong : theme.border },
          ]}
        >
          <Ionicons name={icon} size={18} color={theme.accent} />
        </View>
      </View>
    </Pressable>
  );
}

function FeaturedArticleCard({ styles, theme, article, imageUrl, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliArticleFeatured,
        { backgroundColor: theme.shell, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={() => onPress(article)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.mowgliArticleFeaturedImage} />
      ) : (
        <View style={[styles.mowgliArticleFeaturedFallback, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="reader-outline" size={26} color={theme.accent} />
        </View>
      )}
      <View
        style={[
          styles.mowgliArticleFeaturedOverlay,
          { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.58)' : 'rgba(20,14,10,0.18)' },
        ]}
      />
      <View style={styles.mowgliArticleFeaturedContent}>
        <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>{article.tag || 'Wissen'}</Text>
        <Text style={[styles.mowgliArticleFeaturedTitle, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.mowgliArticleFeaturedBody, { color: theme.textSoft }]} numberOfLines={2}>
          {article.summary || article.body}
        </Text>
      </View>
    </Pressable>
  );
}

function ArticleRow({ styles, theme, article, imageUrl, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliArticleRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={() => onPress(article)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.mowgliArticleRowImage} />
      ) : (
        <View style={[styles.mowgliArticleThumb, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <Ionicons name="reader-outline" size={18} color={theme.accent} />
        </View>
      )}
      <View style={styles.mowgliArticleCopy}>
        <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>
          {article.tag || 'Wissen'}
        </Text>
        <Text style={[styles.mowgliArticleTitle, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.mowgliArticleBody, { color: theme.textMuted }]} numberOfLines={2}>
          {article.summary || article.body}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </Pressable>
  );
}

function resolveClinicHeroImage(clinicProfile, fallbackImage) {
  const candidates = [
    clinicProfile?.heroImageUrl,
    clinicProfile?.coverImageUrl,
    clinicProfile?.receptionImageUrl,
    clinicProfile?.receptionPhotoUrl,
    clinicProfile?.interiorImageUrl,
    clinicProfile?.imageUrl,
    clinicProfile?.coverUrl,
    clinicProfile?.photoUrl,
    fallbackImage,
  ];
  return candidates.map((item) => String(item || '').trim()).find(Boolean) || '';
}

function resolveArticleImage(article, fallbackImage) {
  const candidates = [
    article?.imageUrl,
    article?.heroImageUrl,
    article?.coverImageUrl,
    article?.thumbnailUrl,
    fallbackImage,
  ];
  return candidates.map((item) => String(item || '').trim()).find(Boolean) || '';
}

function splitArticleBody(article) {
  const longText = String(article?.content || article?.body || '').trim();
  if (!longText) return [];
  const paragraphs = longText
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  return longText
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
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
  clinicCoordinates,
  openClinicInMaps,
  callClinicNow,
  openProfile,
  treatments,
  preferredTreatmentImage,
  openTreatmentFromHome,
  openMembershipTab,
  formatPrice,
  selectedArticle,
  openArticle,
  closeArticle,
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
  const fallbackImage = featuredTreatment ? preferredTreatmentImage(featuredTreatment) : '';
  const clinicHeroImage = resolveClinicHeroImage(clinicProfile, fallbackImage);
  const popularTreatments = Array.isArray(treatments) ? treatments.slice(0, 4) : [];
  const articles = Array.isArray(homeArticles) ? homeArticles.slice(0, 3) : [];
  const featuredArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1);
  const displayName = String(clinicProfile.name || 'Deine Klinik').trim();
  const membershipLabel = String(activeMembershipName || 'Gastzugang').trim() || 'Gastzugang';
  const articleBody = selectedArticle ? splitArticleBody(selectedArticle) : [];
  const articleHeroImage = selectedArticle ? resolveArticleImage(selectedArticle, clinicHeroImage) : '';
  const clinicAddress = [clinicProfile.address, clinicProfile.city].filter(Boolean).join(', ');

  if (selectedArticle) {
    return (
      <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
        <View style={styles.mowgliArticleDetailStage}>
          <View style={styles.mowgliArticleDetailHero}>
            {articleHeroImage ? (
              <Image source={{ uri: articleHeroImage }} style={styles.mowgliArticleDetailHeroImage} />
            ) : (
              <View style={[styles.mowgliArticleDetailHeroFallback, { backgroundColor: theme.surfaceAlt }]}>
                <Ionicons name="reader-outline" size={30} color={theme.accent} />
              </View>
            )}
            <View
              style={[
                styles.mowgliArticleDetailHeroOverlay,
                { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.54)' : 'rgba(18,14,10,0.18)' },
              ]}
            />
            <View style={styles.mowgliArticleDetailNavRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.mowgliDetailHeroNavButton,
                  { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                  pressed && styles.mowgliLiftSoft,
                ]}
                onPress={closeArticle}
              >
                <Ionicons name="arrow-back" size={18} color={theme.text} />
              </Pressable>
              <View style={styles.mowgliHeaderActions}>
                <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} />
                <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
              </View>
            </View>
          </View>

          <View style={styles.mowgliArticleDetailContent}>
            <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>
              {selectedArticle.tag || 'Wissen & Tipps'}
            </Text>
            <Text style={[styles.mowgliArticleDetailTitle, { color: theme.text }]}>
              {selectedArticle.title}
            </Text>
            <Text style={[styles.mowgliArticleDetailMeta, { color: theme.textMuted }]}>
              {displayName} • Klinikbeitrag
            </Text>
            <View style={styles.mowgliArticleDetailBodyWrap}>
              {articleBody.map((paragraph, index) => (
                <Text key={`${selectedArticle.id || 'article'}-${index}`} style={[styles.mowgliArticleDetailBody, { color: theme.textSoft }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
            <View style={[styles.mowgliArticleDetailNote, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="sparkles-outline" size={16} color={theme.accent} />
              <Text style={[styles.mowgliArticleDetailNoteText, { color: theme.textSoft }]}>
                Dieser Beitrag stammt aus dem Klinikbereich und bleibt direkt in deiner App verfügbar.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliHeaderMinimal}>
        <View style={styles.mowgliHeaderMinimalCopy}>
          <Text style={[styles.mowgliHeaderClinicName, { color: theme.text }]} numberOfLines={2}>
            {displayName}
          </Text>
        </View>
        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={styles.mowgliWelcomeBlock}>
        <Text style={[styles.mowgliSectionEyebrow, { color: theme.accent }]}>Patient App</Text>
        <Text style={[styles.mowgliWelcomeTitle, { color: theme.text }]}>Willkommen zurück</Text>
        <Text style={[styles.mowgliWelcomeBody, { color: theme.textSoft }]}>
          Treatments, Vorteile und aktuelle Klinikbeiträge bleiben an einem Ort ruhig organisiert.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.mowgliClinicHeroCard,
          { backgroundColor: theme.shell, borderColor: theme.border },
          pressed && styles.mowgliLiftSoft,
        ]}
        onPress={() => {
          if (clinicCoordinates) {
            void openClinicInMaps();
          }
        }}
      >
        {clinicHeroImage ? (
          <Image source={{ uri: clinicHeroImage }} style={styles.mowgliClinicHeroImage} />
        ) : (
          <View style={[styles.mowgliClinicHeroFallback, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="business-outline" size={28} color={theme.accent} />
          </View>
        )}
        <View
          style={[
            styles.mowgliClinicHeroOverlay,
            { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.42)' : 'rgba(18,14,10,0.12)' },
          ]}
        />
        <View style={styles.mowgliClinicHeroContent}>
          <Text style={[styles.mowgliArticleTag, { color: theme.accent }]}>Klinik & Empfang</Text>
          <Text style={[styles.mowgliClinicHeroTitle, { color: theme.text }]}>{displayName}</Text>
          <Text style={[styles.mowgliClinicHeroBody, { color: theme.textSoft }]} numberOfLines={2}>
            {clinicAddress || 'Ruhige Umgebung, persönlicher Empfang und alle Informationen direkt in deiner App.'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.mowgliOverviewRail}>
        <OverviewCard
          styles={styles}
          theme={theme}
          eyebrow="Mitgliedschaft"
          title={membershipLabel}
          body="Vorteile, Preise und wiederkehrende Leistungen im Überblick."
          icon="diamond-outline"
          onPress={openMembershipTab}
          primary
        />
        <OverviewCard
          styles={styles}
          theme={theme}
          eyebrow="Shop"
          title="Treatments entdecken"
          body={`${popularTreatments.length || 0} sichtbare Leistungen in deiner Klinik.`}
          icon="sparkles-outline"
          onPress={onViewOffers}
        />
      </View>

      {popularTreatments.length > 0 && (
        <>
          <View style={styles.mowgliSectionHeaderRow}>
            <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Beliebte Treatments</Text>
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
        </>
      )}

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Wissen & Tipps</Text>
      </View>

      {!!featuredArticle && (
        <FeaturedArticleCard
          styles={styles}
          theme={theme}
          article={featuredArticle}
          imageUrl={resolveArticleImage(featuredArticle, clinicHeroImage)}
          onPress={openArticle}
        />
      )}

      <View style={styles.mowgliArticleList}>
        {secondaryArticles.map((article) => (
          <ArticleRow
            key={article.id}
            styles={styles}
            theme={theme}
            article={article}
            imageUrl={resolveArticleImage(article, clinicHeroImage)}
            onPress={openArticle}
          />
        ))}
      </View>

      <View style={[styles.mowgliClinicCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View style={styles.mowgliSectionHeadCompact}>
          <Text style={[styles.mowgliSectionEyebrow, { color: theme.textMuted }]}>Standort & Kontakt</Text>
          <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>{displayName}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.mowgliMapWrap, pressed && styles.mowgliLiftSoft]}
          onPress={() => {
            void openClinicInMaps();
          }}
        >
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
            onPress={() => {
              void callClinicNow();
            }}
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
  );
}
