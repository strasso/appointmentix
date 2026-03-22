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
import { THEME } from '../theme/tokens';

const ONBOARDING_KEYBOARD_ACCESSORY_ID = 'curabo-onboarding-keyboard';

function ActionButton({ styles, label, onPress, disabled, variant = 'primary', icon }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.onboardingActionButton,
        variant === 'primary' ? styles.onboardingActionPrimary : styles.onboardingActionSecondary,
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
            color={variant === 'primary' ? '#0A0A0C' : '#E7D8C5'}
          />
        )}
        <Text
          style={[
            styles.onboardingActionText,
            variant === 'primary'
              ? styles.onboardingActionTextPrimary
              : styles.onboardingActionTextSecondary,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ClinicResultCard({ styles, clinic, isSelected, onPress, isLast }) {
  const clinicName = String(clinic?.name || '').trim() || 'MedSpa';
  const clinicMeta = [clinic?.city, clinic?.website].filter(Boolean).join(' • ') || 'Klinikprofil';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.onboardingClinicCard,
        isSelected && styles.onboardingClinicCardSelected,
        isLast && styles.onboardingClinicCardLast,
        pressed && styles.onboardingClinicCardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.onboardingClinicLogo}>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'business-outline'}
          size={18}
          color={isSelected ? '#E7D5B1' : '#C8A97E'}
        />
      </View>
      <View style={styles.onboardingClinicText}>
        <Text style={styles.onboardingClinicName}>{clinicName}</Text>
        <Text style={styles.onboardingClinicMeta}>{clinicMeta}</Text>
      </View>
      <Text style={styles.onboardingClinicAction}>{isSelected ? 'Aktiv' : 'Wählen'}</Text>
    </Pressable>
  );
}

