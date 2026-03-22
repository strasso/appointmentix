import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

function MenuRow({ styles, theme, icon, title, subtitle, onPress, destructive = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mowgliProfileMenuRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.mowgliLiftSoft,
      ]}
      onPress={onPress}
    >
      <View style={[styles.mowgliProfileMenuIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons name={icon} size={16} color={destructive ? '#B86A5D' : theme.textMuted} />
      </View>
      <View style={styles.mowgliProfileMenuCopy}>
        <Text style={[styles.mowgliProfileMenuTitle, { color: destructive ? '#B86A5D' : theme.text }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.mowgliProfileMenuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </Pressable>
  );
}

function IdentityBadge({ styles, theme, label, value }) {
  return (
    <View style={[styles.mowgliProfileIdentityBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.mowgliProfileIdentityBadgeLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.mowgliProfileIdentityBadgeValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen({
  styles,
  mowgliTheme,
  clinicProfile,
  history,
  formatDate,
  formatPrice,
  openShopBrowse,
  hasActiveMembership,
  currentMembership,
  membershipStatusText,
  membershipStatus,
  membershipSyncing,
  cancelMembership,
  settingsName,
  setSettingsName,
  settingsEmail,
  setSettingsEmail,
  uiAppearance,
  setUiAppearance,
  analyticsConnected,
  backendCheckMessage,
  patientGuestMode,
  patientPhone,
  reloadClinicBundle,
  openOnboardingSetup,
  disconnectClinicSession,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const recentHistory = Array.isArray(history) ? history.slice(0, 3) : [];
  const displayName = String(settingsName || 'Patient:in').trim() || 'Patient:in';
  const displayInitial = displayName.slice(0, 1).toUpperCase() || 'P';
  const clinicName = String(clinicProfile.name || 'Deine Klinik').trim();

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliProfileHeader}>
        <Text style={[styles.mowgliHeaderSmallLabel, { color: theme.textMuted }]}>Account</Text>
        <Text style={[styles.mowgliProfileHeaderTitle, { color: theme.text }]}>Profil</Text>
      </View>

      <View style={[styles.mowgliProfileIdentityShell, { backgroundColor: theme.shell, borderColor: theme.borderStrong }]}>
        <View pointerEvents="none" style={[styles.mowgliProfileIdentityGlow, { backgroundColor: theme.heroGlow }]} />
        <View style={styles.mowgliProfileTopRow}>
          <View style={[styles.mowgliProfileAvatarLarge, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}>
            <Text style={[styles.mowgliProfileAvatarLargeText, { color: theme.accent }]}>{displayInitial}</Text>
          </View>
          <View style={styles.mowgliProfileTopCopy}>
            <Text style={[styles.mowgliProfileTopName, { color: theme.text }]}>{displayName}</Text>
            <Text style={[styles.mowgliProfileTopMeta, { color: theme.textMuted }]}>{settingsEmail || 'Keine E-Mail hinterlegt'}</Text>
            <View style={styles.mowgliProfileTopBadgeRow}>
              <Ionicons name="diamond-outline" size={14} color={theme.accent} />
              <Text style={[styles.mowgliProfileTopBadgeText, { color: theme.accent }]}>
                {hasActiveMembership ? currentMembership?.name || membershipStatusText : 'Gastzugang'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.mowgliProfileIdentityBadgeRow}>
          <IdentityBadge styles={styles} theme={theme} label="MedSpa" value={clinicName || 'Nicht gesetzt'} />
          <IdentityBadge
            styles={styles}
            theme={theme}
            label="Modus"
            value={patientGuestMode ? 'Gast' : patientPhone ? patientPhone : 'Unbekannt'}
          />
        </View>
      </View>

      <View style={[styles.mowgliProfileMembershipTeaser, { backgroundColor: theme.shell, borderColor: theme.borderStrong }]}>
        <View pointerEvents="none" style={[styles.mowgliProfileMembershipMark, { backgroundColor: theme.heroGlow }]} />
        <Text style={[styles.mowgliSectionEyebrow, { color: theme.accent }]}>Mitgliedschaft</Text>
        <Text style={[styles.mowgliProfileMembershipTitle, { color: theme.text }]}>
          {hasActiveMembership ? currentMembership?.name || 'Aktive Mitgliedschaft' : 'Keine aktive Mitgliedschaft'}
        </Text>
        <Text style={[styles.mowgliProfileMembershipMeta, { color: theme.textMuted }]}>
          {membershipStatus?.nextChargeAt ? `Nächste Abrechnung: ${formatDate(membershipStatus.nextChargeAt)}` : membershipStatusText}
        </Text>
        {hasActiveMembership ? (
          <Pressable
            style={({ pressed }) => [styles.mowgliProfileMembershipLink, pressed && styles.mowgliLiftSoft]}
            disabled={membershipSyncing}
            onPress={() => {
              void cancelMembership();
            }}
          >
            <Text style={[styles.mowgliProfileMembershipLinkText, { color: theme.accent }]}>
              {membershipSyncing ? 'Wird verarbeitet ...' : 'Verwalten'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={theme.accent} />
          </Pressable>
        ) : (
          <Pressable style={styles.mowgliProfileMembershipLink} onPress={openShopBrowse}>
            <Text style={[styles.mowgliProfileMembershipLinkText, { color: theme.accent }]}>Shop öffnen</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.accent} />
          </Pressable>
        )}
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Zuletzt</Text>
      </View>
      <View style={styles.mowgliProfileHistoryList}>
        {recentHistory.length === 0 && (
          <View style={[styles.mowgliEmptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.mowgliEmptyTitle, { color: theme.text }]}>Noch keine Käufe</Text>
            <Text style={[styles.mowgliEmptyBody, { color: theme.textMuted }]}>Sobald Treatments gekauft werden, erscheinen sie hier.</Text>
          </View>
        )}
        {recentHistory.map((entry) => (
          <View key={entry.id} style={[styles.mowgliRewardsHistoryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.mowgliRewardsHistoryIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Ionicons name={'amount' in entry ? 'bag-check-outline' : 'gift-outline'} size={16} color={theme.accent} />
            </View>
            <View style={styles.mowgliRewardsHistoryCopy}>
              <Text style={[styles.mowgliRewardsHistoryTitle, { color: theme.text }]}>{entry.title}</Text>
              <Text style={[styles.mowgliRewardsHistoryMeta, { color: theme.textMuted }]}>{formatDate(entry.createdAt)}</Text>
            </View>
            <Text style={[styles.mowgliRewardsHistoryValue, { color: theme.text }]}>
              {'amount' in entry ? formatPrice(entry.amount) : `+${entry.points}`}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Einstellungen</Text>
      </View>
      <View style={[styles.mowgliSettingsCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View style={[styles.mowgliSettingsInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <TextInput
            style={[styles.mowgliSettingsInput, { color: theme.text }]}
            value={settingsName}
            onChangeText={setSettingsName}
            placeholder="Name"
            placeholderTextColor={theme.textMuted}
            keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
            selectionColor={theme.accent}
          />
        </View>
        <View style={[styles.mowgliSettingsInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
          <TextInput
            style={[styles.mowgliSettingsInput, { color: theme.text }]}
            value={settingsEmail}
            onChangeText={setSettingsEmail}
            placeholder="E-Mail"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
            selectionColor={theme.accent}
          />
        </View>
        <View style={[styles.mowgliProfileThemeToggle, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Pressable
            style={[
              styles.mowgliProfileThemeButton,
              { backgroundColor: uiAppearance === 'light' ? theme.primaryButtonBg : 'transparent' },
            ]}
            onPress={() => setUiAppearance('light')}
          >
            <Text style={[styles.mowgliProfileThemeButtonText, { color: uiAppearance === 'light' ? theme.primaryButtonText : theme.textMuted }]}>
              White Mode
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.mowgliProfileThemeButton,
              { backgroundColor: uiAppearance === 'dark' ? theme.surface : 'transparent' },
            ]}
            onPress={() => setUiAppearance('dark')}
          >
            <Text style={[styles.mowgliProfileThemeButtonText, { color: uiAppearance === 'dark' ? theme.text : theme.textMuted }]}>
              Dark Mode
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.mowgliSettingsInfoText, { color: theme.textSoft }]}>
          {analyticsConnected ? 'MedSpa-Daten sind verbunden.' : 'MedSpa-Daten sind aktuell nicht verbunden.'}
        </Text>
        {!!backendCheckMessage && (
          <Text style={[styles.mowgliSettingsInfoText, { color: theme.textMuted }]}>{backendCheckMessage}</Text>
        )}
      </View>

      <View style={styles.mowgliProfileMenuList}>
        <MenuRow
          styles={styles}
          theme={theme}
          icon="refresh-outline"
          title="MedSpa-Daten neu laden"
          subtitle="Clinic Bundle erneut vom Backend holen"
          onPress={reloadClinicBundle}
        />
        <MenuRow
          styles={styles}
          theme={theme}
          icon="construct-outline"
          title="Klinik wechseln"
          subtitle="Klinik-Auswahl und Setup erneut öffnen"
          onPress={openOnboardingSetup}
        />
        <MenuRow
          styles={styles}
          theme={theme}
          icon="log-out-outline"
          title="Von MedSpa abmelden"
          subtitle="Aktuelle Sitzung und Klinikverbindung beenden"
          onPress={() => {
            void disconnectClinicSession();
          }}
          destructive
        />
      </View>
    </View>
  );
}
