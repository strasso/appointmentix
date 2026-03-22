import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

function HeaderAction({ styles, icon, onPress, badge = false }) {
  return (
    <Pressable style={({ pressed }) => [styles.mowgliHeaderAction, pressed && styles.mowgliLiftSoft]} onPress={onPress}>
      <Ionicons name={icon} size={21} color="#F2ECE3" />
      {badge && <View style={styles.mowgliHeaderActionDot} />}
    </Pressable>
  );
}

function QuickActionCard({ styles, icon, title, caption, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.mowgliQuickActionCard, pressed && styles.mowgliQuickActionPressed]} onPress={onPress}>
      <View style={styles.mowgliQuickActionIcon}>
        <Ionicons name={icon} size={18} color="#C8A97E" />
      </View>
      <Text style={styles.mowgliQuickActionTitle}>{title}</Text>
      <Text style={styles.mowgliQuickActionCaption}>{caption}</Text>
    </Pressable>
  );
}

export default function HomeScreen({
  styles,
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
  const featuredArticle = homeArticles[0];
  const articleList = homeArticles.slice(0, 3);
  const membershipLabel = String(activeMembershipName || 'Gast').trim() || 'Gast';

  return (
    <View style={styles.mowgliScreenShell}>
      <View style={styles.mowgliHeader}>
        <View style={styles.mowgliHeaderCopy}>
          <View style={styles.mowgliHeaderBrandRow}>
            <Ionicons name="sparkles-outline" size={15} color="#C8A97E" />
            <Text style={styles.mowgliHeaderBrandText}>Curabo</Text>
          </View>
          <Text style={styles.mowgliHeaderTitle}>Willkommen zurück</Text>
          <Text style={styles.mowgliHeaderSubtitle}>{clinicProfile.name || 'Deine Klinik auf einen Blick'}</Text>
        </View>

        <View style={styles.mowgliHeaderActions}>
          <HeaderAction styles={styles} icon="search-outline" onPress={onSearchPress} />
          <HeaderAction styles={styles} icon="bag-handle-outline" onPress={onCartPress} badge={cartCount > 0} />
        </View>
      </View>

      <View style={styles.mowgliHeroCard}>
        <View pointerEvents="none" style={styles.mowgliHeroGlow} />
        <View pointerEvents="none" style={styles.mowgliHeroShimmer} />
        <View style={styles.mowgliHeroTopRow}>
          <View style={styles.mowgliHeroChip}>
            <Text style={styles.mowgliHeroChipText}>CURABO EDIT</Text>
          </View>
          <View style={styles.mowgliHeroStatus}>
            <Ionicons name="diamond-outline" size={13} color="#C8A97E" />
            <Text style={styles.mowgliHeroStatusText}>{membershipLabel}</Text>
          </View>
        </View>
        <Text style={styles.mowgliHeroEyebrow}>Persönlicher Überblick</Text>
        <Text style={styles.mowgliHeroTitle}>Deine Klinik, Vorteile und Treatments in einer ruhigen Oberfläche.</Text>
        <Text style={styles.mowgliHeroBody}>
          Curabo bündelt Mitgliedschaft, Wissen, Standort und nächste Schritte an einem Ort, ohne dass sich die App wie ein unruhiger Katalog anfühlt.
        </Text>
        <Pressable style={({ pressed }) => [styles.mowgliHeroCta, pressed && styles.mowgliLiftSoft]} onPress={onViewOffers}>
          <Text style={styles.mowgliHeroCtaText}>Vorteile ansehen</Text>
          <Ionicons name="arrow-forward" size={15} color="#0A0A0C" />
        </Pressable>
      </View>

      <View style={styles.mowgliQuickActionsGrid}>
        <QuickActionCard
          styles={styles}
          icon="pricetags-outline"
          title="Vorteile"
          caption="Wallet, Punkte und aktuelle Extras"
          onPress={onViewOffers}
        />
        <QuickActionCard
          styles={styles}
          icon="call-outline"
          title="Kontakt"
          caption="Klinik direkt anrufen"
          onPress={() => { void callClinicNow(); }}
        />
        <QuickActionCard
          styles={styles}
          icon="location-outline"
          title="Anfahrt"
          caption="Standort in Maps öffnen"
          onPress={() => { void openClinicInMaps(); }}
        />
      </View>

      <View style={styles.mowgliMembershipCard}>
        <View pointerEvents="none" style={styles.mowgliMembershipGlow} />
        <View style={styles.mowgliMembershipTopRow}>
          <View>
            <Text style={styles.mowgliSectionEyebrow}>Aktive Mitgliedschaft</Text>
            <Text style={styles.mowgliMembershipTitle}>{membershipLabel}</Text>
          </View>
          <View style={styles.mowgliMembershipIcon}>
            <Ionicons name="diamond-outline" size={18} color="#C8A97E" />
          </View>
        </View>
        <Text style={styles.mowgliMembershipBody}>
          Vorteile, bessere Preise und eine klarere Wiederkehr-Experience bleiben zentral gebündelt statt über einzelne Flows verteilt.
        </Text>
        <Pressable style={({ pressed }) => [styles.mowgliTextLink, pressed && styles.mowgliLiftSoft]} onPress={openProfile}>
          <Text style={styles.mowgliTextLinkText}>Profil und Mitgliedschaft öffnen</Text>
          <Ionicons name="arrow-forward" size={13} color="#C8A97E" />
        </Pressable>
      </View>

      <View style={styles.mowgliSectionBlock}>
        <View style={styles.mowgliSectionHead}>
          <Text style={styles.mowgliSectionEyebrow}>Wissen & Tipps</Text>
          <Text style={styles.mowgliSectionTitle}>Kuratiert von deiner Klinik</Text>
        </View>

        {!!featuredArticle && (
          <View style={styles.mowgliArticleFeatured}>
            <View pointerEvents="none" style={styles.mowgliArticleFeaturedGlow} />
            <Text style={styles.mowgliArticleTag}>{featuredArticle.tag}</Text>
            <Text style={styles.mowgliArticleFeaturedTitle}>{featuredArticle.title}</Text>
            <Text style={styles.mowgliArticleFeaturedBody}>{featuredArticle.body}</Text>
          </View>
        )}

        <View style={styles.mowgliArticleList}>
          {articleList.slice(featuredArticle ? 1 : 0).map((article) => (
            <View key={article.id} style={styles.mowgliArticleRow}>
              <View style={styles.mowgliArticleThumb}>
                <Ionicons name="reader-outline" size={18} color="#C8A97E" />
              </View>
              <View style={styles.mowgliArticleCopy}>
                <Text style={styles.mowgliArticleTag}>{article.tag}</Text>
                <Text style={styles.mowgliArticleTitle}>{article.title}</Text>
                <Text style={styles.mowgliArticleBody} numberOfLines={2}>{article.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mowgliClinicCard}>
        <View style={styles.mowgliSectionHeadCompact}>
          <Text style={styles.mowgliSectionEyebrow}>Standort & Kontakt</Text>
          <Text style={styles.mowgliSectionTitleSmall}>{clinicProfile.name}</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.mowgliMapWrap, pressed && styles.mowgliLiftSoft]} onPress={() => { void openClinicInMaps(); }}>
          <MapView style={styles.mapView} initialRegion={clinicMapRegion}>
            <Marker
              coordinate={clinicCoordinates}
              title={clinicProfile.name || 'MedSpa'}
              description={clinicProfile.address || clinicProfile.city || 'Standort'}
            />
          </MapView>
          <View style={styles.mowgliMapHint}>
            <Ionicons name="map-outline" size={13} color="#F2ECE3" />
            <Text style={styles.mowgliMapHintText}>In Maps öffnen</Text>
          </View>
        </Pressable>

        <View style={styles.mowgliClinicMetaList}>
          <View style={styles.mowgliClinicMetaRow}>
            <Ionicons name="location-outline" size={14} color="#C8A97E" />
            <Text style={styles.mowgliClinicMetaText}>
              {clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}
            </Text>
          </View>
          <View style={styles.mowgliClinicMetaRow}>
            <Ionicons name="time-outline" size={14} color="#C8A97E" />
            <Text style={styles.mowgliClinicMetaText}>
              {clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}
            </Text>
          </View>
        </View>

        <View style={styles.mowgliClinicActionRow}>
          <Pressable style={({ pressed }) => [styles.mowgliClinicPrimary, pressed && styles.mowgliLiftSoft]} onPress={() => { void callClinicNow(); }}>
            <Text style={styles.mowgliClinicPrimaryText}>Klinik anrufen</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.mowgliClinicSecondary, pressed && styles.mowgliLiftSoft]} onPress={openProfile}>
            <Text style={styles.mowgliClinicSecondaryText}>Profil öffnen</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