export default function OnboardingScreen({
  styles,
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
  const inputAccessoryViewID = Platform.OS === 'ios' ? ONBOARDING_KEYBOARD_ACCESSORY_ID : undefined;

  return (
    <SafeAreaView style={styles.onboardingSafeArea}>
      <StatusBar style="light" />
      <View style={styles.onboardingContainer}>
        <View pointerEvents="none" style={styles.onboardingBackdrop}>
          <View style={styles.onboardingBackdropBase} />
          <Animated.View
            style={[
              styles.onboardingBackdropBeam,
              {
                transform: [{ translateX: liquidShineAnim }],
              },
            ]}
          />
          <View style={styles.onboardingBackdropGlowTop} />
          <View style={styles.onboardingBackdropGlowBottom} />
        </View>

        <ScrollView
          contentContainerStyle={styles.onboardingScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.onboardingStageHeader}>
            <View style={styles.onboardingBrandRow}>
              <View style={styles.onboardingBrandMark}>
                <View style={styles.onboardingBrandCore} />
              </View>
              <View style={styles.onboardingBrandTextWrap}>
                <Text style={styles.onboardingBrandText}>CURABO</Text>
                <Text style={styles.onboardingBrandSubtext}>Patient Experience Platform</Text>
              </View>
              <View style={styles.onboardingStepBadge}>
                <Text style={styles.onboardingStepBadgeText}>
                  {onboardingStep === 'clinic' ? 'Schritt 1' : 'Schritt 2'}
                </Text>
              </View>
            </View>

            <Text style={styles.onboardingStageEyebrow}>
              {onboardingStep === 'clinic' ? 'Klinik auswählen' : 'Zugang bestätigen'}
            </Text>
            <Text style={styles.onboardingStageTitle}>
              {onboardingStep === 'clinic' ? 'Willkommen bei Curabo' : (selectedClinicName || 'Klinikzugang')}
            </Text>
            <Text style={styles.onboardingStageBody}>
              {onboardingStep === 'clinic'
                ? 'Suche deine Klinik nach Name oder Stadt, wähle sie aus und gehe anschließend direkt in deinen persönlichen Curabo-Bereich.'
                : 'Bestätige deine Telefonnummer per SMS oder fahre als Gast fort. Deine Klinik, Treatments und Vorteile bleiben danach direkt verfügbar.'}
            </Text>
          </View>

          <View style={styles.onboardingPanelDark}>
            <View pointerEvents="none" style={styles.onboardingPanelEdge} />
            <View pointerEvents="none" style={styles.onboardingPanelAccent} />

            {allowTechnicalSetup && (
              <Pressable
                style={({ pressed }) => [
                  styles.onboardingUtilityToggle,
                  pressed && styles.onboardingActionPressed,
                ]}
                onPress={() => setShowTechnicalSetup((prev) => !prev)}
              >
                <View style={styles.onboardingUtilityToggleContent}>
                  <Ionicons name="construct-outline" size={16} color="#C8A97E" />
                  <Text style={styles.onboardingUtilityToggleText}>
                    {showTechnicalSetup ? 'Technische Einstellungen ausblenden' : 'Technische Einstellungen'}
                  </Text>
                </View>
                <Ionicons
                  name={showTechnicalSetup ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#8F8579"
                />
              </Pressable>
            )}

            {allowTechnicalSetup && showTechnicalSetup && (
              <View style={styles.onboardingTechnicalBox}>
                <Text style={styles.onboardingFieldLabel}>
                  {needsBackendProvisioning ? 'Interne Backend-Einrichtung' : 'Backend-URL'}
                </Text>
                <View style={styles.onboardingInputShell}>
                  <Ionicons name="server-outline" size={18} color="#C8A97E" style={styles.onboardingInputIcon} />
                  <TextInput
                    style={styles.onboardingInput}
                    value={onboardingBaseUrl}
                    onChangeText={setOnboardingBaseUrl}
                    placeholder="https://www.curabo.app"
                    placeholderTextColor="#6F6962"
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
                  label={backendCheckLoading ? 'Backend wird geprüft ...' : 'Backend prüfen'}
                  onPress={() => {
                    void runBackendHealthCheck();
                  }}
                  disabled={backendCheckLoading}
                  variant="secondary"
                  icon="pulse-outline"
                />
                {!!backendCheckMessage && (
                  <Text style={styles.onboardingTechnicalHint}>{backendCheckMessage}</Text>
                )}
              </View>
            )}

            {onboardingStep === 'clinic' && (
              <View style={styles.onboardingSection}>
                <View style={styles.onboardingSectionHead}>
                  <Text style={styles.onboardingSectionEyebrow}>Schritt 1</Text>
                  <Text style={styles.onboardingSectionTitle}>Deine Klinik finden</Text>
                </View>

                <View style={styles.onboardingInputShell}>
                  <Ionicons name="search-outline" size={18} color="#C8A97E" style={styles.onboardingInputIcon} />
                  <TextInput
                    style={styles.onboardingInput}
                    value={clinicSearchQuery}
                    onChangeText={onClinicSearchChange}
                    onFocus={onClinicSearchFocus}
                    placeholder="Klinikname oder Stadt"
                    placeholderTextColor="#6F6962"
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={onClinicSearchSubmit}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
                  label={clinicSearchLoading ? 'Kliniken werden geladen ...' : 'Kliniken anzeigen'}
                  onPress={onClinicSearchSubmit}
                  disabled={clinicSearchLoading}
                  variant="secondary"
                  icon="search-outline"
                />

                {clinicDropdownOpen && clinicSuggestionResults.length > 0 && (
                  <View style={styles.onboardingClinicResults}>
                    <Text style={styles.onboardingMiniLabel}>Empfohlene Treffer</Text>
                    {clinicSuggestionResults.map((clinic, index) => {
                      const clinicName = String(clinic?.name || '').trim();
                      const isSelected = clinicName && clinicName === selectedClinicName;
                      return (
                        <ClinicResultCard
                          key={clinicName || `clinic-${index}`}
                          styles={styles}
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
                  <View style={styles.onboardingEmptyState}>
                    <Ionicons name="search-outline" size={18} color="#8F8579" />
                    <Text style={styles.onboardingEmptyText}>
                      Keine passende Klinik gefunden. Bitte prüfe deine Eingabe oder versuche es mit einem Referral-Code.
                    </Text>
                  </View>
                )}

                <View style={styles.onboardingDivider} />

                <Text style={styles.onboardingFieldLabel}>QR- oder Referral-Code</Text>
                <View style={styles.onboardingInputShell}>
                  <Ionicons name="ticket-outline" size={18} color="#C8A97E" style={styles.onboardingInputIcon} />
                  <TextInput
                    style={styles.onboardingInput}
                    value={scanCodeValue}
                    onChangeText={setScanCodeValue}
                    placeholder="Code eingeben"
                    placeholderTextColor="#6F6962"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
                  label="Code verwenden"
                  onPress={() => {
                    void useQrOrReferralCode();
                  }}
                  variant="secondary"
                  icon="qr-code-outline"
                />

                <View style={styles.onboardingSummaryRow}>
                  <Text style={styles.onboardingSummaryLabel}>Ausgewählte Klinik</Text>
                  <Text style={styles.onboardingSummaryValue}>
                    {selectedClinicName || 'Noch nicht ausgewählt'}
                  </Text>
                </View>

                <ActionButton
                  styles={styles}
                  label="Weiter"
                  onPress={continueToAccessStep}
                  variant="primary"
                  icon="arrow-forward-outline"
                />
              </View>
            )}

            {onboardingStep === 'access' && (
              <View style={styles.onboardingSection}>
                <View style={styles.onboardingSectionHead}>
                  <Text style={styles.onboardingSectionEyebrow}>Schritt 2</Text>
                  <Text style={styles.onboardingSectionTitle}>Zugang zur Klinik</Text>
                </View>

                <View style={styles.onboardingSelectedClinicBanner}>
                  <View style={styles.onboardingSelectedClinicIcon}>
                    <Ionicons name="business-outline" size={18} color="#C8A97E" />
                  </View>
                  <View style={styles.onboardingSelectedClinicText}>
                    <Text style={styles.onboardingSelectedClinicLabel}>Verbunden mit</Text>
                    <Text style={styles.onboardingSelectedClinicName}>
                      {selectedClinicName || 'Deiner Klinik'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.onboardingFieldLabel}>Telefonnummer</Text>
                <View style={styles.onboardingInputShell}>
                  <Ionicons name="call-outline" size={18} color="#C8A97E" style={styles.onboardingInputIcon} />
                  <TextInput
                    style={styles.onboardingInput}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    placeholder="+43 660 1234567"
                    placeholderTextColor="#6F6962"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    inputAccessoryViewID={inputAccessoryViewID}
                  />
                </View>

                <ActionButton
                  styles={styles}
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
                      otpUiType === 'error' && styles.onboardingMessageError,
                      otpUiType === 'warning' && styles.onboardingMessageWarning,
                      otpUiType === 'success' && styles.onboardingMessageSuccess,
                    ]}
                  >
                    <Text style={styles.onboardingMessageText}>{otpUiMessage}</Text>
                  </View>
                )}

                {otpReadyToVerify && (
                  <View style={styles.onboardingOtpCard}>
                    <Text style={styles.onboardingMiniLabel}>SMS-Code</Text>
                    <Text style={styles.onboardingOtpHint}>
                      {selectedPhone
                        ? `Code für ${selectedPhone} eingeben.`
                        : 'Bitte gib den gesendeten Code ein.'}
                    </Text>
                    <View style={styles.onboardingInputShell}>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#C8A97E" style={styles.onboardingInputIcon} />
                      <TextInput
                        style={styles.onboardingInput}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        placeholder="6-stelligen Code eingeben"
                        placeholderTextColor="#6F6962"
                        keyboardType="number-pad"
                        autoCorrect={false}
                        autoCapitalize="none"
                        inputAccessoryViewID={inputAccessoryViewID}
                      />
                    </View>
                    {!!otpExpiresAt && (
                      <Text style={styles.onboardingOtpExpiry}>
                        Gültig bis {formatClock(otpExpiresAt)}.
                      </Text>
                    )}
                    <ActionButton
                      styles={styles}
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
                    label="Als Gast fortfahren"
                    onPress={() => {
                      void continueAsGuest();
                    }}
                    variant="secondary"
                    icon="person-outline"
                  />

                  <ActionButton
                    styles={styles}
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
              <Ionicons name="cloud-offline-outline" size={15} color="#8F8579" />
              <Text style={styles.onboardingDemoLinkText}>Offline-Demo ohne Backend starten</Text>
            </Pressable>
          </View>
        </ScrollView>

        {Platform.OS === 'ios' && (
          <InputAccessoryView nativeID={ONBOARDING_KEYBOARD_ACCESSORY_ID}>
            <View style={styles.onboardingKeyboardAccessory}>
              <View style={styles.onboardingKeyboardAccessoryHandle} />
              <Pressable
                style={({ pressed }) => [
                  styles.onboardingKeyboardAccessoryButton,
                  pressed && styles.mowgliLiftSoft,
                ]}
                onPress={Keyboard.dismiss}
              >
                <Text style={styles.onboardingKeyboardAccessoryButtonText}>Tastatur schließen</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        )}
      </View>
    </SafeAreaView>
  );
}
