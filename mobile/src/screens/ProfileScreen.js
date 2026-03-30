import React, { useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

const DEFAULT_AVATAR = require('../../_mowgli_export/screens/images/avatar-female.jpg');

function MenuRow({ theme, icon, title, subtitle, onPress, destructive = false, noBorder = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        profileStyles.menuRow,
        {
          backgroundColor: theme.surfaceAlt,
          borderBottomColor: noBorder ? 'transparent' : theme.border,
        },
        pressed && profileStyles.pressed,
      ]}
    >
      <View style={profileStyles.menuLeft}>
        <Ionicons name={icon} size={18} color={destructive ? '#B86A5D' : theme.textMuted} />
        <View>
          <Text style={[profileStyles.menuTitle, { color: destructive ? '#B86A5D' : theme.text }]}>{title}</Text>
          {!!subtitle && <Text style={[profileStyles.menuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

export default function ProfileScreen({
  mowgliTheme,
  clinicProfile,
  formatDate,
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
  const [showClinicChangeWarning, setShowClinicChangeWarning] = useState(false);
  const displayName = String(settingsName || 'Patient:in').trim() || 'Patient:in';
  const clinicName = String(clinicProfile.name || 'Deine Klinik').trim() || 'Deine Klinik';
  const membershipName = hasActiveMembership ? currentMembership?.name || membershipStatusText : 'Gastzugang';
  const membershipMeta = membershipStatus?.nextChargeAt
    ? `Nächste Abrechnung: ${formatDate(membershipStatus.nextChargeAt)}`
    : membershipStatusText;
  const displayMeta = useMemo(() => {
    if (settingsEmail) return settingsEmail;
    if (patientGuestMode) return 'Gastzugang';
    if (patientPhone) return patientPhone;
    return 'Keine Kontaktdaten hinterlegt';
  }, [patientGuestMode, patientPhone, settingsEmail]);

  return (
    <View style={[profileStyles.screen, { backgroundColor: theme.page }]}>
      <View style={profileStyles.header}>
        <Text style={[profileStyles.headerTitle, { color: theme.text }]}>Profil</Text>
      </View>

      <View style={profileStyles.userSection}>
        <View style={[profileStyles.avatarFrame, { borderColor: theme.accent }]}>
          <Image source={DEFAULT_AVATAR} style={profileStyles.avatarImage} />
        </View>
        <View style={profileStyles.userCopy}>
          <Text style={[profileStyles.userName, { color: theme.text }]}>{displayName}</Text>
          <Text style={[profileStyles.userMeta, { color: theme.textMuted }]}>{displayMeta}</Text>
          <View style={profileStyles.memberRow}>
            <Ionicons name="diamond-outline" size={15} color={theme.accent} />
            <Text style={[profileStyles.memberText, { color: theme.accent }]}>
              {membershipName}
            </Text>
          </View>
        </View>
      </View>

      <View style={[profileStyles.membershipCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.borderStrong }]}>
        <View style={[profileStyles.membershipMark, { backgroundColor: theme.heroGlow }]} />
        <Text style={[profileStyles.membershipTitle, { color: theme.text }]}>
          {hasActiveMembership ? membershipName : 'Keine aktive Mitgliedschaft'}
        </Text>
        <Text style={[profileStyles.membershipMeta, { color: theme.textMuted }]}>{membershipMeta}</Text>
        <Pressable
          onPress={() => {
            if (hasActiveMembership) {
              void cancelMembership();
              return;
            }
            openShopBrowse();
          }}
          disabled={membershipSyncing}
          style={({ pressed }) => [profileStyles.membershipLink, pressed && profileStyles.pressed]}
        >
          <Text style={[profileStyles.membershipLinkText, { color: theme.accent }]}>
            {hasActiveMembership ? (membershipSyncing ? 'Wird verarbeitet ...' : 'Verwalten') : 'Shop öffnen'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.accent} />
        </Pressable>
      </View>

      <View style={profileStyles.menuSection}>
        <MenuRow
          theme={theme}
          icon="business-outline"
          title="Aktive Klinik"
          subtitle={clinicName}
          onPress={reloadClinicBundle}
        />
        <MenuRow
          theme={theme}
          icon="diamond-outline"
          title="Mitgliedschaft"
          subtitle={hasActiveMembership ? membershipName : 'Shop öffnen'}
          onPress={openShopBrowse}
        />
        <MenuRow
          theme={theme}
          icon="refresh-outline"
          title="MedSpa-Daten neu laden"
          subtitle="Aktuelle Inhalte und Branding synchronisieren"
          onPress={reloadClinicBundle}
        />
        <MenuRow
          theme={theme}
          icon="shuffle-outline"
          title="Klinik wechseln"
          subtitle="Zur Klinikauswahl zurückkehren"
          onPress={() => setShowClinicChangeWarning(true)}
        />
        <MenuRow
          theme={theme}
          icon="log-out-outline"
          title="Von MedSpa abmelden"
          subtitle="Sitzung und Klinikverbindung beenden"
          onPress={() => {
            void disconnectClinicSession();
          }}
          destructive
          noBorder
        />
      </View>

      <View style={[profileStyles.settingsCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <Text style={[profileStyles.settingsLabel, { color: theme.accent }]}>Darstellung & Profil</Text>
        <View style={[profileStyles.inputShell, { backgroundColor: theme.page, borderColor: theme.border }]}>
          <TextInput
            style={[profileStyles.input, { color: theme.text }]}
            value={settingsName}
            onChangeText={setSettingsName}
            placeholder="Name"
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
          />
        </View>
        <View style={[profileStyles.inputShell, { backgroundColor: theme.page, borderColor: theme.border }]}>
          <TextInput
            style={[profileStyles.input, { color: theme.text }]}
            value={settingsEmail}
            onChangeText={setSettingsEmail}
            placeholder="E-Mail"
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            keyboardAppearance={theme.mode === 'dark' ? 'dark' : 'light'}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={[profileStyles.modeToggle, { backgroundColor: theme.page, borderColor: theme.border }]}>
          <Pressable
            onPress={() => setUiAppearance('light')}
            style={[
              profileStyles.modeButton,
              {
                backgroundColor: uiAppearance === 'light' ? theme.primaryButtonBg : 'transparent',
              },
            ]}
          >
            <Text style={[profileStyles.modeButtonText, { color: uiAppearance === 'light' ? theme.primaryButtonText : theme.textMuted }]}>
              White Mode
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setUiAppearance('dark')}
            style={[
              profileStyles.modeButton,
              {
                backgroundColor: uiAppearance === 'dark' ? theme.shell : 'transparent',
              },
            ]}
          >
            <Text style={[profileStyles.modeButtonText, { color: uiAppearance === 'dark' ? theme.text : theme.textMuted }]}>
              Dark Mode
            </Text>
          </Pressable>
        </View>

        <Text style={[profileStyles.infoText, { color: theme.textSoft }]}>
          {analyticsConnected ? 'MedSpa-Daten sind verbunden.' : 'MedSpa-Daten sind aktuell nicht verbunden.'}
        </Text>
        {!!backendCheckMessage && (
          <Text style={[profileStyles.infoText, { color: theme.textMuted }]}>{backendCheckMessage}</Text>
        )}
      </View>

      {showClinicChangeWarning && (
        <View style={profileStyles.modalBackdrop}>
          <View style={[profileStyles.modalCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <View style={[profileStyles.modalIconWrap, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}>
              <Ionicons name="shuffle-outline" size={30} color={theme.accent} />
            </View>
            <Text style={[profileStyles.modalTitle, { color: theme.text }]}>Klinik wirklich wechseln?</Text>
            <Text style={[profileStyles.modalBody, { color: theme.textMuted }]}>
              Dies beendet deine aktuelle Sitzung. Punkte und Mitgliedschaften bleiben an die aktuelle Klinik gebunden.
            </Text>
            <Pressable
              onPress={() => {
                setShowClinicChangeWarning(false);
                openOnboardingSetup();
              }}
              style={({ pressed }) => [
                profileStyles.modalPrimary,
                { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
                pressed && profileStyles.pressed,
              ]}
            >
              <Text style={[profileStyles.modalPrimaryText, { color: theme.primaryButtonText }]}>Ja, wechseln</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowClinicChangeWarning(false)}
              style={({ pressed }) => [profileStyles.modalSecondary, pressed && profileStyles.pressed]}
            >
              <Text style={[profileStyles.modalSecondaryText, { color: theme.textMuted }]}>Abbrechen</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const profileStyles = StyleSheet.create({
  screen: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
    gap: 18,
  },
  avatarFrame: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    padding: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '600',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberText: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  membershipCard: {
    marginHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 28,
    overflow: 'hidden',
  },
  membershipMark: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 82,
    height: 82,
    borderRadius: 999,
  },
  membershipTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  membershipMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  membershipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  membershipLinkText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  menuSection: {
    marginHorizontal: 24,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingsCard: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  settingsLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  inputShell: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    paddingVertical: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 17,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(10,10,12,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 25,
    lineHeight: 30,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalPrimary: {
    width: '100%',
    minHeight: 54,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
  },
  modalSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ translateY: -1 }],
  },
});
