import React from 'react';
import { Animated, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AmbientBackground from '../components/AmbientBackground';
import { THEME } from '../theme/tokens';

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AmbientBackground styles={styles} />
        <ScrollView
          contentContainerStyle={styles.onboardingScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.onboardingHero}>
            <View pointerEvents="none" style={styles.onboardingHeroVisual}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.onboardingLiquidShine,
                  {
                    transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                  },
                ]}
              />
              <View style={styles.onboardingHeroGlass} />
              <View style={styles.onboardingHeroBubbleLarge} />
              <View style={styles.onboardingHeroBubbleSmall} />
            </View>
            <Text style={styles.onboardingHeroChip}>Curabo Patient App</Text>
            <Text style={styles.onboardingHeroTitle}>
              {onboardingStep === 'clinic' ? 'Finde deine MedSpa' : 'Ein ruhiger Zugang zu deiner Behandlung'}
            </Text>
            <Text style={styles.onboardingHeroBody}>
              {onboardingStep === 'clinic'
                ? 'Suche deine MedSpa nach Name oder nutze einen QR-/Referral-Code. Danach bleibt alles an einem Ort: Behandlungen, Vorteile und Mitgliedschaft.'
                : 'Bestätige deine Telefonnummer oder fahre als Gast fort. Alle weiteren Funktionen bleiben unverändert.'}
            </Text>
          </View>

          <View style={styles.onboardingCard}>
            <View pointerEvents="none" style={styles.cardChrome} />
            <View pointerEvents="none" style={styles.cardChromeSecondary} />
            <Text style={styles.onboardingEyebrow}>CURABO</Text>
            <Text style={styles.onboardingTitle}>
              {onboardingStep === 'clinic' ? 'Verbinde deine App' : 'Telefonnummer bestätigen'}
            </Text>
            <Text style={styles.onboardingBody}>
              {onboardingStep === 'clinic'
                ? 'Starte mit deiner Klinikverbindung und gehe dann direkt in die App.'
                : 'Melde dich mit Telefonnummer an oder fahre als Gast fort.'}
            </Text>

            {allowTechnicalSetup && (
              <Pressable
                style={[styles.secondaryCta, styles.techToggleCta]}
                onPress={() => setShowTechnicalSetup((prev) => !prev)}
              >
                <Text style={styles.secondaryCtaText}>
                  {showTechnicalSetup ? 'Technik ausblenden' : 'Technik / Backend (optional)'}
                </Text>
              </Pressable>
            )}

            {allowTechnicalSetup && showTechnicalSetup && (
              <View style={styles.inlineInfoBox}>
                <Text style={styles.inlineInfoTitle}>
                  {needsBackendProvisioning ? 'Technische Einrichtung (intern)' : 'Backend-URL (bei Netzwerkwechsel)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={onboardingBaseUrl}
                  onChangeText={setOnboardingBaseUrl}
                  placeholder="http://192.168.x.x:4173"
                  placeholderTextColor={THEME.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Pressable
                  style={[styles.secondaryCta, backendCheckLoading && styles.ctaDisabled]}
                  disabled={backendCheckLoading}
                  onPress={() => {
                    void runBackendHealthCheck();
                  }}
                >
                  <Text style={styles.secondaryCtaText}>
                    {backendCheckLoading ? 'Teste Backend ...' : 'Backend testen'}
                  </Text>
                </Pressable>
              </View>
            )}

            {onboardingStep === 'clinic' && (
              <View>
                <Text style={styles.sectionSubTitle}>MedSpa suchen</Text>
                <TextInput
                  style={styles.input}
                  value={clinicSearchQuery}
                  onChangeText={onClinicSearchChange}
                  onFocus={onClinicSearchFocus}
                  placeholder="MedSpa Name eingeben"
                  placeholderTextColor={THEME.muted}
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={onClinicSearchSubmit}
                />
                <Pressable
                  style={[styles.secondaryCta, clinicSearchLoading && styles.ctaDisabled]}
                  disabled={clinicSearchLoading}
                  onPress={onClinicSearchSubmit}
                >
                  <Text style={styles.secondaryCtaText}>
                    {clinicSearchLoading ? 'Suche läuft ...' : 'MedSpa suchen'}
                  </Text>
                </Pressable>

                {clinicDropdownOpen && clinicSuggestionResults.length > 0 && (
                  <View style={styles.searchResultsCard}>
                    <ScrollView
                      style={styles.searchResultsScroll}
                      contentContainerStyle={styles.searchResultsScrollContent}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                    >
                      {clinicSuggestionResults.map((clinic, index) => {
                        const clinicName = String(clinic?.name || '').trim();
                        const isSelected = clinicName && clinicName === String(clinicLookupName || '').trim();
                        const isLast = index === clinicSuggestionResults.length - 1;
                        return (
                          <Pressable
                            key={clinicName || `clinic-${index}`}
                            style={[styles.searchResultRow, isLast && styles.searchResultRowLast]}
                            onPress={() => selectClinicFromSearch(clinic)}
                          >
                            <View style={styles.searchResultMain}>
                              <Text style={styles.searchResultName}>{clinicName || 'MedSpa'}</Text>
                              <Text style={styles.searchResultMeta}>
                                {[clinic?.city, clinic?.website].filter(Boolean).join(' • ') || 'MedSpa-Profil'}
                              </Text>
                            </View>
                            <Text style={styles.searchSelectLabel}>{isSelected ? 'Ausgewählt' : 'Wählen'}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
                {clinicDropdownOpen && String(clinicSearchQuery || '').trim().length > 0 && !clinicSearchLoading && clinicSuggestionResults.length === 0 && (
                  <View style={styles.searchResultsCard}>
                    <Text style={styles.searchEmptyText}>Keine MedSpa-Treffer. Bitte Eingabe anpassen.</Text>
                  </View>
                )}

                <Text style={styles.sectionSubTitle}>QR-/Referral-Code</Text>
                <TextInput
                  style={styles.input}
                  value={scanCodeValue}
                  onChangeText={setScanCodeValue}
                  placeholder="Code eingeben oder aus QR übernehmen"
                  placeholderTextColor={THEME.muted}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.secondaryCta}
                  onPress={() => {
                    void useQrOrReferralCode();
                  }}
                >
                  <Text style={styles.secondaryCtaText}>Code verwenden</Text>
                </Pressable>

                <Text style={styles.analyticsStatus}>
                  Ausgewählte MedSpa: {clinicLookupName || 'Noch nicht ausgewählt'}
                </Text>

                <Pressable style={styles.primaryCta} onPress={continueToAccessStep}>
                  <Text style={styles.primaryCtaText}>Weiter</Text>
                </Pressable>
              </View>
            )}

            {onboardingStep === 'access' && (
              <View>
                <Text style={styles.sectionSubTitle}>Telefonnummer</Text>
                <TextInput
                  style={styles.input}
                  value={patientPhone}
                  onChangeText={setPatientPhone}
                  placeholder="+43 660 1234567"
                  placeholderTextColor={THEME.muted}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
                <Pressable
                  style={[styles.primaryCta, (connectLoading || otpLoading || otpResendLoading) && styles.ctaDisabled]}
                  disabled={connectLoading || otpLoading || otpResendLoading}
                  onPress={() => {
                    void continueWithPhone();
                  }}
                >
                  <Text style={styles.primaryCtaText}>{otpCtaLabel}</Text>
                </Pressable>

                {!!otpUiMessage && (
                  <Text
                    style={[
                      styles.otpUiMessage,
                      otpUiType === 'error' && styles.otpUiError,
                      otpUiType === 'warning' && styles.otpUiWarning,
                      otpUiType === 'success' && styles.otpUiSuccess,
                    ]}
                  >
                    {otpUiMessage}
                  </Text>
                )}

                {otpReadyToVerify && (
                  <View style={styles.otpCard}>
                    <Text style={styles.otpTitle}>SMS-Code</Text>
                    <TextInput
                      style={styles.input}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      placeholder="6-stelligen Code eingeben"
                      placeholderTextColor={THEME.muted}
                      keyboardType="number-pad"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    {!!otpExpiresAt && (
                      <Text style={styles.otpHint}>
                        Code gültig bis {formatClock(otpExpiresAt)}.
                      </Text>
                    )}
                    <Pressable
                      style={[styles.secondaryCta, (otpLoading || otpResendLoading || otpCountdown > 0) && styles.ctaDisabled]}
                      disabled={otpLoading || otpResendLoading || otpCountdown > 0}
                      onPress={() => {
                        void resendOtpCode();
                      }}
                    >
                      <Text style={styles.secondaryCtaText}>{otpResendLabel}</Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  style={styles.secondaryCta}
                  onPress={() => {
                    void continueAsGuest();
                  }}
                >
                  <Text style={styles.secondaryCtaText}>Als Gast fortfahren</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryCta}
                  onPress={() => {
                    resetOtpFlow();
                    setOnboardingStep('clinic');
                  }}
                >
                  <Text style={styles.secondaryCtaText}>Zurück zur MedSpa-Suche</Text>
                </Pressable>
              </View>
            )}

            {!!backendCheckMessage && onboardingStep === 'clinic' && (
              <Text style={styles.diagnosticText}>{backendCheckMessage}</Text>
            )}

            <Pressable
              style={styles.secondaryCta}
              onPress={() => {
                void continueOfflineDemo();
              }}
            >
              <Text style={styles.secondaryCtaText}>Offline-Demo ohne Backend</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
