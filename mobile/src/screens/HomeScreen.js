import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

const HERO_IMAGE_FALLBACK = require('../../_mowgli_export/screens/images/hero-spa-treatment.jpg');
const POPULAR_IMAGE_FALLBACKS = [
  require('../../_mowgli_export/screens/images/treatment-facial.jpg'),
  require('../../_mowgli_export/screens/images/treatment-massage.jpg'),
  require('../../_mowgli_export/screens/images/treatment-laser.jpg'),
  require('../../_mowgli_export/screens/images/treatment-laser-facial.jpg'),
];
const ARTICLE_IMAGE_FALLBACKS = [
  require('../../_mowgli_export/screens/images/article-skincare.jpg'),
  require('../../_mowgli_export/screens/images/article-hydration.jpg'),
  require('../../_mowgli_export/screens/images/article-relaxation.jpg'),
];

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

function PopularCard({ styles, theme, treatment, imageUrl, fallbackSource, formatPrice, onPress }) {
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
      ) : fallbackSource ? (
        <Image source={fallbackSource} style={styles.mowgliPopularCardImage} />
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

function MembershipCard({ styles, theme, membershipLabel, currentMembership, onPress }) {
  const perks = Array.isArray(currentMembership?.perks) ? currentMembership.perks.slice(0, 2) : [];
  return (
    <View style={[styles.mowgliMembershipCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
      <View style={styles.mowgliMembershipTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mowgliFeaturedTag, { color: theme.accent }]}>Active Membership</Text>
          <Text style={[styles.mowgliMembershipTitle, { color: theme.text }]}>
            {membershipLabel}
          </Text>
        </View>
        <View style={[styles.mowgliMembershipIcon, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="diamond-outline" size={18} color={theme.accent} />
        </View>
      </View>
      <Text style={[styles.mowgliMembershipBody, { color: theme.textSoft }]}>
        {perks.length > 0
          ? perks.join('\n')
          : 'Vorteile und freigeschaltete Konditionen direkt in deiner Klinik-App.'}
      </Text>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.mowgliTextLink, pressed && styles.mowgliLiftSoft]}>
        <Text style={[styles.mowgliTextLinkText, { color: theme.accent }]}>Mehr erfahren</Text>
        <Ionicons name="arrow-forward" size={13} color={theme.accent} />
      </Pressable>
    </View>
  );
}

function QuickAction({ styles, theme, title, caption, icon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliActionSquare,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View style={[styles.mowgliActionSquareIcon, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View>
        <Text style={[styles.mowgliActionSquareTitle, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.mowgliQuickActionCaption, { color: theme.textMuted }]} numberOfLines={2}>
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}

function FeaturedArticleCard({ styles, theme, article, imageUrl, fallbackSource, onPress }) {
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
      ) : fallbackSource ? (
        <Image source={fallbackSource} style={styles.mowgliArticleFeaturedImage} />
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

function KnowledgeRow({ styles, theme, article, imageUrl, fallbackSource, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.mowgliKnowledgeRow, pressed && styles.mowgliLiftSoft]}
      onPress={() => onPress(article)}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.mowgliKnowledgeThumb} />
      ) : fallbackSource ? (
        <Image source={fallbackSource} style={styles.mowgliKnowledgeThumb} />
      ) : (
        <View style={[styles.mowgliKnowledgeThumb, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="reader-outline" size={22} color={theme.accent} />
        </View>
      )}
      <View style={[styles.mowgliKnowledgeCopy, { borderLeftColor: theme.accentBorderStrong }]}>
        <Text style={[styles.mowgliKnowledgeTitle, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.mowgliKnowledgeBody, { color: theme.textMuted }]} numberOfLines={3}>
          {article.summary || article.body}
        </Text>
      </View>
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
  const safeTitle = String(article?.title || '').trim().toLowerCase();
  if (article?.hideImage === true || safeTitle === 'warum juckt meine kopfhaut?') {
    return '';
  }
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
  settingsName,
  cartCount,
  onSearchPress,
  onCartPress,
  activeMembershipName,
  currentMembership,
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
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });

  const featuredTreatment = Array.isArray(treatments) ? treatments[0] : null;
  const fallbackImage = featuredTreatment ? preferredTreatmentImage(featuredTreatment) : '';
  const clinicHeroImage = resolveClinicHeroImage(clinicProfile, fallbackImage);
  const popularTreatments = Array.isArray(treatments) ? treatments.slice(0, 4) : [];
  const articles = Array.isArray(homeArticles) ? homeArticles.slice(0, 3) : [];
  const displayName = String(clinicProfile.name || 'Deine Klinik').trim();
  const membershipLabel = String(activeMembershipName || 'Gastzugang').trim() || 'Gastzugang';
  const articleBody = selectedArticle ? splitArticleBody(selectedArticle) : [];
  const articleHeroImage = selectedArticle ? resolveArticleImage(selectedArticle, clinicHeroImage) : '';
  const firstName = String(settingsName || '').trim().split(/\s+/)[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  const greetingText = firstName ? `${greeting}, ${firstName}` : greeting;

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
      <View style={[styles.mowgliHeader, { backgroundColor: theme.header, borderColor: theme.border }]}>
        <View style={styles.mowgliHeaderCopy}>
          <View style={styles.mowgliHeaderBrandRow}>
            <Ionicons name="sparkles-outline" size={16} color={theme.accent} />
            <Text style={[styles.mowgliHeaderBrandText, { color: theme.accent }]}>Curabo</Text>
          </View>
          <Text style={[styles.mowgliHeaderTitle, { color: theme.text }]} numberOfLines={2}>
            {greetingText}
          </Text>
        </View>
        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} theme={theme} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} theme={theme} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.mowgliFeaturedHero,
          { backgroundColor: theme.shell, borderColor: theme.border },
          pressed && styles.mowgliLiftSoft,
        ]}
        onPress={() => {
          if (featuredTreatment) {
            openTreatmentFromHome(featuredTreatment);
          } else {
            onViewOffers();
          }
        }}
      >
        {clinicHeroImage ? (
          <Image source={{ uri: clinicHeroImage }} style={styles.mowgliFeaturedHeroImage} />
        ) : (
          <Image source={HERO_IMAGE_FALLBACK} style={styles.mowgliFeaturedHeroImage} />
        )}
        <View
          style={[
            styles.mowgliFeaturedHeroOverlay,
            { backgroundColor: theme.mode === 'dark' ? 'rgba(10,10,12,0.68)' : 'rgba(18,14,10,0.26)' },
          ]}
        />
        <View pointerEvents="none" style={[styles.mowgliHeroShimmer, { backgroundColor: theme.accentHalo }]} />
        <View style={styles.mowgliFeaturedHeroContent}>
          <Text style={[styles.mowgliFeaturedTag, { color: theme.accent }]}>Featured</Text>
          <Text style={[styles.mowgliFeaturedTitle, { color: theme.text }]} numberOfLines={2}>
            {featuredTreatment?.name || displayName}
          </Text>
          <Text style={[styles.mowgliFeaturedBody, { color: theme.textSoft }]} numberOfLines={2}>
            {featuredTreatment?.description || 'Premium-Treatments und kuratierte Vorteile direkt in deiner Klinik-App.'}
          </Text>
        </View>
      </Pressable>

      {popularTreatments.length > 0 && (
        <>
          <View style={styles.mowgliSectionHeaderRow}>
            <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Beliebte Treatments</Text>
            <Pressable onPress={onViewOffers}>
              <Text style={[styles.mowgliSectionLink, { color: theme.accent }]}>Alle</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mowgliPopularRow}>
            {popularTreatments.map((item, index) => (
              <PopularCard
                key={item.id}
                styles={styles}
                theme={theme}
                treatment={item}
                imageUrl={preferredTreatmentImage(item)}
                fallbackSource={POPULAR_IMAGE_FALLBACKS[index % POPULAR_IMAGE_FALLBACKS.length]}
                formatPrice={formatPrice}
                onPress={openTreatmentFromHome}
              />
            ))}
          </ScrollView>
        </>
      )}

      <MembershipCard
        styles={styles}
        theme={theme}
        membershipLabel={membershipLabel}
        currentMembership={currentMembership}
        onPress={openMembershipTab}
      />

      <View style={styles.mowgliActionSquareRow}>
        <QuickAction
          styles={styles}
          theme={theme}
          icon="calendar-outline"
          title="Treatments"
          caption="Alle Leistungen"
          onPress={onViewOffers}
        />
        <QuickAction
          styles={styles}
          theme={theme}
          icon="star-outline"
          title="Vorteile"
          caption="Mitgliedschaft"
          onPress={openMembershipTab}
        />
        <QuickAction
          styles={styles}
          theme={theme}
          icon="call-outline"
          title="Kontakt"
          caption="Klinik erreichen"
          onPress={() => {
            void callClinicNow();
          }}
        />
      </View>

      <View style={styles.mowgliSectionBlock}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Wissen & Tipps</Text>
        <View style={styles.mowgliKnowledgeList}>
          {articles.map((article, index) => (
            <KnowledgeRow
              key={article.id}
              styles={styles}
              theme={theme}
              article={article}
              imageUrl={resolveArticleImage(article, clinicHeroImage)}
              fallbackSource={ARTICLE_IMAGE_FALLBACKS[index % ARTICLE_IMAGE_FALLBACKS.length]}
              onPress={openArticle}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
