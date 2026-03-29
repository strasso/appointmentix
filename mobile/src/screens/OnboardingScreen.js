import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createMowgliTheme } from '../theme/tokens';

const ONBOARDING_KEYBOARD_ACCESSORY_ID = 'curabo-onboarding-keyboard';

function ActionButton({ styles, theme, label, onPress, disabled, variant = 'primary', icon }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.onboardingActionButton,
        variant === 'primary' ? styles.onboardingActionPrimary : styles.onboardingActionSecondary,
        {
          backgroundColor: variant === 'primary' ? theme.primaryButtonBg : theme.secondaryButtonBg,
          borderColor: variant === 'primary' ? theme.borderStrong : theme.secondaryButtonBorder,
        },
        disabled && styles.ctaDisabled,
        pressed && !disabled && styles.onboardingActionPressed,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={styles.onboardingActionContent}>
        {!!icon && (
          <Ionicons
            name={icon}
            size={17}
            color={variant === 'primary' ? theme.primaryButtonText : theme.secondaryButtonText}
          />
        )}
        <Text
          style={[
            styles.onboardingActionText,
            variant === 'primary'
              ? styles.onboardingActionTextPrimary
              : styles.onboardingActionTextSecondary,
            { color: variant === 'primary' ? theme.primaryButtonText : theme.secondaryButtonText },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ClinicResultCard({ styles, theme, clinic, isSelected, onPress, isLast }) {
  const clinicName = String(clinic?.name || '').trim() || 'MedSpa';
  const clinicMeta = [clinic?.city, clinic?.website].filter(Boolean).join(' • ') || 'Klinikprofil';
  const clinicAccent = String(clinic?.accentColor || clinic?.brandColor || theme.accent).trim() || theme.accent;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.onboardingClinicCard,
        isSelected && styles.onboardingClinicCardSelected,
        isLast && styles.onboardingClinicCardLast,
        {
          backgroundColor: isSelected ? theme.accentSurface : theme.surfaceAlt,
          borderColor: isSelected ? theme.accentBorderStrong : theme.border,
        },
        pressed && styles.onboardingClinicCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.onboardingClinicLogo, { backgroundColor: isSelected ? theme.accentSurface : theme.input, borderColor: isSelected ? theme.accentBorderStrong : theme.border }]}>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'business-outline'}
          size={18}
          color={isSelected ? theme.accent : clinicAccent}
        />
      </View>
      <View style={styles.onboardingClinicText}>
        <Text style={[styles.onboardingClinicName, { color: theme.text }]}>{clinicName}</Text>
        <Text style={[styles.onboardingClinicMeta, { color: theme.textMuted }]}>{clinicMeta}</Text>
      </View>
      <View style={[styles.onboardingClinicSwatch, { backgroundColor: clinicAccent, borderColor: isSelected ? theme.accentBorderStrong : theme.border }]} />
    </Pressable>
  );
}

