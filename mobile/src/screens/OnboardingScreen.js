import React, { useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createMowgliTheme } from '../theme/tokens';

const ONBOARDING_KEYBOARD_ACCESSORY_ID = 'curabo-onboarding-keyboard';

function buttonPressedStyle(pressed) {
  return pressed
    ? {
        opacity: 0.94,
        transform: [{ translateY: -1 }],
      }
    : null;
}

function PrimaryButton({ theme, label, onPress, disabled = false, icon = 'arrow-forward-outline' }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        onboardingStyles.primaryButton,
        {
          backgroundColor: theme.primaryButtonBg,
          borderColor: theme.borderStrong,
        },
        disabled && onboardingStyles.disabled,
        buttonPressedStyle(pressed && !disabled),
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.primaryButtonText} />
      <Text style={[onboardingStyles.primaryButtonText, { color: theme.primaryButtonText }]}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ theme, label, onPress, disabled = false, icon }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        onboardingStyles.secondaryButton,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.border,
        },
        disabled && onboardingStyles.disabled,
        buttonPressedStyle(pressed && !disabled),
      ]}
    >
      {!!icon && <Ionicons name={icon} size={16} color={theme.text} />}
      <Text style={[onboardingStyles.secondaryButtonText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

function ClinicCard({ theme, clinic, isSelected, onPress, isLast }) {
  const name = String(clinic?.name || '').trim() || 'MedSpa';
  const city = [clinic?.city, clinic?.website].filter(Boolean).join(' • ') || 'Klinikprofil';
  const accent = String(clinic?.accentColor || clinic?.brandColor || theme.accent).trim() || theme.accent;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        onboardingStyles.clinicCard,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: isSelected ? theme.borderStrong : theme.border,
          marginBottom: isLast ? 0 : 14,
        },
        isSelected && {
          shadowColor: accent,
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        },
        buttonPressedStyle(pressed),
      ]}
    >
      <View style={[onboardingStyles.clinicLogo, { backgroundColor: theme.input, borderColor: theme.border }]}>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'business-outline'}
          size={20}
          color={isSelected ? theme.accent : accent}
        />
      </View>
      <View style={onboardingStyles.clinicCopy}>
        <Text style={[onboardingStyles.clinicName, { color: theme.text }]}>{name}</Text>
        <View style={onboardingStyles.clinicMetaRow}>
          <Ionicons name="location-outline" size={12} color={theme.textMuted} />
          <Text style={[onboardingStyles.clinicMeta, { color: theme.textMuted }]}>{city}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.accent} />
    </Pressable>
  );
}

function OtpBoxRow({ theme, value, onPress }) {
  const digits = String(value || '').replace(/\D+/g, '').slice(0, 6).split('');
  while (digits.length < 6) digits.push('');

  return (
    <Pressable onPress={onPress} style={onboardingStyles.otpRow}>
      {digits.map((digit, index) => (
        <View
          key={`otp-box-${index}`}
          style={[
            onboardingStyles.otpBox,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: digit ? theme.borderStrong : theme.border,
            },
          ]}
        >
          <Text style={[onboardingStyles.otpBoxText, { color: theme.text }]}>{digit}</Text>
        </View>
      ))}
    </Pressable>
  );
}

