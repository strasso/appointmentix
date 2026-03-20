import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import TopHeader from '../components/TopHeader';
import TabButton from '../components/TabButton';
import { THEME } from '../theme/tokens';

export default function ProfileScreen({
  styles,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  profileTab,
  setProfileTab,
  history,
  formatDate,
  formatPrice,
  openShopBrowse,
  hasActiveMembership,
  currentMembership,
  membershipStatusText,
  membershipStatus,
  treatments,
  membershipSyncing,
  cancelMembership,
  openMembershipTab,
  settingsName,
  setSettingsName,
  settingsEmail,
  setSettingsEmail,
  analyticsConnected,
  backendCheckMessage,
  patientGuestMode,
  patientPhone,
  reloadClinicBundle,
  openOnboardingSetup,
  disconnectClinicSession,
}) {
  const includedTreatmentIds = Array.isArray(currentMembership?.includedTreatmentIds)
    ? currentMembership.includedTreatmentIds
    : [];

  return (
    <View>
      <TopHeader
        styles={styles}
        title="Konto"
        sectionLabel="Konto & Mitgliedschaft"
        subtitle="Daten, Status und Verbindung"
        clinicShortName={clinicProfile.shortName}
        clinicName={clinicProfile.name}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        cartCount={cartCount}
      />

      <View style={styles.segmentRow}>
        <TabButton
          styles={styles}
          label="Behandlungen"
          active={profileTab === 'behandlungen'}
          onPress={() => setProfileTab('behandlungen')}
        />
        <TabButton
          styles={styles}
          label="Mitgliedschaft"
          active={profileTab === 'membership'}
          onPress={() => setProfileTab('membership')}
        />
        <TabButton
          styles={styles}
          label="Einstellungen"
          active={profileTab === 'settings'}
          onPress={() => setProfileTab('settings')}
        />
      </View>

      {profileTab === 'behandlungen' && (
        <View>
          {history.length === 0 && (
            <View style={styles.profileEmptyCard}>
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <View style={styles.profileGhostList}>
                {[1, 2, 3].map((row) => (
                  <View key={`ghost-${row}`} style={styles.profileGhostRow}>
                    <View style={styles.profileGhostAvatar} />
                    <View style={styles.profileGhostLineWrap}>
                      <View style={[styles.profileGhostLine, styles.profileGhostLineWide]} />
                      <View style={styles.profileGhostLine} />
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.profileEmptyTitle}>Noch keine Behandlung gekauft</Text>
              <Pressable style={styles.profileEmptyCta} onPress={openShopBrowse}>
                <Text style={styles.profileEmptyCtaText}>Shop öffnen</Text>
              </Pressable>
            </View>
          )}

          {history.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <Text style={styles.historyTitle}>{entry.title}</Text>
              <Text style={styles.historyMeta}>{formatDate(entry.createdAt)}</Text>
              {'amount' in entry && <Text style={styles.historyMeta}>{formatPrice(entry.amount)}</Text>}
              {'points' in entry && <Text style={styles.historyMeta}>+{entry.points} Punkte</Text>}
            </View>
          ))}
        </View>
      )}

      {profileTab === 'membership' && (
        <View style={styles.membershipCardActive}>
          <View pointerEvents="none" style={styles.cardChrome} />
          <Text style={styles.membershipName}>
            {hasActiveMembership ? currentMembership.name : 'Keine aktive Mitgliedschaft'}
          </Text>
          <Text style={styles.membershipPrice}>
            Status: {membershipStatusText}
            {membershipStatus?.nextChargeAt ? ` • Nächste Abbuchung: ${formatDate(membershipStatus.nextChargeAt)}` : ''}
          </Text>
          {hasActiveMembership ? (
            <View>
              <Text style={styles.membershipPerk}>Inklusive Behandlungen:</Text>
              {includedTreatmentIds.map((id) => {
                const treatment = treatments.find((item) => item.id === id);
                if (!treatment) return null;
                return (
                  <Text key={id} style={styles.membershipPerk}>• {treatment.name}</Text>
                );
              })}
              <Pressable
                style={styles.secondaryCta}
                disabled={membershipSyncing}
                onPress={() => {
                  void cancelMembership();
                }}
              >
                <Text style={styles.secondaryCtaText}>
                  {membershipSyncing ? 'Wird verarbeitet...' : 'Mitgliedschaft kündigen'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.profileEmptyMembershipWrap}>
              <Text style={styles.profileEmptyMembershipText}>Keine aktive Mitgliedschaft</Text>
              <Pressable style={styles.profileEmptyCta} onPress={openMembershipTab}>
                <Text style={styles.profileEmptyCtaText}>Mitgliedschaften ansehen</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {profileTab === 'settings' && (
        <View style={styles.settingsCard}>
          <View pointerEvents="none" style={styles.cardChrome} />
          <Text style={styles.sectionSubTitle}>Profil</Text>
          <TextInput
            style={styles.input}
            value={settingsName}
            onChangeText={setSettingsName}
            placeholder="Name"
            placeholderTextColor={THEME.muted}
          />
          <TextInput
            style={styles.input}
            value={settingsEmail}
            onChangeText={setSettingsEmail}
            placeholder="E-Mail"
            placeholderTextColor={THEME.muted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.sectionSubTitle}>MedSpa-App Verbindung</Text>
          <Text style={styles.analyticsStatus}>MedSpa: {clinicProfile.name || 'Nicht gesetzt'}</Text>
          <Pressable style={styles.secondaryCta} onPress={reloadClinicBundle}>
            <Text style={styles.secondaryCtaText}>MedSpa-Daten neu laden</Text>
          </Pressable>
          <Pressable style={styles.secondaryCta} onPress={openOnboardingSetup}>
            <Text style={styles.secondaryCtaText}>Verbindung neu einrichten</Text>
          </Pressable>
          <Text style={styles.analyticsStatus}>
            {analyticsConnected
              ? 'MedSpa-Daten sind verbunden.'
              : 'MedSpa-Daten sind aktuell nicht verbunden.'}
          </Text>
          <Text style={styles.analyticsStatus}>
            MedSpa-Metriken und Kampagnen werden ausschließlich im Web-Dashboard verwaltet.
          </Text>
          {!!backendCheckMessage && <Text style={styles.diagnosticText}>{backendCheckMessage}</Text>}
          <Text style={styles.analyticsStatus}>
            Mitgliedschafts-Konto: {String(settingsEmail || '').trim() || 'nicht gesetzt'}
          </Text>
          <Text style={styles.analyticsStatus}>
            Modus: {patientGuestMode ? 'Gast' : patientPhone ? `Telefon ${patientPhone}` : 'Unbekannt'}
          </Text>

          <Pressable
            style={styles.secondaryCta}
            onPress={() => {
              void disconnectClinicSession();
            }}
          >
            <Text style={styles.secondaryCtaText}>Von MedSpa abmelden</Text>
          </Pressable>

          <View style={styles.inlineInfoBox}>
            <Text style={styles.inlineInfoTitle}>Reward-Regeln</Text>
            <Text style={styles.inlineInfoText}>• 1 EUR Umsatz = 1 Punkt</Text>
            <Text style={styles.inlineInfoText}>• 250 Punkte = 15 EUR Wallet-Guthaben</Text>
            <Text style={styles.inlineInfoText}>• Punkte verfallen nach 12 Monaten</Text>
          </View>
        </View>
      )}
    </View>
  );
}