export default function OnboardingScreen({
  styles,
  mowgliTheme,
  liquidShineAnim,
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
  const selectedClinicName = String(clinicLookupName || '').trim();
  const showNoResults = clinicDropdownOpen
    && String(clinicSearchQuery || '').trim().length > 0
    && !clinicSearchLoading
    && clinicSuggestionResults.length === 0;
  const selectedPhone = String(patientPhone || '').trim();
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const inputAccessoryViewID = Platform.OS === 'ios' ? ONBOARDING_KEYBOARD_ACCESSORY_ID : undefined;

  return (
    <SafeAreaView style={[styles.onboardingSafeArea, { backgroundColor: theme.page }]}>
      <StatusBar style={theme.mode === 'light' ? 'dark' : 'light'} />
      <View style={[styles.onboardingContainer, { backgroundColor: theme.page }]}>
        <View pointerEvents="none" style={styles.onboardingBackdrop}>
          <View style={[styles.onboardingBackdropBase, { backgroundColor: theme.page }]} />
          <Animated.View
            style={[
              styles.onboardingBackdropBeam,
              { backgroundColor: theme.heroGlow },
              {
                transform: [{ translateX: liquidShineAnim }],
              },
            ]}
          />
          <View style={[styles.onboardingBackdropGlowTop, { backgroundColor: theme.heroGlow }]} />
          <View style={[styles.onboardingBackdropGlowBottom, { backgroundColor: theme.heroGlow }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.onboardingScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.onboardingStageHeader}>
            <View style={[styles.onboardingBrandRow, { justifyContent: 'center', marginBottom: 18 }]}>
              <Ionicons name="sparkles-outline" size={16} color={theme.accent} />
              <Text style={[styles.onboardingBrandText, { color: theme.accent }]}>CURABO</Text>
            </View>

            <Text style={[styles.onboardingStageEyebrow, { color: theme.accent, textAlign: 'center' }]}>
              {onboardingStep === 'clinic' ? 'Klinik auswählen' : 'Zugang bestätigen'}
            </Text>
            <Text style={[styles.onboardingStageTitle, { color: theme.text, textAlign: 'center' }]}>
              {onboardingStep === 'clinic' ? 'Willkommen' : (selectedClinicName || 'Klinikzugang')}
            </Text>
            <Text style={[styles.onboardingStageBody, { color: theme.textSoft, textAlign: 'center', alignSelf: 'center' }]}>
              {onboardingStep === 'clinic'
                ? 'Wähle deine Klinik aus und starte in eine ruhige, klinikspezifische Experience mit eigenem Branding, Treatments und Wissen.'
                : 'Bestätige deine Telefonnummer per SMS oder fahre als Gast fort. Danach öffnet sich direkt dein persönlicher Klinikbereich.'}
            </Text>
            <View style={[styles.onboardingStepBadge, { borderColor: theme.accentBorder, backgroundColor: theme.accentSurface, alignSelf: 'center', marginTop: 18 }]}>
              <Text style={[styles.onboardingStepBadgeText, { color: theme.accent }]}>
                {onboardingStep === 'clinic' ? 'Schritt 1 von 2' : 'Schritt 2 von 2'}
              </Text>
            </View>
          </View>

          <View style={[styles.onboardingPanelDark, { backgroundColor: theme.shell, borderColor: theme.border }]}>
            <View pointerEvents="none" style={styles.onboardingPanelEdge} />
            <View pointerEvents="none" style={[styles.onboardingPanelAccent, { backgroundColor: theme.heroGlow }]} />

            {allowTechnicalSetup && (
              <Pressable
                style={({ pressed }) => [
                  styles.onboardingUtilityToggle,
                  pressed && styles.onboardingActionPressed,
                ]}
                onPress={() => setShowTechnicalSetup((prev) => !prev)}
              >
                <View style={styles.onboardingUtilityToggleContent}>
                  <Ionicons name="construct-outline" size={16} color={theme.accent} />
                  <Text style={[styles.onboardingUtilityToggleText, { color: theme.textSoft }]}>
                    {showTechnicalSetup ? 'Technische Einstellungen ausblenden' : 'Technische Einstellungen'}
                  </Text>
                </View>
                <Ionicons
                  name={showTechnicalSetup ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.textMuted}
                />
              </Pressable>
            )}

            {allowTechnicalSetup && showTechnicalSetup && (
              <View style={[styles.onboardingTechnicalBox, { backgroundColor: theme.shellAlt, borderColor: theme.border }]}>
                <Text style={[styles.onboardingFieldLabel, { color: theme.accent }]}>
                  {needsBackendProvisioning ? 'Interne Backend-Einrichtung' : 'Backend-URL'}
                </Text>
                <View style={[styles.onboardingInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Ionicons name="server-outline" size={18} color={theme.accent} style={styles.onboardingInputIcon} />
                  <TextInput
                    style={[styles.onboardingInput, { color: theme.text }]}
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
                <ActionButton
                  styles={styles}
                  theme={theme}
                  label={backendCheckLoading ? 'Backend wird geprüft ...' : 'Backend prüfen'}
                  onPress={() => {
                    void runBackendHealthCheck();
                  }}
                  disabled={backendCheckLoading}
                  variant="secondary"
                  icon="pulse-outline"
                />
                {!!backendCheckMessage && (
                  <Text style={[styles.onboardingTechnicalHint, { color: theme.textSoft }]}>{backendCheckMessage}</Text>
                )}
              </View>
            )}

            {onboardingStep === 'clinic' && (
              <View style={styles.onboardingSection}>
                <View style={styles.onboardingSectionHead}>
                  <Text style={[styles.onboardingSectionEyebrow, { color: theme.textMuted }]}>Schritt 1</Text>
                  <Text style={[styles.onboardingSectionTitle, { color: theme.text }]}>Deine Klinik finden</Text>
                </View>

                <View style={[styles.onboardingInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Ionicons name="search-outline" size={18} color={theme.accent} style={styles.onboardingInputIcon} />
                  <TextInput
                    style={[styles.onboardingInput, { color: theme.text }]}
                    value={clinicSearchQuery}
                    onChangeText={onClinicSearchChange}
                    onFocus={onClinicSearchFocus}
                    placeholder="Klinikname oder Stadt"
                    placeholderTextColor={theme.textMuted}
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={onClinicSearchSubmit}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
                  theme={theme}
                  label={clinicSearchLoading ? 'Kliniken werden geladen ...' : 'Kliniken anzeigen'}
                  onPress={onClinicSearchSubmit}
                  disabled={clinicSearchLoading}
                  variant="secondary"
                  icon="search-outline"
                />

                {clinicDropdownOpen && clinicSuggestionResults.length > 0 && (
                  <View style={styles.onboardingClinicResults}>
                    <Text style={[styles.onboardingMiniLabel, { color: theme.textMuted }]}>Empfohlene Treffer</Text>
                    {clinicSuggestionResults.map((clinic, index) => {
                      const clinicName = String(clinic?.name || '').trim();
                      const isSelected = clinicName && clinicName === selectedClinicName;
                      return (
                        <ClinicResultCard
                          key={clinicName || `clinic-${index}`}
                          styles={styles}
                          theme={theme}
                          clinic={clinic}
                          isSelected={isSelected}
                          isLast={index === clinicSuggestionResults.length - 1}
                          onPress={() => selectClinicFromSearch(clinic)}
                        />
                      );
                    })}
                  </View>
                )}

                {showNoResults && (
                  <View style={[styles.onboardingEmptyState, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                    <Ionicons name="search-outline" size={18} color={theme.textMuted} />
                    <Text style={[styles.onboardingEmptyText, { color: theme.textMuted }]}>
                      Keine passende Klinik gefunden. Bitte prüfe deine Eingabe oder versuche es mit einem Referral-Code.
                    </Text>
                  </View>
                )}

                <View style={[styles.onboardingDivider, { backgroundColor: theme.border, marginVertical: 8 }]} />

                <Text style={[styles.onboardingFieldLabel, { color: theme.accent }]}>QR- oder Referral-Code</Text>
                <View style={[styles.onboardingInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Ionicons name="ticket-outline" size={18} color={theme.accent} style={styles.onboardingInputIcon} />
                  <TextInput
                    style={[styles.onboardingInput, { color: theme.text }]}
                    value={scanCodeValue}
                    onChangeText={setScanCodeValue}
                    placeholder="Code eingeben"
                    placeholderTextColor={theme.textMuted}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
                  theme={theme}
                  label="Code verwenden"
                  onPress={() => {
                    void useQrOrReferralCode();
                  }}
                  variant="secondary"
                  icon="qr-code-outline"
                />

                <View style={styles.onboardingSummaryRow}>
                  <Text style={[styles.onboardingSummaryLabel, { color: theme.textMuted }]}>Ausgewählte Klinik</Text>
                  <Text style={[styles.onboardingSummaryValue, { color: theme.text }]}>
                    {selectedClinicName || 'Noch nicht ausgewählt'}
                  </Text>
                </View>

                <ActionButton
                  styles={styles}
                  theme={theme}
                  label="Weiter"
                  onPress={continueToAccessStep}
                  variant="primary"
                  icon="arrow-forward-outline"
                />
              </View>
            )}

            {onboardingStep === 'access' && (
              <View style={styles.onboardingSection}>
                <View style={[styles.onboardingSectionHead, { alignItems: 'center', marginBottom: 6 }]}>
                  <View style={[styles.onboardingSelectedClinicIcon, { backgroundColor: theme.input, borderColor: theme.border, width: 58, height: 58, borderRadius: 29, marginBottom: 12 }]}>
                    <Ionicons name="business-outline" size={18} color={theme.accent} />
                  </View>
                  <Text style={[styles.onboardingSectionEyebrow, { color: theme.textMuted, marginBottom: 4 }]}>Verbunden mit</Text>
                  <Text style={[styles.onboardingSectionTitle, { color: theme.text, textAlign: 'center' }]}>
                    {selectedClinicName || 'Deiner Klinik'}
                  </Text>
                  <Text style={[styles.onboardingStageBody, { color: theme.textSoft, textAlign: 'center', fontSize: 13, lineHeight: 20 }]}>
                    Bestätige jetzt deine Nummer, damit Memberships, Rewards und persönliche Inhalte freigeschaltet werden.
                  </Text>
                </View>

                <Text style={[styles.onboardingFieldLabel, { color: theme.accent }]}>Telefonnummer</Text>
                <View style={[styles.onboardingInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Ionicons name="call-outline" size={18} color={theme.accent} style={styles.onboardingInputIcon} />
                  <TextInput
                    style={[styles.onboardingInput, { color: theme.text }]}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    placeholder="+43 660 1234567"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
                  theme={theme}
                  label={otpCtaLabel}
                  onPress={() => {
                    void continueWithPhone();
                  }}
                  disabled={connectLoading || otpLoading || otpResendLoading}
                  variant="primary"
                  icon={otpReadyToVerify ? 'checkmark-circle-outline' : 'paper-plane-outline'}
                />

                {!!otpUiMessage && (
                  <View
                    style={[
                      styles.onboardingMessageBox,
                      {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: theme.border,
                      },
                      otpUiType === 'error' && styles.onboardingMessageError,
                      otpUiType === 'warning' && styles.onboardingMessageWarning,
                      otpUiType === 'success' && styles.onboardingMessageSuccess,
                    ]}
                  >
                    <Text style={[styles.onboardingMessageText, { color: theme.text }]}>{otpUiMessage}</Text>
                  </View>
                )}

                {otpReadyToVerify && (
                  <View style={[styles.onboardingOtpCard, { backgroundColor: theme.shellAlt, borderColor: theme.border }]}>
                    <Text style={[styles.onboardingMiniLabel, { color: theme.textMuted }]}>SMS-Code</Text>
                    <Text style={[styles.onboardingOtpHint, { color: theme.textSoft }]}>
                      {selectedPhone
                        ? `Code für ${selectedPhone} eingeben.`
                        : 'Bitte gib den gesendeten Code ein.'}
                    </Text>
                    <View style={[styles.onboardingInputShell, { backgroundColor: theme.input, borderColor: theme.border }]}>
                      <Ionicons name="shield-checkmark-outline" size={18} color={theme.accent} style={styles.onboardingInputIcon} />
                      <TextInput
                        style={[styles.onboardingInput, { color: theme.text }]}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        placeholder="6-stelligen Code eingeben"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="number-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                        inputAccessoryViewID={inputAccessoryViewID}
                      />
                    </View>
                    {!!otpExpiresAt && (
                      <Text style={[styles.onboardingOtpExpiry, { color: theme.textMuted }]}>
                        Gültig bis {formatClock(otpExpiresAt)}.
                      </Text>
                    )}
                    <ActionButton
                      styles={styles}
                      theme={theme}
                      label={otpResendLabel}
                      onPress={() => {
                        void resendOtpCode();
                      }}
                      disabled={otpLoading || otpResendLoading || otpCountdown > 0}
                      variant="secondary"
                      icon="refresh-outline"
                    />
                  </View>
                )}

                <View style={styles.onboardingAuxActions}>
                  <ActionButton
                    styles={styles}
                    theme={theme}
                    label="Als Gast fortfahren"
                    onPress={() => {
                      void continueAsGuest();
                    }}
                    variant="secondary"
                    icon="person-outline"
                  />

                  <ActionButton
                    styles={styles}
                    theme={theme}
                    label="Zurück zur Kliniksuche"
                    onPress={() => {
                      resetOtpFlow();
                      setOnboardingStep('clinic');
                    }}
                    variant="secondary"
                    icon="arrow-back-outline"
                  />
                </View>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.onboardingDemoLink,
                pressed && styles.onboardingActionPressed,
              ]}
              onPress={() => {
                void continueOfflineDemo();
              }}
            >
              <Ionicons name="cloud-offline-outline" size={15} color={theme.textMuted} />
              <Text style={[styles.onboardingDemoLinkText, { color: theme.textMuted }]}>Offline-Demo ohne Backend starten</Text>
            </Pressable>
          </View>
        </ScrollView>

        {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID={ONBOARDING_KEYBOARD_ACCESSORY_ID}>
            <View style={[styles.onboardingKeyboardAccessory, { backgroundColor: theme.keyboardBar, borderTopColor: theme.border }]}>
              <View style={[styles.onboardingKeyboardAccessoryHandle, { backgroundColor: theme.keyboardHandle }]} />
              <Pressable
                style={({ pressed }) => [
                  styles.onboardingKeyboardAccessoryButton,
                  {
                    backgroundColor: theme.primaryButtonBg,
                    borderColor: theme.borderStrong,
                  },
                  pressed && styles.mowgliLiftSoft,
                ]}
                onPress={Keyboard.dismiss}
              >
                <Text style={[styles.onboardingKeyboardAccessoryButtonText, { color: theme.primaryButtonText }]}>Tastatur schließen</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        )}
      </View>
    </SafeAreaView>
  );
}