export default function OnboardingScreen({
  mowgliTheme,
  onboardingStep,
  showTechnicalSetup,
  setShowTechnicalSetup,
  needsBackendProvisioning,
  onboardingBaseUrl,
  setOnboardingBaseUrl,
  backendCheckLoading,
  runBackendHealthCheck,
  clinicSearchQuery,
  onClinicSearchChange,
  onClinicSearchFocus,
  onClinicSearchSubmit,
  clinicSearchLoading,
  clinicDropdownOpen,
  clinicSuggestionResults,
  clinicLookupName,
  selectClinicFromSearch,
  scanCodeValue,
  setScanCodeValue,
  useQrOrReferralCode,
  continueToAccessStep,
  patientPhone,
  setPatientPhone,
  connectLoading,
  otpLoading,
  otpResendLoading,
  continueWithPhone,
  otpCtaLabel,
  otpUiMessage,
  otpUiType,
  otpReadyToVerify,
  otpCode,
  setOtpCode,
  otpExpiresAt,
  formatClock,
  otpCountdown,
  resendOtpCode,
  otpResendLabel,
  continueAsGuest,
  resetOtpFlow,
  setOnboardingStep,
  backendCheckMessage,
  continueOfflineDemo,
  allowTechnicalSetup,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const inputAccessoryViewID = Platform.OS === 'ios' ? ONBOARDING_KEYBOARD_ACCESSORY_ID : undefined;
  const selectedClinicName = String(clinicLookupName || '').trim();
  const searchValue = String(clinicSearchQuery || '').trim();
  const searchActive = searchValue.length > 0;
  const showNoResults =
    clinicDropdownOpen &&
    searchActive &&
    !clinicSearchLoading &&
    Array.isArray(clinicSuggestionResults) &&
    clinicSuggestionResults.length === 0;
  const otpInputRef = useRef(null);
  const renderedClinics = useMemo(() => {
    if (Array.isArray(clinicSuggestionResults) && clinicSuggestionResults.length > 0) {
      return clinicSuggestionResults;
    }
    return [];
  }, [clinicSuggestionResults]);

  return (
    <SafeAreaView style={[onboardingStyles.safeArea, { backgroundColor: theme.page }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} />
      <ScrollView
        contentContainerStyle={onboardingStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        {onboardingStep === 'clinic' ? (
          <>
            <View style={onboardingStyles.topHeader}>
              <View style={onboardingStyles.brandRow}>
                <Ionicons name="sparkles-outline" size={18} color={theme.accent} />
                <Text style={[onboardingStyles.brandText, { color: theme.accent }]}>Curabo</Text>
              </View>
              <Text style={[onboardingStyles.heroTitle, { color: theme.text }]}>Willkommen</Text>
              <Text style={[onboardingStyles.heroBody, { color: theme.textMuted }]}>
                Wähle deine Klinik, um deine persönliche Reise zu beginnen.
              </Text>
            </View>

            <View style={onboardingStyles.searchSection}>
              <View style={[onboardingStyles.searchShell, { backgroundColor: theme.surfaceAlt, borderColor: searchActive ? theme.borderStrong : theme.border }]}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={searchActive ? theme.accent : theme.textMuted}
                  style={onboardingStyles.searchIcon}
                />
                <TextInput
                  style={[onboardingStyles.searchInput, { color: theme.text }]}
                  value={clinicSearchQuery}
                  onChangeText={onClinicSearchChange}
                  onFocus={onClinicSearchFocus}
                  onSubmitEditing={onClinicSearchSubmit}
                  placeholder="Klinikname oder Stadt..."
                  placeholderTextColor={theme.textMuted}
                  returnKeyType="search"
                  autoCorrect={false}
                  inputAccessoryViewID={inputAccessoryViewID}
                />
                {searchActive && (
                  <Pressable onPress={() => onClinicSearchChange('')} style={onboardingStyles.searchClear}>
                    <Ionicons name="close-outline" size={18} color={theme.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={onboardingStyles.contentArea}>
              {showNoResults ? (
                <View style={onboardingStyles.emptyState}>
                  <View style={[onboardingStyles.emptyStateIcon, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                    <Ionicons name="search-outline" size={28} color={theme.textMuted} />
                  </View>
                  <Text style={[onboardingStyles.emptyStateTitle, { color: theme.text }]}>Keine Ergebnisse</Text>
                  <Text style={[onboardingStyles.emptyStateBody, { color: theme.textMuted }]}>
                    Versuche es mit einem anderen Suchbegriff oder nutze einen Referral-Code.
                  </Text>
                </View>
              ) : (
                <View style={onboardingStyles.resultsSection}>
                  <Text style={[onboardingStyles.eyebrow, { color: theme.accent }]}>
                    {searchActive ? 'Ergebnisse' : 'Empfohlene Kliniken'}
                  </Text>
                  {renderedClinics.map((clinic, index) => {
                    const name = String(clinic?.name || '').trim();
                    return (
                      <ClinicCard
                        key={name || `clinic-${index}`}
                        clinic={clinic}
                        theme={theme}
                        isSelected={Boolean(name) && name === selectedClinicName}
                        isLast={index === renderedClinics.length - 1}
                        onPress={() => selectClinicFromSearch(clinic)}
                      />
                    );
                  })}
                </View>
              )}

              <View style={[onboardingStyles.divider, { backgroundColor: theme.border }]} />

              <View style={onboardingStyles.referralSection}>
                <Text style={[onboardingStyles.eyebrow, { color: theme.accent }]}>Referral-Code</Text>
                <View style={[onboardingStyles.inputShell, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Ionicons name="ticket-outline" size={18} color={theme.accent} style={onboardingStyles.inputIcon} />
                  <TextInput
                    style={[onboardingStyles.input, { color: theme.text }]}
                    value={scanCodeValue}
                    onChangeText={setScanCodeValue}
                    placeholder="QR- oder Referral-Code"
                    placeholderTextColor={theme.textMuted}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>
                <SecondaryButton
                  theme={theme}
                  label="Code verwenden"
                  icon="qr-code-outline"
                  onPress={() => {
                    void useQrOrReferralCode();
                  }}
                />

                <View style={onboardingStyles.selectedClinicRow}>
                  <Text style={[onboardingStyles.selectedClinicLabel, { color: theme.textMuted }]}>Ausgewählte Klinik</Text>
                  <Text style={[onboardingStyles.selectedClinicValue, { color: theme.text }]}>
                    {selectedClinicName || 'Noch nicht ausgewählt'}
                  </Text>
                </View>

                <PrimaryButton
                  theme={theme}
                  label="Weiter"
                  icon="arrow-forward-outline"
                  onPress={continueToAccessStep}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={onboardingStyles.authHeader}>
              <View style={[onboardingStyles.authClinicMark, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Ionicons name="business-outline" size={30} color={theme.accent} />
              </View>
              <View style={onboardingStyles.authTitleWrap}>
                <Pressable
                  onPress={() => {
                    resetOtpFlow();
                    setOnboardingStep('clinic');
                  }}
                  style={({ pressed }) => [onboardingStyles.authBackButton, buttonPressedStyle(pressed)]}
                >
                  <Ionicons name="arrow-back" size={18} color={theme.text} />
                </Pressable>
                <Text style={[onboardingStyles.authClinicName, { color: theme.text }]}>
                  {selectedClinicName || 'Deine Klinik'}
                </Text>
                <Text style={[onboardingStyles.authClinicBody, { color: theme.textMuted }]}>
                  {otpReadyToVerify ? 'Verifiziere deine Nummer' : 'Gib deine Nummer ein'}
                </Text>
              </View>
            </View>

            <View style={onboardingStyles.authContent}>
              {!otpReadyToVerify ? (
                <>
                  <Text style={[onboardingStyles.eyebrow, { color: theme.accent }]}>Mobilfunknummer</Text>
                  <View style={onboardingStyles.phoneRow}>
                    <View style={[onboardingStyles.phonePrefix, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                      <Text style={[onboardingStyles.phonePrefixText, { color: theme.text }]}>+43</Text>
                    </View>
                    <View style={[onboardingStyles.phoneInputShell, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                      <TextInput
                        style={[onboardingStyles.input, { color: theme.text }]}
                        value={patientPhone}
                        onChangeText={setPatientPhone}
                        placeholder="660 1234567"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                        inputAccessoryViewID={inputAccessoryViewID}
                      />
                    </View>
                  </View>

                  <PrimaryButton
                    theme={theme}
                    label={otpCtaLabel}
                    icon="paper-plane-outline"
                    disabled={connectLoading || otpLoading || otpResendLoading}
                    onPress={() => {
                      void continueWithPhone();
                    }}
                  />
                </>
              ) : (
                <>
                  <Text style={[onboardingStyles.eyebrowCentered, { color: theme.accent }]}>Code eingeben</Text>
                  <OtpBoxRow
                    theme={theme}
                    value={otpCode}
                    onPress={() => {
                      otpInputRef.current?.focus?.();
                    }}
                  />
                  <TextInput
                    ref={otpInputRef}
                    style={onboardingStyles.hiddenOtpInput}
                    value={otpCode}
                    onChangeText={(value) => setOtpCode(String(value || '').replace(/\D+/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    autoCorrect={false}
                    autoCapitalize="none"
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                  <Text style={[onboardingStyles.otpMeta, { color: theme.textMuted }]}>
                    Code an {patientPhone || '+43 000 000000'} gesendet
                  </Text>

                  <PrimaryButton
                    theme={theme}
                    label={otpCtaLabel}
                    icon="checkmark-circle-outline"
                    disabled={connectLoading || otpLoading || otpResendLoading}
                    onPress={() => {
                      void continueWithPhone();
                    }}
                  />

                  <Pressable
                    disabled={otpLoading || otpResendLoading || otpCountdown > 0}
                    onPress={() => {
                      void resendOtpCode();
                    }}
                    style={({ pressed }) => [
                      onboardingStyles.inlineTextButton,
                      buttonPressedStyle(pressed && !(otpLoading || otpResendLoading || otpCountdown > 0)),
                    ]}
                  >
                    <Text
                      style={[
                        onboardingStyles.inlineTextButtonText,
                        { color: otpCountdown > 0 ? theme.textMuted : theme.accent },
                      ]}
                    >
                      {otpResendLabel}
                    </Text>
                  </Pressable>
                  {!!otpExpiresAt && (
                    <Text style={[onboardingStyles.otpExpiry, { color: theme.textMuted }]}>
                      Gültig bis {formatClock(otpExpiresAt)}.
                    </Text>
                  )}
                </>
              )}

              {!!otpUiMessage && (
                <View
                  style={[
                    onboardingStyles.messageBox,
                    {
                      backgroundColor:
                        otpUiType === 'error'
                          ? 'rgba(184,106,93,0.12)'
                          : otpUiType === 'success'
                            ? 'rgba(81,163,123,0.12)'
                            : theme.surfaceAlt,
                      borderColor:
                        otpUiType === 'error'
                          ? 'rgba(184,106,93,0.28)'
                          : otpUiType === 'success'
                            ? 'rgba(81,163,123,0.28)'
                            : theme.border,
                    },
                  ]}
                >
                  <Text style={[onboardingStyles.messageText, { color: theme.text }]}>{otpUiMessage}</Text>
                </View>
              )}

              <View style={onboardingStyles.authAuxStack}>
                <SecondaryButton
                  theme={theme}
                  label="Als Gast fortfahren"
                  icon="person-outline"
                  onPress={() => {
                    void continueAsGuest();
                  }}
                />
                <SecondaryButton
                  theme={theme}
                  label="Zurück zur Kliniksuche"
                  icon="arrow-back-outline"
                  onPress={() => {
                    resetOtpFlow();
                    setOnboardingStep('clinic');
                  }}
                />
              </View>
            </View>
          </>
        )}

        <View style={onboardingStyles.footer}>
          <Pressable
            onPress={() => {
              void continueOfflineDemo();
            }}
            style={({ pressed }) => [onboardingStyles.footerLink, buttonPressedStyle(pressed)]}
          >
            <Ionicons name="cloud-offline-outline" size={15} color={theme.textMuted} />
            <Text style={[onboardingStyles.footerLinkText, { color: theme.textMuted }]}>
              Offline-Demo ohne Backend starten
            </Text>
          </Pressable>

          {allowTechnicalSetup && (
            <>
              <Pressable
                onPress={() => setShowTechnicalSetup((prev) => !prev)}
                style={({ pressed }) => [onboardingStyles.footerLink, buttonPressedStyle(pressed)]}
              >
                <Ionicons name="construct-outline" size={15} color={theme.textMuted} />
                <Text style={[onboardingStyles.footerLinkText, { color: theme.textMuted }]}>
                  {showTechnicalSetup ? 'Technische Einstellungen ausblenden' : 'Technische Einstellungen'}
                </Text>
              </Pressable>

              {showTechnicalSetup && (
                <View style={[onboardingStyles.technicalPanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Text style={[onboardingStyles.technicalLabel, { color: theme.accent }]}>
                    {needsBackendProvisioning ? 'Interne Backend-Einrichtung' : 'Backend-URL'}
                  </Text>
                  <View style={[onboardingStyles.inputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                    <Ionicons name="server-outline" size={18} color={theme.accent} style={onboardingStyles.inputIcon} />
                    <TextInput
                      style={[onboardingStyles.input, { color: theme.text }]}
                      value={onboardingBaseUrl}
                      onChangeText={setOnboardingBaseUrl}
                      placeholder="https://www.curabo.app"
                      placeholderTextColor={theme.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                      inputAccessoryViewID={inputAccessoryViewID}
                    />
                  </View>
                  <SecondaryButton
                    theme={theme}
                    label={backendCheckLoading ? 'Backend wird geprüft ...' : 'Backend prüfen'}
                    icon="pulse-outline"
                    disabled={backendCheckLoading}
                    onPress={() => {
                      void runBackendHealthCheck();
                    }}
                  />
                  {!!backendCheckMessage && (
                    <Text style={[onboardingStyles.technicalHint, { color: theme.textMuted }]}>{backendCheckMessage}</Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={[onboardingStyles.keyboardBar, { backgroundColor: theme.keyboardBar, borderTopColor: theme.border }]}>
            <View style={[onboardingStyles.keyboardHandle, { backgroundColor: theme.keyboardHandle }]} />
            <Pressable
              onPress={Keyboard.dismiss}
              style={({ pressed }) => [
                onboardingStyles.keyboardDismiss,
                { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong },
                buttonPressedStyle(pressed),
              ]}
            >
              <Text style={[onboardingStyles.keyboardDismissText, { color: theme.primaryButtonText }]}>
                Tastatur schließen
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const onboardingStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 32,
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2.2,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '300',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 280,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 26,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    minHeight: 56,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  searchClear: {
    padding: 4,
    marginLeft: 8,
  },
  contentArea: {
    paddingHorizontal: 24,
  },
  resultsSection: {
    marginBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  eyebrowCentered: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 18,
    textAlign: 'center',
  },
  clinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  clinicLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clinicCopy: {
    flex: 1,
  },
  clinicName: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '600',
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  clinicMeta: {
    fontSize: 13,
    lineHeight: 17,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
  divider: {
    height: 1,
    marginVertical: 26,
  },
  referralSection: {
    gap: 14,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 14,
  },
  phoneInputShell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  selectedClinicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  selectedClinicLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedClinicValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  authHeader: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 30,
    alignItems: 'center',
  },
  authClinicMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  authTitleWrap: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  authBackButton: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authClinicName: {
    fontSize: 25,
    lineHeight: 30,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '400',
    marginBottom: 6,
    textAlign: 'center',
  },
  authClinicBody: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  authContent: {
    paddingHorizontal: 24,
    gap: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 0,
  },
  phonePrefix: {
    minWidth: 74,
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxText: {
    fontSize: 24,
    fontWeight: '600',
  },
  otpMeta: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: -2,
  },
  otpExpiry: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: -10,
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  inlineTextButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  inlineTextButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  authAuxStack: {
    gap: 10,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 28,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  footerLinkText: {
    fontSize: 12,
    lineHeight: 16,
  },
  technicalPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginTop: 2,
  },
  technicalLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  technicalHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  keyboardBar: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  keyboardHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  keyboardDismiss: {
    minHeight: 42,
    minWidth: 190,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardDismissText: {
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
