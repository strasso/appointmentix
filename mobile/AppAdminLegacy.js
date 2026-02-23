import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_TOKEN_KEY = 'appointmentix_auth_token';
const STORAGE_API_URL_KEY = 'appointmentix_api_url';
const DEFAULT_API_URL = 'http://localhost:4173';

const DESIGN_PRESETS = ['clean', 'bold', 'minimal'];

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }

  return `https://${trimmed}`.replace(/\/+$/, '');
}

function normalizeMaybeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return normalizeUrl(trimmed);
}

function toIsoDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('de-DE');
  } catch {
    return '-';
  }
}

function formatPrice(amountCents, currency) {
  if (typeof amountCents !== 'number') return '-';
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: String(currency || 'EUR').toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} EUR`;
  }
}

function mapSubscriptionStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'Aktiv';
  if (normalized === 'trialing') return 'Testphase';
  if (normalized === 'past_due') return 'Überfällig';
  if (normalized === 'canceled') return 'Gekündigt';
  if (normalized === 'incomplete') return 'Unvollständig';
  return 'Inaktiv';
}

function isPlaceholderCalendly(url) {
  const normalized = String(url || '').toLowerCase();
  return !normalized || ['dein-name', 'your-name', 'example'].some((value) => normalized.includes(value));
}

async function apiRequest(baseUrl, path, options = {}) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  if (!safeBaseUrl) {
    throw new Error('Bitte zuerst eine gültige API-URL speichern.');
  }

  const method = options.method || 'GET';
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const requestInit = {
    method,
    headers,
  };

  if (Object.prototype.hasOwnProperty.call(options, 'body')) {
    headers['Content-Type'] = 'application/json';
    requestInit.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${safeBaseUrl}${path}`, requestInit);
  } catch {
    throw new Error('Backend nicht erreichbar. Nutze auf dem Handy die lokale IP deines Macs (nicht localhost).');
  }

  const rawText = await response.text();
  let payload = {};

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message = payload.error || `Serverfehler (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles.buttonPrimary,
        (pressed || disabled) && styles.buttonPrimaryPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonPrimaryText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles.buttonSecondary,
        (pressed || disabled) && styles.buttonSecondaryPressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonSecondaryText}>{title}</Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder, autoCapitalize = 'none', keyboardType = 'default', secureTextEntry = false }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8f7b66"
        style={styles.input}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_URL);
  const [apiInput, setApiInput] = useState(DEFAULT_API_URL);

  const [authMode, setAuthMode] = useState('login');
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerFullName, setRegisterFullName] = useState('');
  const [registerClinicName, setRegisterClinicName] = useState('');

  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [publicConfig, setPublicConfig] = useState(null);

  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [storedApiUrl, storedToken] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_API_URL_KEY),
          SecureStore.getItemAsync(STORAGE_TOKEN_KEY),
        ]);

        const normalizedApi = normalizeUrl(storedApiUrl || DEFAULT_API_URL);
        if (mounted) {
          setApiBaseUrl(normalizedApi);
          setApiInput(normalizedApi);
        }

        if (storedToken) {
          if (mounted) setToken(storedToken);
          try {
            await hydrateDashboard(storedToken, normalizedApi, mounted);
          } catch {
            await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
            if (mounted) {
              setToken('');
              setUser(null);
            }
          }
        }
      } finally {
        if (mounted) setBooting(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function hydrateDashboard(activeToken, activeBaseUrl, mounted = true) {
    setLoadingDashboard(true);
    try {
      const [meResponse, settingsResponse, billingResponse, configResponse] = await Promise.all([
        apiRequest(activeBaseUrl, '/api/auth/me', { token: activeToken }),
        apiRequest(activeBaseUrl, '/api/clinic/settings', { token: activeToken }),
        apiRequest(activeBaseUrl, '/api/billing/status', { token: activeToken }),
        apiRequest(activeBaseUrl, '/api/config/public'),
      ]);

      if (!mounted) return;

      const nextUser = meResponse.user || null;
      const nextSettings = settingsResponse.settings || null;
      setUser(nextUser);
      setSettings(nextSettings);
      setSettingsDraft(nextSettings ? { ...nextSettings } : null);
      setSubscription(billingResponse.subscription || null);
      setPublicConfig(configResponse || null);
    } finally {
      if (mounted) setLoadingDashboard(false);
    }
  }

  async function persistApiUrl() {
    const normalized = normalizeUrl(apiInput);
    if (!normalized) {
      setFeedback('Bitte gib eine gültige API-URL ein.');
      return;
    }

    await SecureStore.setItemAsync(STORAGE_API_URL_KEY, normalized);
    setApiBaseUrl(normalized);
    setApiInput(normalized);
    setFeedback(`API-URL gespeichert: ${normalized}`);

    if (token) {
      try {
        await hydrateDashboard(token, normalized);
      } catch (error) {
        setFeedback(error.message);
      }
    }
  }

  async function submitAuth() {
    const normalizedApi = normalizeUrl(apiInput || apiBaseUrl);
    if (!normalizedApi) {
      setFeedback('Bitte zuerst API-URL eintragen.');
      return;
    }

    setLoadingAuth(true);
    setFeedback('');

    try {
      if (normalizedApi !== apiBaseUrl) {
        setApiBaseUrl(normalizedApi);
        await SecureStore.setItemAsync(STORAGE_API_URL_KEY, normalizedApi);
      }

      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'register'
        ? {
            fullName: registerFullName.trim(),
            clinicName: registerClinicName.trim(),
            email: loginEmail.trim().toLowerCase(),
            password: loginPassword,
          }
        : {
            email: loginEmail.trim().toLowerCase(),
            password: loginPassword,
          };

      const response = await apiRequest(normalizedApi, endpoint, {
        method: 'POST',
        body: payload,
      });

      const nextToken = response.token;
      if (!nextToken) {
        throw new Error('Token fehlt in der Antwort.');
      }

      await SecureStore.setItemAsync(STORAGE_TOKEN_KEY, nextToken);
      setToken(nextToken);
      await hydrateDashboard(nextToken, normalizedApi);

      setFeedback(authMode === 'register' ? 'Account erstellt und eingeloggt.' : 'Login erfolgreich.');
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function saveClinicSettings() {
    if (!settingsDraft) return;

    setSavingSettings(true);
    setFeedback('');

    try {
      const payload = {
        clinicName: String(settingsDraft.clinicName || '').trim(),
        website: normalizeMaybeUrl(settingsDraft.website),
        logoUrl: normalizeMaybeUrl(settingsDraft.logoUrl),
        brandColor: String(settingsDraft.brandColor || '').trim(),
        accentColor: String(settingsDraft.accentColor || '').trim(),
        fontFamily: String(settingsDraft.fontFamily || '').trim(),
        designPreset: String(settingsDraft.designPreset || 'clean').trim(),
        calendlyUrl: normalizeMaybeUrl(settingsDraft.calendlyUrl),
      };

      const response = await apiRequest(apiBaseUrl, '/api/clinic/settings', {
        method: 'PUT',
        token,
        body: payload,
      });

      const nextSettings = response.settings || null;
      setSettings(nextSettings);
      setSettingsDraft(nextSettings ? { ...nextSettings } : null);
      setFeedback('Klinik-Einstellungen gespeichert.');
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setSavingSettings(false);
    }
  }

  async function startCheckout() {
    try {
      const response = await apiRequest(apiBaseUrl, '/api/billing/create-checkout-session', {
        method: 'POST',
        token,
        body: {},
      });

      const checkoutUrl = response.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error('Keine Checkout-URL erhalten.');
      }

      await Linking.openURL(checkoutUrl);
    } catch (error) {
      Alert.alert('Checkout Fehler', error.message);
    }
  }

  async function openCalendly() {
    const fromSettings = settings?.calendlyUrl;
    const fromPublic = publicConfig?.calendlyUrl;
    const target = normalizeMaybeUrl(fromSettings || fromPublic || '');

    if (!target || isPlaceholderCalendly(target)) {
      Alert.alert('Calendly fehlt', 'Bitte zuerst einen echten Calendly-Link in den Einstellungen setzen.');
      return;
    }

    await Linking.openURL(target);
  }

  async function refreshDashboard() {
    if (!token) return;
    try {
      await hydrateDashboard(token, apiBaseUrl);
      setFeedback('Daten aktualisiert.');
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function logout() {
    try {
      if (token) {
        await apiRequest(apiBaseUrl, '/api/auth/logout', {
          method: 'POST',
          token,
        });
      }
    } catch {
      // no-op
    }

    await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
    setToken('');
    setUser(null);
    setSettings(null);
    setSettingsDraft(null);
    setSubscription(null);
    setPublicConfig(null);
    setFeedback('Abgemeldet.');
  }

  const monthlyPrice = useMemo(() => {
    const configuredAmountEur = Number(publicConfig?.appointmentixMonthlyAmountEur);
    if (Number.isFinite(configuredAmountEur) && configuredAmountEur > 0) {
      return formatPrice(Math.round(configuredAmountEur * 100), 'eur');
    }
    if (!subscription) return '-';
    return formatPrice(subscription.amountCents, subscription.currency);
  }, [subscription, publicConfig]);

  if (booting) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8a5a2f" />
        <Text style={styles.loadingText}>Appointmentix lädt ...</Text>
      </SafeAreaView>
    );
  }

  const authenticated = Boolean(token && user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>APPOINTMENTIX</Text>
        <Text style={styles.headline}>White-Label Klinik App</Text>

        <View style={styles.card}>
          <SectionTitle>Backend Verbindung</SectionTitle>
          <Field
            label="API URL"
            value={apiInput}
            onChangeText={setApiInput}
            placeholder="http://192.168.x.x:4173"
            autoCapitalize="none"
          />
          <PrimaryButton title="API URL speichern" onPress={persistApiUrl} />
          <Text style={styles.helpText}>
            Auf dem Handy nutze die lokale IP deines Macs, nicht localhost.
          </Text>
        </View>

        {!authenticated && (
          <View style={styles.card}>
            <SectionTitle>{authMode === 'login' ? 'Login' : 'Registrierung'}</SectionTitle>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setAuthMode('login')}
                style={[styles.modeChip, authMode === 'login' && styles.modeChipActive]}
              >
                <Text style={[styles.modeChipText, authMode === 'login' && styles.modeChipTextActive]}>Login</Text>
              </Pressable>
              <Pressable
                onPress={() => setAuthMode('register')}
                style={[styles.modeChip, authMode === 'register' && styles.modeChipActive]}
              >
                <Text style={[styles.modeChipText, authMode === 'register' && styles.modeChipTextActive]}>Registrieren</Text>
              </Pressable>
            </View>

            {authMode === 'register' && (
              <>
                <Field
                  label="Vollständiger Name"
                  value={registerFullName}
                  onChangeText={setRegisterFullName}
                  placeholder="Max Mustermann"
                  autoCapitalize="words"
                />
                <Field
                  label="Klinikname"
                  value={registerClinicName}
                  onChangeText={setRegisterClinicName}
                  placeholder="Musterklinik"
                  autoCapitalize="words"
                />
              </>
            )}

            <Field
              label="E-Mail"
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="du@klinik.de"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field
              label="Passwort"
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="Mindestens 8 Zeichen"
              secureTextEntry
            />

            <PrimaryButton
              title={loadingAuth ? 'Bitte warten ...' : authMode === 'register' ? 'Account erstellen' : 'Einloggen'}
              onPress={submitAuth}
              disabled={loadingAuth}
            />
          </View>
        )}

        {authenticated && (
          <>
            <View style={styles.card}>
              <SectionTitle>Dashboard</SectionTitle>
              <Text style={styles.kpiMain}>{user?.clinicName || '-'}</Text>
              <Text style={styles.muted}>{user?.email || '-'}</Text>
              <View style={styles.badgesRow}>
                <Text style={styles.badge}>Abo: {mapSubscriptionStatus(subscription?.status)}</Text>
                <Text style={styles.badge}>Preis: {monthlyPrice}</Text>
              </View>
              <Text style={styles.muted}>Nächste Periode: {toIsoDate(subscription?.currentPeriodEnd)}</Text>
              <View style={styles.buttonRow}>
                <SecondaryButton title="Aktualisieren" onPress={refreshDashboard} />
                <SecondaryButton title="Abmelden" onPress={logout} />
              </View>
            </View>

            <View style={styles.card}>
              <SectionTitle>Klinik Branding</SectionTitle>
              <Field
                label="Klinikname"
                value={settingsDraft?.clinicName || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), clinicName: next }))}
                placeholder="Klinikname"
                autoCapitalize="words"
              />
              <Field
                label="Website"
                value={settingsDraft?.website || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), website: next }))}
                placeholder="https://deine-klinik.de"
                autoCapitalize="none"
              />
              <Field
                label="Logo URL"
                value={settingsDraft?.logoUrl || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), logoUrl: next }))}
                placeholder="https://.../logo.png"
                autoCapitalize="none"
              />
              <Field
                label="Brand Color (Hex)"
                value={settingsDraft?.brandColor || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), brandColor: next }))}
                placeholder="#8A5A2F"
                autoCapitalize="characters"
              />
              <Field
                label="Accent Color (Hex)"
                value={settingsDraft?.accentColor || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), accentColor: next }))}
                placeholder="#EB6C13"
                autoCapitalize="characters"
              />
              <Field
                label="Calendly URL"
                value={settingsDraft?.calendlyUrl || ''}
                onChangeText={(next) => setSettingsDraft((prev) => ({ ...(prev || {}), calendlyUrl: next }))}
                placeholder="https://calendly.com/dein-link"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Design Preset</Text>
              <View style={styles.modeRow}>
                {DESIGN_PRESETS.map((preset) => {
                  const active = (settingsDraft?.designPreset || 'clean') === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => setSettingsDraft((prev) => ({ ...(prev || {}), designPreset: preset }))}
                      style={[styles.modeChip, active && styles.modeChipActive]}
                    >
                      <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>{preset}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <PrimaryButton
                title={savingSettings ? 'Speichert ...' : 'Einstellungen speichern'}
                onPress={saveClinicSettings}
                disabled={savingSettings}
              />
            </View>

            <View style={styles.card}>
              <SectionTitle>Aktionen</SectionTitle>
              <View style={styles.buttonRowVertical}>
                <PrimaryButton title="Termin-Link (Calendly) öffnen" onPress={openCalendly} />
                <SecondaryButton title="Stripe Abo starten / ändern" onPress={startCheckout} />
              </View>
            </View>

            <View style={[styles.card, styles.previewCard]}>
              <SectionTitle>Live Vorschau</SectionTitle>
              <View
                style={[
                  styles.previewBlock,
                  {
                    backgroundColor: settingsDraft?.brandColor || '#8A5A2F',
                  },
                ]}
              >
                <Text style={styles.previewTitle}>Patienten-App Karte</Text>
                <Text style={styles.previewSub}>Branding für {settingsDraft?.clinicName || 'deine Klinik'}</Text>
                <View
                  style={[
                    styles.previewButton,
                    { backgroundColor: settingsDraft?.accentColor || '#EB6C13' },
                  ]}
                >
                  <Text style={styles.previewButtonText}>Jetzt Termin buchen</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1e7d7',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
    backgroundColor: '#f1e7d7',
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#f1e7d7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#5f4833',
    fontSize: 15,
  },
  brand: {
    marginTop: 10,
    fontSize: 12,
    letterSpacing: 2,
    color: '#7c6249',
    fontWeight: '700',
  },
  headline: {
    fontSize: 30,
    lineHeight: 34,
    color: '#2f2218',
    fontWeight: '800',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff8ee',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2d2bc',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: '#2f2218',
    fontWeight: '700',
  },
  fieldWrap: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#5f4833',
    fontWeight: '600',
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#d4c2aa',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#2f2218',
    backgroundColor: '#ffffff',
  },
  button: {
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  buttonPrimary: {
    backgroundColor: '#8a5a2f',
  },
  buttonPrimaryPressed: {
    opacity: 0.8,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: '#eddcc6',
  },
  buttonSecondaryPressed: {
    opacity: 0.8,
  },
  buttonSecondaryText: {
    color: '#3d2e21',
    fontSize: 14,
    fontWeight: '700',
  },
  helpText: {
    color: '#6b5541',
    fontSize: 12,
    lineHeight: 17,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeChip: {
    borderWidth: 1,
    borderColor: '#d3c1aa',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#f8efe2',
  },
  modeChipActive: {
    borderColor: '#8a5a2f',
    backgroundColor: '#8a5a2f',
  },
  modeChipText: {
    color: '#6a5440',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modeChipTextActive: {
    color: '#fff',
  },
  kpiMain: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2f2218',
  },
  muted: {
    color: '#6f5d4a',
    fontSize: 13,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#f0e0cb',
    color: '#4a3828',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  buttonRowVertical: {
    gap: 8,
  },
  previewCard: {
    marginBottom: 6,
  },
  previewBlock: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  previewTitle: {
    color: '#fffdf8',
    fontSize: 18,
    fontWeight: '800',
  },
  previewSub: {
    color: '#f2e7dc',
    fontSize: 13,
  },
  previewButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  previewButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  feedback: {
    color: '#5e3b21',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
  },
});
