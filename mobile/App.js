import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const THEME = {
  background: '#FFFFFF',
  backgroundSoft: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#F1FAFF',
  surfaceMuted: '#DDEFFC',
  ink: '#0E2146',
  inkSoft: '#2D4E77',
  muted: '#5B789A',
  mutedSoft: '#89A8C8',
  brand: '#F18BCF',
  brandStrong: '#D152AE',
  brandSoft: '#FDEAF8',
  accent: '#47C4EA',
  accentSoft: '#E3FAFF',
  good: '#28B97D',
  border: '#CEE0F0',
  borderStrong: '#BBD6EA',
  overlay: 'rgba(27, 49, 83, 0.26)',
  rewardsA: '#84E3F5',
  rewardsB: '#377EE0',
};

const SOFT_CARD_SHADOW = {
  shadowColor: '#275189',
  shadowOpacity: 0.12,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 14 },
  elevation: 7,
};

const UI_FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'System',
});

const SURFACE_RAISED = 'rgba(255,255,255,0.98)';
const SURFACE_PANEL = 'rgba(255,255,255,0.94)';
const SURFACE_SOFT = 'rgba(255,255,255,0.90)';
const SURFACE_TINT = 'rgba(247,252,255,0.95)';
const BORDER_TINT = 'rgba(208,225,240,0.98)';
const BORDER_LIGHT = 'rgba(223,233,244,0.98)';

const CLINIC = {
  name: 'Moser Milani Medical Spa',
  shortName: 'MOMI',
  address: 'Schottengasse 7, 1010 Wien',
  openingHours: 'Mo - Sa, 09:00 - 17:00',
  phone: '+43 1 236 13 36',
  city: 'Wien',
  latitude: 48.210888,
  longitude: 16.367784,
};

const DEFAULT_MAP_REGION = {
  latitude: 48.2082,
  longitude: 16.3738,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

const LOCAL_MEDSPA_DIRECTORY = [
  {
    id: 'local-moser-milani',
    name: 'Moser Milani Medical Spa',
    city: 'Wien',
    website: 'https://milani.at',
    logoUrl: '',
    brandColor: '#16A34A',
    accentColor: '#EB6C13',
    latitude: 48.210888,
    longitude: 16.367784,
  },
  {
    id: 'local-muster',
    name: 'Musterklinik',
    city: 'Wien',
    website: '',
    logoUrl: '',
    brandColor: THEME.brand,
    accentColor: THEME.accent,
    latitude: DEFAULT_MAP_REGION.latitude,
    longitude: DEFAULT_MAP_REGION.longitude,
  },
];

// White-label defaults for patient app (optional):
// If set, the app loads clinic bundle automatically on first launch.
const APP_PRODUCTION_BACKEND_URL = 'https://www.curabo.app';
const APP_DEFAULT_BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL || APP_PRODUCTION_BACKEND_URL;
const APP_FALLBACK_BACKEND_URLS = [
  process.env.EXPO_PUBLIC_API_BASE_URL_FALLBACK || '',
  process.env.EXPO_PUBLIC_API_BASE_URL_ALT || '',
  APP_PRODUCTION_BACKEND_URL,
  'https://curabo.app',
];
const APP_DEFAULT_CLINIC_NAME = process.env.EXPO_PUBLIC_DEFAULT_CLINIC_NAME || '';
const MOBILE_OTP_COOLDOWN_SECONDS_FALLBACK = 30;
const TECHNICAL_SETUP_VISIBLE_BY_DEFAULT = String(process.env.EXPO_PUBLIC_SHOW_TECHNICAL_SETUP || '').toLowerCase() === 'true';
const ALLOW_TECHNICAL_SETUP = TECHNICAL_SETUP_VISIBLE_BY_DEFAULT;
const PREFER_PUBLIC_BACKENDS_OVERRIDE = String(process.env.EXPO_PUBLIC_PREFER_PUBLIC_BACKEND || '').trim().toLowerCase();
const PREFER_PUBLIC_BACKENDS_DEFAULT = PREFER_PUBLIC_BACKENDS_OVERRIDE
  ? PREFER_PUBLIC_BACKENDS_OVERRIDE === 'true'
  : !__DEV__;
const OTP_REQUEST_TIMEOUT_MS = 15000;
const OTP_VERIFY_TIMEOUT_MS = 18000;
const OTP_RETRY_COUNT = 1;
const CHECKOUT_METHOD_OPTIONS = [
  { id: 'card', label: 'Karte / Apple Pay' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'klarna', label: 'Klarna' },
];

function checkoutMethodLabel(methodId) {
  const candidate = String(methodId || '').trim().toLowerCase();
  const match = CHECKOUT_METHOD_OPTIONS.find((item) => item.id === candidate);
  return match?.label || CHECKOUT_METHOD_OPTIONS[0].label;
}

function checkoutDefaultPaymentStatus(methodId) {
  return String(methodId || '').trim().toLowerCase() === 'klarna' ? 'pending' : 'paid';
}

const HOME_ARTICLES = [
  {
    id: 'art-1',
    title: 'Warum juckt meine Kopfhaut?',
    body: 'Trockene Kopfhaut kann auf Irritationen oder fehlende Feuchtigkeit hinweisen. Unsere PRP + Mesohair-Kombi unterstützt die Regeneration.',
    tag: 'Education',
  },
  {
    id: 'art-2',
    title: 'Botox natürlich einsetzen',
    body: 'Der Fokus liegt auf frischem Ausdruck statt maskenhaftem Ergebnis. Unser Team plant die Dosis individuell je Mimikzone.',
    tag: 'Ästhetik',
  },
];

const MEMBERSHIPS = [
  {
    id: 'silber',
    name: 'MOMI Silber',
    priceCents: 7900,
    perks: [
      '1x Basic Glow pro Monat inklusive',
      '10% Rabatt auf Zusatzbehandlungen',
      'Priorisierte Termin-Slots',
      'Frühzugang zu Aktionen',
    ],
    includedTreatmentIds: ['t-basic-glow'],
  },
  {
    id: 'gold',
    name: 'MOMI Gold',
    priceCents: 14900,
    perks: [
      '1x Premium-Treatment bis 190 EUR/Monat',
      '15% Rabatt auf Zusatzbehandlungen',
      'VIP-Support + Terminpriorität',
      'Exklusive Quartals-Events',
    ],
    includedTreatmentIds: ['t-microdermabrasion', 't-med-peeling'],
  },
];

const TREATMENT_CATEGORIES = [
  { id: 'gesicht', label: 'Gesicht' },
  { id: 'haare', label: 'Haare' },
  { id: 'koerper', label: 'Körper' },
  { id: 'injectables', label: 'Injectables' },
  { id: 'premium', label: 'Premium' },
];

const CATEGORY_META = {
  gesicht: {
    icon: '◔',
    description: 'Frische, ebenmäßige Haut mit sichtbarem Glow.',
  },
  haare: {
    icon: '〰',
    description: 'Glatte Haut und starke Kopfhaut mit medizinischer Technologie.',
  },
  koerper: {
    icon: '◍',
    description: 'Kontur, Straffung und Cellulite-Verbesserung für den Körper.',
  },
  injectables: {
    icon: '✦',
    description: 'Gezielte Injektionsbehandlungen für natürliche Ergebnisse.',
  },
  premium: {
    icon: '◇',
    description: 'High-End Gerätebehandlungen mit maximaler Wirkung.',
  },
};

const TREATMENTS = [
  {
    id: 't-basic-glow',
    name: 'Basic Glow',
    category: 'gesicht',
    priceCents: 11000,
    memberPriceCents: 0,
    durationMinutes: 60,
    description:
      'Intensive Zellregeneration für jede Lebensphase. Ideal als monatlicher Fresh-up Termin.',
  },
  {
    id: 't-microdermabrasion',
    name: 'Mikrodermabrasion',
    category: 'gesicht',
    priceCents: 13000,
    memberPriceCents: 9900,
    durationMinutes: 60,
    description:
      'Medizinisches Peeling zur Verfeinerung der Hautstruktur und verbesserten Wirkstoffaufnahme.',
  },
  {
    id: 't-med-peeling',
    name: 'Medizinisches Peeling',
    category: 'gesicht',
    priceCents: 19000,
    memberPriceCents: 16150,
    durationMinutes: 50,
    description:
      'Fruchtsäure- und Wirkstoffkonzept bei Akne, Pigmenten und ersten Fältchen.',
  },
  {
    id: 't-microneedling',
    name: 'Microneedling',
    category: 'gesicht',
    priceCents: 32500,
    memberPriceCents: 27625,
    durationMinutes: 60,
    description:
      'Gezielte Kollagenstimulation mit medizinischer Nadeltiefe für glattere Haut.',
  },
  {
    id: 't-clear-brilliant',
    name: 'Clear + Brilliant Laser',
    category: 'premium',
    priceCents: 59000,
    memberPriceCents: 53100,
    durationMinutes: 45,
    description:
      'Schonende Laserbehandlung für Hautbild, Poren und Glow ohne lange Ausfallzeit.',
  },
  {
    id: 't-fraxel',
    name: 'Fraxel Dual Laser',
    category: 'premium',
    priceCents: 75000,
    memberPriceCents: 67500,
    durationMinutes: 60,
    description:
      'Regenerative Laserimpulse für Narben, Sonnenschäden und feine Linien.',
  },
  {
    id: 't-laser-hair',
    name: 'Laser-Haarentfernung',
    category: 'haare',
    priceCents: 9000,
    memberPriceCents: 7650,
    durationMinutes: 30,
    description:
      'Soprano ICE Technologie für nahezu schmerzfreie dauerhafte Haarentfernung.',
  },
  {
    id: 't-prp',
    name: 'PRP Mesohair',
    category: 'haare',
    priceCents: 68000,
    memberPriceCents: 61200,
    durationMinutes: 60,
    description:
      'Eigenplasma-Behandlung zur Stärkung von Haarwurzel und Kopfhaut.',
  },
  {
    id: 't-botox',
    name: 'Botox Gesicht',
    category: 'injectables',
    priceCents: 36000,
    memberPriceCents: 32400,
    durationMinutes: 30,
    description:
      'Mimische Falten glätten und frischen Ausdruck bewahren, ohne starren Look.',
  },
  {
    id: 't-lippen',
    name: 'Hyaluron Lippen',
    category: 'injectables',
    priceCents: 58000,
    memberPriceCents: 52200,
    durationMinutes: 45,
    description:
      'Kontur, Feuchtigkeit und Volumen für ein natürlich harmonisches Lippenbild.',
  },
  {
    id: 't-thermage-face',
    name: 'Thermage Gesicht + Hals',
    category: 'premium',
    priceCents: 390000,
    memberPriceCents: 370500,
    durationMinutes: 75,
    description:
      'Nicht-invasive Radiofrequenz für Straffung und Kollagenaufbau ohne Operation.',
  },
  {
    id: 't-cellulite-awt',
    name: 'Cellulite AWT',
    category: 'koerper',
    priceCents: 9000,
    memberPriceCents: 8100,
    durationMinutes: 30,
    description:
      'Akustische Wellentherapie zur Verbesserung der Hautstruktur bei Cellulite.',
  },
];

const REWARD_ACTIONS = [
  { id: 'referral', label: 'Freund:in werben', points: 150 },
  { id: 'review', label: 'Google-Bewertung abgeben', points: 120 },
  { id: 'story', label: 'Vorher/Nachher-Freigabe', points: 180 },
];

const REWARD_REDEEMS = [
  { id: 'r15', label: '15 EUR Guthaben', requiredPoints: 250, valueCents: 1500 },
  { id: 'r35', label: '35 EUR Guthaben', requiredPoints: 500, valueCents: 3500 },
  { id: 'r80', label: '80 EUR Guthaben', requiredPoints: 1000, valueCents: 8000 },
];

const STORAGE_KEYS = {
  analyticsBaseUrl: 'appointmentix.analyticsBaseUrl',
  clinicName: 'appointmentix.clinicName',
  clinicId: 'appointmentix.clinicId',
  settingsName: 'appointmentix.settingsName',
  settingsEmail: 'appointmentix.settingsEmail',
  patientPhone: 'appointmentix.patientPhone',
  patientGuestMode: 'appointmentix.patientGuestMode',
  onboardingDone: 'appointmentix.onboardingDone',
};

function tapFeedback(duration = 10) {
  Vibration.vibrate(duration);
}

async function readSecureValue(key) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return String(value || '');
  } catch {
    return '';
  }
}

async function writeSecureValue(key, value) {
  try {
    await SecureStore.setItemAsync(key, String(value ?? ''));
  } catch {
    // Ignore persistence errors in demo mode.
  }
}

function preferredTreatmentImage(treatment) {
  const primary = String(treatment?.imageUrl || '').trim();
  if (primary) return primary;
  const gallery = Array.isArray(treatment?.galleryUrls) ? treatment.galleryUrls : [];
  const firstGallery = String(gallery[0] || '').trim();
  return firstGallery;
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }
  const candidate = trimmed.replace(/\/+$/, '');
  const hostCandidate = candidate.split('/')[0].toLowerCase();
  const isPrivateLanHost =
    hostCandidate.startsWith('localhost') ||
    hostCandidate.startsWith('127.') ||
    hostCandidate.startsWith('10.') ||
    hostCandidate.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostCandidate);
  const scheme = isPrivateLanHost ? 'http' : 'https';
  return `${scheme}://${candidate}`.replace(/\/+$/, '');
}

function isPrivateNetworkBaseUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return false;
  let host = '';
  try {
    host = new URL(normalized).hostname.toLowerCase();
  } catch {
    host = normalized.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
  }
  return (
    host === 'localhost'
    || host.startsWith('127.')
    || host.startsWith('10.')
    || host.startsWith('192.168.')
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function resolveApiCandidates(...values) {
  const seen = new Set();
  const candidates = [];
  for (const value of [...values, ...APP_FALLBACK_BACKEND_URLS]) {
    const normalized = normalizeUrl(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    candidates.push(normalized);
  }
  return candidates;
}

function prioritizeApiCandidates(candidates, options = {}) {
  const list = Array.isArray(candidates) ? candidates : [];
  const preferPublic = options.preferPublic === true;
  if (!preferPublic) return list;
  return [
    ...list.filter((item) => !isPrivateNetworkBaseUrl(item)),
    ...list.filter((item) => isPrivateNetworkBaseUrl(item)),
  ];
}

function resolveExpoBackendUrl() {
  const hostUriCandidate =
    String(
      Constants?.expoConfig?.hostUri
      || Constants?.manifest2?.extra?.expoGo?.debuggerHost
      || Constants?.manifest?.debuggerHost
      || ''
    ).trim();
  if (!hostUriCandidate) return '';

  const hostPart = hostUriCandidate
    .split(',')[0]
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .trim();

  if (!hostPart) return '';
  return normalizeUrl(`${hostPart}:4173`);
}

function normalizePhone(value) {
  return String(value || '')
    .trim()
    .replace(/[^\d+]/g, '');
}

function resolveCategoryMeta(categoryId, label = '') {
  const key = String(categoryId || '').trim().toLowerCase();
  const fallback = {
    icon: '◦',
    description: `Behandlungen für ${String(label || 'deine Auswahl').trim()}.`,
  };
  return CATEGORY_META[key] || fallback;
}

function resolveClinicNameFromQrOrCode(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower.startsWith('clinic:')) return raw.slice(7).trim();
  if (lower.startsWith('curabo://clinic/')) {
    return decodeURIComponent(raw.slice('curabo://clinic/'.length)).trim();
  }
  if (lower.startsWith('appointmentix://clinic/')) {
    return decodeURIComponent(raw.slice('appointmentix://clinic/'.length)).trim();
  }
  return raw;
}

function resolveClinicCoordinates(clinicLike) {
  const latitude = Number(clinicLike?.latitude);
  const longitude = Number(clinicLike?.longitude);
  if (
    Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180
  ) {
    return { latitude, longitude };
  }
  return {
    latitude: DEFAULT_MAP_REGION.latitude,
    longitude: DEFAULT_MAP_REGION.longitude,
  };
}

function buildLocalClinicFallbackResults(query, clinicProfile, clinicLookupName, clinicLookupId, baseUrl) {
  const needle = String(query || '').trim().toLowerCase();
  const candidatePool = [
    ...LOCAL_MEDSPA_DIRECTORY,
    {
      id: clinicLookupId || '',
      name: clinicLookupName || '',
      city: clinicProfile?.city || '',
      website: clinicProfile?.website || '',
      logoUrl: clinicProfile?.logoUrl || '',
      brandColor: clinicProfile?.brandColor || '',
      accentColor: clinicProfile?.accentColor || '',
      latitude: clinicProfile?.latitude,
      longitude: clinicProfile?.longitude,
    },
    {
      id: '',
      name: clinicProfile?.name || '',
      city: clinicProfile?.city || '',
      website: clinicProfile?.website || '',
      logoUrl: clinicProfile?.logoUrl || '',
      brandColor: clinicProfile?.brandColor || '',
      accentColor: clinicProfile?.accentColor || '',
      latitude: clinicProfile?.latitude,
      longitude: clinicProfile?.longitude,
    },
    {
      id: '',
      name: CLINIC.name,
      city: CLINIC.city,
      website: '',
      logoUrl: '',
      brandColor: THEME.brand,
      accentColor: THEME.accent,
      latitude: CLINIC.latitude,
      longitude: CLINIC.longitude,
    },
  ];

  const unique = [];
  const seen = new Set();
  for (const entry of candidatePool) {
    const name = String(entry?.name || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({
      ...entry,
      _sourceBaseUrl: normalizeUrl(baseUrl || '') || '',
    });
  }

  if (!needle) return unique;
  return unique.filter((entry) => String(entry?.name || '').toLowerCase().includes(needle));
}

function clinicMatchRank(name, query) {
  const safeName = String(name || '').trim().toLowerCase();
  const safeQuery = String(query || '').trim().toLowerCase();
  if (!safeQuery) return 0;
  if (safeName === safeQuery) return 0;
  if (safeName.startsWith(safeQuery)) return 1;
  if (safeName.includes(safeQuery)) return 2;
  return 3;
}

function absolutizeMediaUrl(baseUrl, rawUrl) {
  const safeBase = normalizeUrl(baseUrl);
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!safeBase) return value;
  if (value.startsWith('/')) return `${safeBase}${value}`;
  return `${safeBase}/${value}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (String(error?.name || '') === 'AbortError') {
      throw new Error(`Request timeout nach ${Math.round(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function shouldRetryRequest(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('network request failed')
    || message.includes('request timeout')
    || message.includes('timeout')
    || message.includes('failed to fetch')
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, config = {}) {
  const timeoutMs = Number(config.timeoutMs || 10000);
  const retries = Math.max(0, Number(config.retries ?? 0));
  const retryDelayMs = Math.max(0, Number(config.retryDelayMs || 450));

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < retries && shouldRetryRequest(error);
      if (!canRetry) break;
      await delay(retryDelayMs * (attempt + 1));
    }
  }
  throw lastError || new Error('Netzwerkfehler');
}

async function postPublicEvent(baseUrl, payload) {
  const response = await fetchWithRetry(`${baseUrl}/api/analytics/public-event`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });
  if (!response.ok) {
    const text = await response.text();
    let message = 'Event konnte nicht gesendet werden.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
}

function formatPrice(cents) {
  const amount = Number(cents || 0) / 100;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatClock(ts) {
  return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

async function fetchClinicBundle(baseUrl, clinicName, clinicId = '') {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const params = new URLSearchParams();
  const safeClinicName = String(clinicName || '').trim();
  const safeClinicId = String(clinicId || '').trim();
  if (safeClinicId) {
    params.set('clinicId', safeClinicId);
  }
  if (safeClinicName) {
    params.set('clinicName', safeClinicName);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/clinic-bundle${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'MedSpa-Daten konnten nicht geladen werden.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }

  return response.json();
}

async function fetchClinicSearch(baseUrl, query, limit = 10) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const safeQuery = String(query || '').trim();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 20));
  const endpoint = `${safeBaseUrl}/api/mobile/clinics/search?query=${encodeURIComponent(safeQuery)}&limit=${safeLimit}`;
  const response = await fetchWithRetry(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'MedSpa-Suche fehlgeschlagen.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json();
}

function parseJsonPayload(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function localizeClinicTerms(message) {
  const text = String(message || '').trim();
  if (!text) return text;
  return text
    .replace(/Klinikname/gi, 'MedSpa')
    .replace(/Klinik-Code/gi, 'MedSpa-Code')
    .replace(/Klinik-/gi, 'MedSpa-')
    .replace(/Klinik/gi, 'MedSpa');
}

function buildApiError(defaultMessage, statusCode, rawText) {
  const parsed = parseJsonPayload(rawText);
  let message = defaultMessage;
  if (parsed && typeof parsed === 'object') {
    const candidate = String(parsed.error || '').trim();
    if (candidate) {
      message = candidate;
    }
  } else if (rawText) {
    message = String(rawText).trim();
  }
  message = localizeClinicTerms(message);

  const error = new Error(message || defaultMessage);
  error.status = Number(statusCode || 0);
  error.errorCode = String(parsed?.errorCode || '').trim();
  const retryRaw = parsed?.retryAfterSeconds ?? parsed?.resendAfterSeconds;
  const retrySeconds = Number(retryRaw);
  if (Number.isFinite(retrySeconds) && retrySeconds > 0) {
    error.retryAfterSeconds = Math.max(1, Math.floor(retrySeconds));
  }
  if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'attemptsRemaining')) {
    const attemptsRemaining = Number(parsed.attemptsRemaining);
    if (Number.isFinite(attemptsRemaining)) {
      error.attemptsRemaining = attemptsRemaining;
    }
  }
  error.payload = parsed;
  return error;
}

async function requestPhoneOtp(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/auth/otp/request`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: OTP_REQUEST_TIMEOUT_MS, retries: OTP_RETRY_COUNT, retryDelayMs: 450 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('OTP-Code konnte nicht angefordert werden.', response.status, text);
  }

  return parseJsonPayload(text) || {};
}

async function resendPhoneOtp(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/auth/otp/resend`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: OTP_REQUEST_TIMEOUT_MS, retries: OTP_RETRY_COUNT, retryDelayMs: 450 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('OTP-Code konnte nicht erneut angefordert werden.', response.status, text);
  }
  return parseJsonPayload(text) || {};
}

async function verifyPhoneOtp(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/auth/otp/verify`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: OTP_VERIFY_TIMEOUT_MS, retries: OTP_RETRY_COUNT, retryDelayMs: 500 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('OTP-Code konnte nicht bestätigt werden.', response.status, text);
  }

  return parseJsonPayload(text) || {};
}

async function fetchBackendHealth(baseUrl) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/health`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 7000, retries: 1, retryDelayMs: 350 });
  if (!response.ok) {
    throw new Error('Health-Check fehlgeschlagen.');
  }
  return response.json();
}

function describeConnectionError(baseUrl, error, options = {}) {
  const includeTechnicalDetails = options.includeTechnicalDetails === true;
  const message = String(error?.message || error || '').trim();
  const normalized = normalizeUrl(baseUrl);
  const isPrivate = isPrivateNetworkBaseUrl(normalized);
  if (!includeTechnicalDetails) {
    if (!message) return 'Service aktuell nicht erreichbar. Bitte später erneut versuchen.';
    const lower = message.toLowerCase();
    if (lower.includes('request timeout') || lower.includes('network request failed') || lower.includes('failed to fetch')) {
      return 'Service aktuell nicht erreichbar. Bitte später erneut versuchen.';
    }
    return message;
  }
  if (normalized.includes(':4137')) {
    return [
      'Verbindung fehlgeschlagen.',
      `URL: ${normalized}`,
      'Port-Hinweis: Bitte 4173 statt 4137 verwenden.',
      'Bitte prüfen: gleiche WLAN-Verbindung und Server läuft auf dem Mac.',
    ].join('\n');
  }
  if (message.toLowerCase().includes('request timeout')) {
    if (!isPrivate) {
      return [
        'Service hat nicht rechtzeitig geantwortet.',
        `URL: ${normalized || '(leer)'}`,
        'Bitte später erneut versuchen oder kurz den Netzwerkstatus prüfen.',
      ].join('\n');
    }
    return [
      'Backend hat nicht rechtzeitig geantwortet.',
      `URL: ${normalized || '(leer)'}`,
      'Bitte prüfen: gleiche WLAN-Verbindung, Mac-IP statt localhost, Port 4173 aktiv.',
    ].join('\n');
  }
  if (message.toLowerCase().includes('network request failed')) {
    if (!isPrivate) {
      return [
        'Service ist aktuell nicht erreichbar.',
        `URL: ${normalized || '(leer)'}`,
        'Bitte Internetverbindung prüfen und erneut versuchen.',
      ].join('\n');
    }
    return [
      'Netzwerk nicht erreichbar.',
      `URL: ${normalized || '(leer)'}`,
      'Bitte prüfen: gleiche WLAN-Verbindung, Mac-IP statt localhost, Port 4173 aktiv.',
    ].join('\n');
  }
  return message || 'Unbekannter Verbindungsfehler.';
}

async function fetchPatientMembershipStatus(baseUrl, clinicName, memberEmail) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const safeClinicName = String(clinicName || '').trim();
  const safeEmail = String(memberEmail || '').trim().toLowerCase();
  const query = `?clinicName=${encodeURIComponent(safeClinicName)}&memberEmail=${encodeURIComponent(safeEmail)}`;
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/membership/status${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Membership-Status konnte nicht geladen werden.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json();
}

async function activatePatientMembership(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/membership/activate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, { timeoutMs: 12000, retries: 1, retryDelayMs: 500 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Membership konnte nicht aktiviert werden.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json();
}

async function cancelPatientMembership(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/membership/cancel`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, { timeoutMs: 12000, retries: 1, retryDelayMs: 500 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Membership konnte nicht beendet werden.';
    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.error || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json();
}

async function resolveClinicByCode(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/clinics/resolve-code`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('Code konnte nicht aufgelöst werden.', response.status, text);
  }
  return parseJsonPayload(text) || {};
}

async function addMobileCartItem(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/cart/add`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: 12000, retries: 1, retryDelayMs: 500 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('Warenkorb konnte nicht serverseitig aktualisiert werden.', response.status, text);
  }
  return parseJsonPayload(text) || {};
}

async function completeMobileCheckout(baseUrl, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/checkout/complete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: 18000, retries: 1, retryDelayMs: 600 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('Checkout konnte nicht abgeschlossen werden.', response.status, text);
  }
  return parseJsonPayload(text) || {};
}

function membershipStatusLabel(status) {
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return 'Aktiv';
    case 'past_due':
      return 'Zahlung offen';
    case 'paused':
      return 'Pausiert';
    case 'canceled':
      return 'Gekündigt';
    default:
      return 'Inaktiv';
  }
}

function rewardActionIcon(actionId) {
  switch (String(actionId || '').toLowerCase()) {
    case 'referral':
      return 'people-outline';
    case 'review':
      return 'logo-google';
    case 'story':
      return 'star-outline';
    default:
      return 'sparkles-outline';
  }
}

function categoryIconName(categoryId) {
  switch (String(categoryId || '').toLowerCase()) {
    case 'gesicht':
      return 'happy-outline';
    case 'haare':
      return 'leaf-outline';
    case 'koerper':
      return 'body-outline';
    case 'injectables':
      return 'medical-outline';
    case 'premium':
      return 'diamond-outline';
    default:
      return 'ellipse-outline';
  }
}

function TopHeader({
  title,
  clinicShortName,
  onSearchPress,
  onCartPress,
  cartCount = 0,
}) {
  const safeCartCount = Math.max(0, Number(cartCount || 0));
  const cartBadgeText = safeCartCount > 99 ? '99+' : String(safeCartCount);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{String(clinicShortName || 'A').slice(0, 1)}</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerClinic}>{clinicShortName || 'APP'}</Text>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButtonWrap,
            pressed && styles.tapScaleSoft,
          ]}
          onPress={onSearchPress}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color={THEME.inkSoft} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButtonWrap,
            pressed && styles.tapScaleSoft,
          ]}
          onPress={onCartPress}
          hitSlop={8}
        >
          <Ionicons name="bag-handle-outline" size={21} color={THEME.inkSoft} />
          {safeCartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>{cartBadgeText}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.segmentBtn,
        active && styles.segmentBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ShopTabButton({ label, active, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.shopTabBtn,
        active && styles.shopTabBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.shopTabText, active && styles.shopTabTextActive]}>{label}</Text>
      <View style={[styles.shopTabUnderline, active && styles.shopTabUnderlineActive]} />
    </Pressable>
  );
}

function BottomTab({ label, active, onPress }) {
  const iconByTab = {
    Home: { active: 'home', inactive: 'home-outline' },
    Shop: { active: 'bag-handle', inactive: 'bag-handle-outline' },
    Scan: { active: 'qr-code', inactive: 'qr-code-outline' },
    Rewards: { active: 'gift', inactive: 'gift-outline' },
    Profil: { active: 'person', inactive: 'person-outline' },
  };
  const iconSpec = iconByTab[label] || { active: 'ellipse', inactive: 'ellipse-outline' };
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bottomTabBtn,
        active && styles.bottomTabBtnActive,
        pressed && styles.tapScaleSoft,
      ]}
      onPress={onPress}
    >
      {active && <View pointerEvents="none" style={styles.bottomTabActiveGlow} />}
      {active && <View pointerEvents="none" style={styles.bottomTabActiveBeam} />}
      <Ionicons
        name={active ? iconSpec.active : iconSpec.inactive}
        size={18}
        color={active ? THEME.ink : THEME.mutedSoft}
      />
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function TreatmentCard({ treatment, onPress }) {
  const imageUrl = preferredTreatmentImage(treatment);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.treatmentCard,
        pressed && styles.tapScaleCard,
      ]}
      onPress={() => onPress(treatment)}
    >
      <View pointerEvents="none" style={styles.treatmentCardGloss} />
      <View pointerEvents="none" style={styles.treatmentCardGlow} />
      <View pointerEvents="none" style={styles.treatmentCardPearl} />
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.treatmentImageReal} />
      ) : (
        <View style={styles.treatmentImageMock} />
      )}
      <View style={styles.treatmentCardBody}>
        <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
        <Text style={styles.treatmentDescription} numberOfLines={2}>
          {treatment.description}
        </Text>
        <Text style={styles.treatmentPrice}>ab {formatPrice(treatment.priceCents)}</Text>
      </View>
    </Pressable>
  );
}

export default function App() {
  const [mainTab, setMainTab] = useState('home');
  const [shopTab, setShopTab] = useState('browse');
  const [profileTab, setProfileTab] = useState('behandlungen');
  const [rewardsView, setRewardsView] = useState('active');
  const [categoryId, setCategoryId] = useState('gesicht');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [units, setUnits] = useState(1);

  const [clinicProfile, setClinicProfile] = useState(CLINIC);
  const [homeArticles, setHomeArticles] = useState(HOME_ARTICLES);
  const [treatmentCategories, setTreatmentCategories] = useState(TREATMENT_CATEGORIES);
  const [treatments, setTreatments] = useState(TREATMENTS);
  const [memberships, setMemberships] = useState(MEMBERSHIPS);
  const [rewardActions, setRewardActions] = useState(REWARD_ACTIONS);
  const [rewardRedeems, setRewardRedeems] = useState(REWARD_REDEEMS);

  const [activeMembership, setActiveMembership] = useState('silber');
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [membershipSyncing, setMembershipSyncing] = useState(false);
  const [points, setPoints] = useState(430);
  const [walletCents, setWalletCents] = useState(2500);
  const [lastAction, setLastAction] = useState('');
  const [history, setHistory] = useState([]);

  const [settingsName, setSettingsName] = useState('Anna Muster');
  const [settingsEmail, setSettingsEmail] = useState('anna@muster.at');
  const [analyticsBaseUrl, setAnalyticsBaseUrl] = useState('');
  const [clinicLookupName, setClinicLookupName] = useState(APP_DEFAULT_CLINIC_NAME || '');
  const [clinicLookupId, setClinicLookupId] = useState('');
  const [analyticsConnected, setAnalyticsConnected] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicSearchResults, setClinicSearchResults] = useState([]);
  const [clinicSearchLoading, setClinicSearchLoading] = useState(false);
  const [clinicDropdownOpen, setClinicDropdownOpen] = useState(false);
  const [onboardingBaseUrl, setOnboardingBaseUrl] = useState('');
  const [backendCheckLoading, setBackendCheckLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [backendCheckMessage, setBackendCheckMessage] = useState('');
  const [onboardingStep, setOnboardingStep] = useState('clinic');
  const [scanCodeValue, setScanCodeValue] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGuestMode, setPatientGuestMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpRequestId, setOtpRequestId] = useState('');
  const [otpRequestedPhone, setOtpRequestedPhone] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const [otpUiMessage, setOtpUiMessage] = useState('');
  const [otpUiType, setOtpUiType] = useState('neutral');
  const [otpCooldownUntil, setOtpCooldownUntil] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showTechnicalSetup, setShowTechnicalSetup] = useState(TECHNICAL_SETUP_VISIBLE_BY_DEFAULT);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [selectedCheckoutMethod, setSelectedCheckoutMethod] = useState('card');

  const [cartItems, setCartItems] = useState([]);
  const [cartSyncing, setCartSyncing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const liquidShineAnim = useRef(new Animated.Value(-220)).current;
  const floatingAuraAnim = useRef(new Animated.Value(0)).current;
  const clinicSearchRequestRef = useRef(0);
  const appSessionId = useMemo(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    []
  );
  const expoBackendUrl = useMemo(() => resolveExpoBackendUrl(), []);

  const currentMembership = useMemo(() => {
    const fallback = {
      id: 'guest',
      name: 'Gast',
      priceCents: 0,
      perks: [],
      includedTreatmentIds: [],
    };
    return memberships.find((item) => item.id === activeMembership) || memberships[0] || fallback;
  }, [activeMembership, memberships]);

  const browseItems = useMemo(
    () => treatments.filter((item) => item.category === categoryId),
    [categoryId, treatments]
  );

  const globalSearchResults = useMemo(() => {
    const q = String(headerSearchQuery || '').trim().toLowerCase();
    if (!q) return [];

    const byCategoryId = treatmentCategories.reduce((acc, cat) => {
      if (cat?.id) acc[String(cat.id)] = String(cat.label || cat.id);
      return acc;
    }, {});

    const treatmentMatches = treatments
      .filter((item) => {
        const haystack = [
          item?.name || '',
          item?.description || '',
          byCategoryId[item?.category] || item?.category || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 8)
      .map((item) => ({
        type: 'treatment',
        id: item.id,
        title: item.name,
        subtitle: `${byCategoryId[item.category] || item.category || 'Treatment'} • ab ${formatPrice(item.priceCents || 0)}`,
        payload: item,
      }));

    const membershipMatches = memberships
      .filter((plan) => {
        const haystack = [
          plan?.name || '',
          ...(Array.isArray(plan?.perks) ? plan.perks : []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 4)
      .map((plan) => ({
        type: 'membership',
        id: plan.id,
        title: plan.name,
        subtitle: `${formatPrice(plan.priceCents || 0)} / Monat`,
        payload: plan,
      }));

    const articleMatches = homeArticles
      .filter((article) => {
        const haystack = [
          article?.title || '',
          article?.body || '',
          article?.tag || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 4)
      .map((article) => ({
        type: 'article',
        id: article.id,
        title: article.title,
        subtitle: `${article.tag || 'Artikel'} • Wissen`,
        payload: article,
      }));

    return [...treatmentMatches, ...membershipMatches, ...articleMatches].slice(0, 12);
  }, [headerSearchQuery, treatmentCategories, treatments, memberships, homeArticles]);

  const clinicSuggestionResults = useMemo(() => {
    const query = String(clinicSearchQuery || '').trim();
    const queryLower = query.toLowerCase();
    const fallback = buildLocalClinicFallbackResults(
      query,
      clinicProfile,
      clinicLookupName,
      clinicLookupId,
      normalizeUrl(onboardingBaseUrl || analyticsBaseUrl || APP_DEFAULT_BACKEND_URL)
    );
    const merged = [...clinicSearchResults, ...fallback];
    const seen = new Set();
    const unique = [];
    for (const entry of merged) {
      const name = String(entry?.name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    const filtered = queryLower
      ? unique.filter((entry) => String(entry?.name || '').toLowerCase().includes(queryLower))
      : unique;
    filtered.sort((a, b) => {
      const aName = String(a?.name || '');
      const bName = String(b?.name || '');
      const rankDelta = clinicMatchRank(aName, queryLower) - clinicMatchRank(bName, queryLower);
      if (rankDelta !== 0) return rankDelta;
      return aName.localeCompare(bName, 'de', { sensitivity: 'base' });
    });
    return filtered.slice(0, 25);
  }, [
    clinicSearchQuery,
    clinicSearchResults,
    clinicProfile,
    clinicLookupName,
    clinicLookupId,
    onboardingBaseUrl,
    analyticsBaseUrl,
  ]);

  const selectedCategory = useMemo(() => {
    return (
      treatmentCategories.find((item) => String(item.id || '') === String(categoryId || ''))
      || treatmentCategories[0]
      || { id: categoryId, label: categoryId }
    );
  }, [categoryId, treatmentCategories]);

  const selectedCategoryMeta = useMemo(
    () => resolveCategoryMeta(selectedCategory?.id, selectedCategory?.label),
    [selectedCategory]
  );

  const shopMembershipTabLabel = useMemo(() => {
    const short = String(clinicProfile?.shortName || '').trim();
    if (!short) return 'Membership';
    return `${short} VIP`;
  }, [clinicProfile?.shortName]);

  const totalCartCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalCents, 0),
    [cartItems]
  );

  const rewardHistoryItems = useMemo(
    () => history.filter((entry) => entry.type === 'reward' || entry.type === 'redeem'),
    [history]
  );

  const hasActiveMembership = analyticsConnected
    ? membershipStatus?.status === 'active' && membershipStatus?.membershipId === activeMembership
    : true;
  const activeMembershipName = hasActiveMembership ? currentMembership.name : 'Gast';
  const membershipStatusText = membershipStatusLabel(membershipStatus?.status || 'inactive');
  const includedTreatmentIds = Array.isArray(currentMembership.includedTreatmentIds)
    ? currentMembership.includedTreatmentIds
    : [];

  const resolvedOnboardingBaseUrl = normalizeUrl(onboardingBaseUrl || analyticsBaseUrl || APP_DEFAULT_BACKEND_URL);
  const needsBackendProvisioning = !resolvedOnboardingBaseUrl;
  const shouldPreferPublicBackends = PREFER_PUBLIC_BACKENDS_DEFAULT && !showTechnicalSetup;
  const clinicCoordinates = useMemo(
    () => resolveClinicCoordinates(clinicProfile),
    [clinicProfile]
  );
  const clinicMapRegion = useMemo(
    () => ({
      latitude: clinicCoordinates.latitude,
      longitude: clinicCoordinates.longitude,
      latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
    }),
    [clinicCoordinates]
  );

  async function runWithBaseUrlFallback(baseUrlHint, runner, options = {}) {
    const preferPublic = options.preferPublic === true;
    const resolvedCandidates = resolveApiCandidates(
      baseUrlHint,
      analyticsBaseUrl,
      onboardingBaseUrl,
      expoBackendUrl,
      APP_DEFAULT_BACKEND_URL
    );
    const candidates = prioritizeApiCandidates(resolvedCandidates, { preferPublic });
    if (candidates.length === 0) {
      throw new Error('Backend URL fehlt');
    }

    let lastError = null;
    for (let idx = 0; idx < candidates.length; idx += 1) {
      const candidate = candidates[idx];
      try {
        const value = await runner(candidate);
        if (candidate !== normalizeUrl(analyticsBaseUrl) && candidate !== normalizeUrl(onboardingBaseUrl)) {
          setAnalyticsBaseUrl(candidate);
          setOnboardingBaseUrl(candidate);
          await writeSecureValue(STORAGE_KEYS.analyticsBaseUrl, candidate);
        }
        return { value, baseUrl: candidate, usedFallback: idx > 0 };
      } catch (error) {
        if (error && typeof error === 'object') {
          error.baseUrlCandidate = candidate;
        }
        lastError = error;
        const canTryNext = idx < candidates.length - 1 && shouldRetryRequest(error);
        if (!canTryNext) {
          throw error;
        }
      }
    }
    throw lastError || new Error('Netzwerkfehler');
  }

  async function sendEvent(eventName, extras = {}) {
    if (!analyticsConnected) return;
    const safeBaseUrl = normalizeUrl(analyticsBaseUrl);
    if (!safeBaseUrl) return;

    try {
      await postPublicEvent(safeBaseUrl, {
        clinicName: clinicProfile.name || CLINIC.name,
        eventName,
        treatmentId: extras.treatmentId || '',
        amountCents: typeof extras.amountCents === 'number' ? extras.amountCents : undefined,
        sessionId: appSessionId,
        metadata: {
          tab: mainTab,
          shopTab,
          membership: activeMembership,
          ...(extras.metadata || {}),
        },
      });
    } catch {
      // Keep UX smooth in demo mode if backend is offline.
    }
  }

  function track(message, eventName = '', extras = {}) {
    setLastAction(message);
    if (eventName) {
      void sendEvent(eventName, extras);
    }
  }

  function switchMainTab(nextTab) {
    Animated.sequence([
      Animated.timing(tabFadeAnim, {
        toValue: 0.55,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 170,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    setMainTab(nextTab);
  }

  function openHeaderSearch() {
    setHeaderSearchOpen(true);
    setHeaderSearchQuery('');
  }

  function closeHeaderSearch() {
    setHeaderSearchOpen(false);
  }

  function openHeaderCart() {
    setCartSheetOpen(true);
  }

  function closeHeaderCart() {
    setCartSheetOpen(false);
  }

  function searchResultIcon(type) {
    switch (type) {
      case 'membership':
        return 'diamond-outline';
      case 'article':
        return 'newspaper-outline';
      default:
        return 'sparkles-outline';
    }
  }

  function onGlobalSearchSelect(result) {
    if (!result) return;

    if (result.type === 'treatment' && result.payload) {
      setShopTab('browse');
      setSelectedTreatment(result.payload);
      switchMainTab('shop');
      closeHeaderSearch();
      return;
    }

    if (result.type === 'membership') {
      setShopTab('membership');
      switchMainTab('shop');
      closeHeaderSearch();
      return;
    }

    if (result.type === 'article') {
      switchMainTab('home');
      closeHeaderSearch();
      return;
    }
  }

  function openTreatment(treatment) {
    setSelectedTreatment(treatment);
    track(`Angebot geöffnet: ${treatment.name}`, 'offer_view', {
      treatmentId: treatment.id,
    });
  }

  async function syncMembershipStatus(nextBaseUrl = '', nextClinicName = '', nextEmail = '') {
    const normalized = normalizeUrl(nextBaseUrl || analyticsBaseUrl);
    const resolvedClinicName = String(nextClinicName || clinicLookupName || clinicProfile.name || '').trim();
    const resolvedEmail = String(nextEmail || settingsEmail || '').trim().toLowerCase();

    if (!normalized || !resolvedClinicName || !resolvedEmail || !resolvedEmail.includes('@')) {
      setMembershipStatus(null);
      return;
    }

    setMembershipSyncing(true);
    try {
      const response = await fetchPatientMembershipStatus(normalized, resolvedClinicName, resolvedEmail);
      const row = response.membership || null;
      setMembershipStatus(row);
      if (row?.membershipId) {
        setActiveMembership(row.membershipId);
      }
    } catch {
      setMembershipStatus(null);
    } finally {
      setMembershipSyncing(false);
    }
  }

  async function loadClinicBundle(nextBaseUrl = '', nextClinicName = '', nextClinicId = '', nextEmail = '', options = {}) {
    const silentFailure = options.silentFailure === true;
    const normalized = normalizeUrl(nextBaseUrl || analyticsBaseUrl);
    if (!normalized) {
      setAnalyticsConnected(false);
      if (!silentFailure) {
        Alert.alert('Service nicht verfügbar', 'MedSpa-Daten konnten nicht geladen werden.');
      }
      return;
    }

    const resolvedClinicName = String(nextClinicName || clinicLookupName || '').trim();
    const resolvedClinicId = String(nextClinicId || clinicLookupId || '').trim();
    const payload = await fetchClinicBundle(normalized, resolvedClinicName, resolvedClinicId);
    const catalog = payload.catalog || {};
    const clinic = payload.clinic || {};

    const nextCategories = Array.isArray(catalog.categories) ? catalog.categories : [];
    const nextTreatments = Array.isArray(catalog.treatments) ? catalog.treatments : [];
    const nextMemberships = Array.isArray(catalog.memberships) ? catalog.memberships : [];
    const nextRewardActions = Array.isArray(catalog.rewardActions) ? catalog.rewardActions : [];
    const nextRewardRedeems = Array.isArray(catalog.rewardRedeems) ? catalog.rewardRedeems : [];
    const nextHomeArticles = Array.isArray(catalog.homeArticles) ? catalog.homeArticles : [];

    setTreatmentCategories(nextCategories);
    setCategoryId(nextCategories[0]?.id || 'gesicht');

    const normalizedTreatments = nextTreatments.map((item) => ({
        ...item,
        imageUrl: absolutizeMediaUrl(normalized, item.imageUrl),
        galleryUrls: Array.isArray(item.galleryUrls)
          ? item.galleryUrls.map((entry) => absolutizeMediaUrl(normalized, entry)).filter(Boolean)
          : [],
      }));
    setTreatments(normalizedTreatments);
    setSelectedTreatment(null);

    setMemberships(nextMemberships);
    const fallbackMembership = nextMemberships[0];
    const keepCurrent = nextMemberships.some((item) => item.id === activeMembership);
    if (!keepCurrent && fallbackMembership) {
      setActiveMembership(fallbackMembership.id);
    }
    if (!fallbackMembership) {
      setActiveMembership('guest');
    }

    setRewardActions(nextRewardActions);
    setRewardRedeems(nextRewardRedeems);
    setHomeArticles(nextHomeArticles);

    if (clinic && typeof clinic === 'object') {
      setClinicProfile({
        ...CLINIC,
        ...clinic,
      });
      if (clinic.name) {
        setClinicLookupName(clinic.name);
        setClinicSearchQuery(clinic.name);
      }
      if (clinic.id) {
        setClinicLookupId(String(clinic.id));
      }
    }

    setAnalyticsBaseUrl(normalized);
    setOnboardingBaseUrl(normalized);
    setAnalyticsConnected(true);
    await syncMembershipStatus(normalized, clinic.name || resolvedClinicName || clinicLookupName, nextEmail || settingsEmail);
    track(`MedSpa-Daten geladen: ${clinic.name || clinicLookupName}`);
    return clinic;
  }

  async function connectAnalytics(options = {}) {
    if (connectLoading) return;
    const sourceBaseUrl = showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl;
    const normalizedCandidates = prioritizeApiCandidates(
      resolveApiCandidates(sourceBaseUrl, expoBackendUrl, APP_DEFAULT_BACKEND_URL),
      { preferPublic: shouldPreferPublicBackends }
    );
    const normalized = normalizedCandidates[0] || '';
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    const resolvedClinicId = String(options.clinicId ?? clinicLookupId ?? '').trim();
    const nextEmail = String(options.memberEmail ?? settingsEmail).trim().toLowerCase();
    const nextName = String(options.memberName ?? settingsName).trim();
    const completeOnboarding = options.completeOnboarding !== false;
    const silentFailure = options.silentFailure === true;
    if (!normalized) {
      setAnalyticsConnected(false);
      Alert.alert('Service nicht verfügbar', 'MedSpa-Verbindung ist aktuell nicht verfügbar.');
      return;
    }
    if (!resolvedClinicName && !resolvedClinicId) {
      Alert.alert('MedSpa fehlt', 'Bitte suche und wähle zuerst eine MedSpa.');
      return;
    }

    setConnectLoading(true);
    try {
      const { value: loadedClinic, baseUrl: connectedBaseUrl } = await runWithBaseUrlFallback(
        normalized,
        (baseUrlCandidate) =>
          loadClinicBundle(baseUrlCandidate, resolvedClinicName, resolvedClinicId, nextEmail, { silentFailure: true }),
        { preferPublic: shouldPreferPublicBackends }
      );
      const persistedBaseUrl = normalizeUrl(connectedBaseUrl || normalized);
      const persistedClinicName = String(loadedClinic?.name || resolvedClinicName || '').trim();
      const persistedClinicId = String(loadedClinic?.id || resolvedClinicId || '').trim();
      await writeSecureValue(STORAGE_KEYS.analyticsBaseUrl, persistedBaseUrl);
      await writeSecureValue(STORAGE_KEYS.clinicName, persistedClinicName);
      await writeSecureValue(STORAGE_KEYS.clinicId, persistedClinicId);
      if (nextName) {
        setSettingsName(nextName);
        await writeSecureValue(STORAGE_KEYS.settingsName, nextName);
      }
      if (nextEmail) {
        setSettingsEmail(nextEmail);
        await writeSecureValue(STORAGE_KEYS.settingsEmail, nextEmail);
      }
      if (completeOnboarding) {
        await writeSecureValue(STORAGE_KEYS.onboardingDone, '1');
      }
      setShowOnboarding(false);
      setBackendCheckMessage(showTechnicalSetup ? `Verbindung OK: ${persistedBaseUrl}` : 'Verbindung erfolgreich.');
      track('MedSpa verbunden');
    } catch (error) {
      setAnalyticsConnected(false);
      const helpMessage = describeConnectionError(normalized || sourceBaseUrl, error, {
        includeTechnicalDetails: showTechnicalSetup,
      });
      setBackendCheckMessage(helpMessage);
      if (!silentFailure) {
        Alert.alert('Backend-Verbindung fehlgeschlagen', helpMessage);
      } else {
        setOtpFeedback('Backend-Verbindung fehlgeschlagen. Bitte später erneut versuchen.', 'error');
      }
    } finally {
      setConnectLoading(false);
    }
  }

  async function runBackendHealthCheck() {
    const sourceBaseUrl = showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl;
    const normalized = prioritizeApiCandidates(
      resolveApiCandidates(sourceBaseUrl, expoBackendUrl, APP_DEFAULT_BACKEND_URL),
      { preferPublic: shouldPreferPublicBackends }
    )[0] || '';
    if (!normalized) {
      Alert.alert('Backend URL fehlt', 'Bitte gib zuerst die Backend-URL ein.');
      return;
    }

    setBackendCheckLoading(true);
    try {
      const { value: payload, baseUrl } = await runWithBaseUrlFallback(
        normalized,
        (baseUrlCandidate) => fetchBackendHealth(baseUrlCandidate),
        { preferPublic: shouldPreferPublicBackends }
      );
      if (payload?.status === 'ok') {
        const message = showTechnicalSetup ? `Health-Check erfolgreich: ${baseUrl}` : 'Health-Check erfolgreich.';
        setBackendCheckMessage(message);
        Alert.alert('Backend erreichbar', message);
      } else {
        throw new Error('Health-Check Antwort ungültig.');
      }
    } catch (error) {
      const helpMessage = describeConnectionError(normalized, error, {
        includeTechnicalDetails: showTechnicalSetup,
      });
      setBackendCheckMessage(helpMessage);
      Alert.alert('Backend-Test fehlgeschlagen', helpMessage);
    } finally {
      setBackendCheckLoading(false);
    }
  }

  async function runClinicSearch(options = {}) {
    const queryValue = String(options.query ?? clinicSearchQuery ?? '').trim();
    const silent = options.silent === true;
    const allowEmpty = options.allowEmpty === true;
    const candidates = prioritizeApiCandidates(
      resolveApiCandidates(
        showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl,
        expoBackendUrl,
        APP_DEFAULT_BACKEND_URL
      ),
      { preferPublic: shouldPreferPublicBackends }
    );
    if (candidates.length === 0) {
      const localFallback = buildLocalClinicFallbackResults(
        queryValue,
        clinicProfile,
        clinicLookupName,
        clinicLookupId,
        ''
      );
      if (localFallback.length > 0) {
        setClinicSearchResults(localFallback);
        setClinicDropdownOpen(true);
        setBackendCheckMessage('Lokale MedSpa-Liste aktiv.');
      } else {
        setBackendCheckMessage('Service aktuell nicht erreichbar. Bitte später erneut versuchen.');
      }
      return;
    }
    if (queryValue.length < 1 && !allowEmpty) {
      setClinicSearchResults([]);
      setBackendCheckMessage('');
      return;
    }
    const effectiveQuery = queryValue.length < 1 ? '' : queryValue;

    const requestToken = Date.now();
    clinicSearchRequestRef.current = requestToken;
    setClinicSearchLoading(true);
    let lastError = null;
    let lastEmptyBaseUrl = '';
    try {
      for (const baseUrl of candidates) {
        try {
          const response = await fetchClinicSearch(baseUrl, effectiveQuery, 12);
          if (clinicSearchRequestRef.current !== requestToken) {
            return;
          }
          let clinics = (Array.isArray(response.clinics) ? response.clinics : []).map((entry) => ({
            ...entry,
            _sourceBaseUrl: baseUrl,
          }));
          if (clinics.length === 0 && queryValue.length > 0) {
            try {
              const broadResponse = await fetchClinicSearch(baseUrl, '', 25);
              const allClinics = Array.isArray(broadResponse.clinics) ? broadResponse.clinics : [];
              const needle = queryValue.toLowerCase();
              clinics = allClinics
                .filter((entry) => String(entry?.name || '').trim().toLowerCase().includes(needle))
                .map((entry) => ({
                  ...entry,
                  _sourceBaseUrl: baseUrl,
                }));
            } catch {
              // fallback bleibt leer
            }
          }
          if (clinics.length === 0) {
            const localFallback = buildLocalClinicFallbackResults(
              queryValue,
              clinicProfile,
              clinicLookupName,
              clinicLookupId,
              baseUrl
            );
            if (localFallback.length > 0) {
              clinics = localFallback;
            } else {
              lastEmptyBaseUrl = baseUrl;
              continue;
            }
          }

          setClinicSearchResults(clinics);
          setClinicDropdownOpen(true);
          setBackendCheckMessage(
            showTechnicalSetup ? `MedSpa-Suche verbunden über: ${baseUrl}` : 'MedSpa-Suche verbunden.'
          );
          const exact = clinics.find(
            (entry) =>
              String(entry?.name || '').trim().toLowerCase() === queryValue.toLowerCase()
          );
          if (exact?.name) {
            selectClinicFromSearch(exact);
          }
          return;
        } catch (error) {
          lastError = error;
        }
      }
      if (clinicSearchRequestRef.current !== requestToken) {
        return;
      }
      setClinicSearchResults([]);
      if (queryValue.length < 1) {
        setBackendCheckMessage('');
        return;
      }
      if (lastError) {
        const localFallback = buildLocalClinicFallbackResults(
          queryValue,
          clinicProfile,
          clinicLookupName,
          clinicLookupId,
          candidates[0]
        );
        if (localFallback.length > 0) {
          setClinicSearchResults(localFallback);
          setClinicDropdownOpen(true);
          if (showTechnicalSetup) {
            setBackendCheckMessage(`Lokale MedSpa-Liste aktiv (Backend aktuell nicht erreichbar).`);
          } else {
            setBackendCheckMessage('');
          }
          return;
        }
        if (!silent) {
          const helpMessage = describeConnectionError(candidates[0], lastError, {
            includeTechnicalDetails: showTechnicalSetup,
          });
          setBackendCheckMessage(helpMessage);
        }
        return;
      }
      if (lastEmptyBaseUrl && showTechnicalSetup) {
        const localFallback = buildLocalClinicFallbackResults(
          queryValue,
          clinicProfile,
          clinicLookupName,
          clinicLookupId,
          candidates[0]
        );
        if (localFallback.length > 0) {
          setClinicSearchResults(localFallback);
          setClinicDropdownOpen(true);
          setBackendCheckMessage('Lokale MedSpa-Liste aktiv.');
          return;
        }
        setBackendCheckMessage(`Keine MedSpa-Treffer über: ${lastEmptyBaseUrl}`);
        return;
      }
      const localFallback = buildLocalClinicFallbackResults(
        queryValue,
        clinicProfile,
        clinicLookupName,
        clinicLookupId,
        candidates[0]
      );
      if (localFallback.length > 0) {
        setClinicSearchResults(localFallback);
        setClinicDropdownOpen(true);
        setBackendCheckMessage(showTechnicalSetup ? 'Lokale MedSpa-Liste aktiv.' : '');
        return;
      }
      setBackendCheckMessage('Keine MedSpa-Treffer. Bitte Eingabe anpassen.');
    } finally {
      if (clinicSearchRequestRef.current === requestToken) {
        setClinicSearchLoading(false);
      }
    }
  }

function selectClinicFromSearch(clinic) {
  const name = String(clinic?.name || '').trim();
  if (!name) return;
  const sourceBaseUrl = normalizeUrl(clinic?._sourceBaseUrl || '');
  if (sourceBaseUrl) {
    setOnboardingBaseUrl(sourceBaseUrl);
    setAnalyticsBaseUrl(sourceBaseUrl);
    void writeSecureValue(STORAGE_KEYS.analyticsBaseUrl, sourceBaseUrl);
  }
  setClinicLookupName(name);
  setClinicLookupId(String(clinic?.id ?? '').trim());
  setClinicSearchQuery(name);
  setClinicDropdownOpen(false);
  setBackendCheckMessage('');
  setOtpUiMessage('');
  setOtpUiType('neutral');
}

  function setOtpFeedback(message, type = 'neutral') {
    setOtpUiMessage(String(message || '').trim());
    setOtpUiType(type);
  }

  function startOtpCooldown(seconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
    if (safeSeconds <= 0) {
      setOtpCooldownUntil(0);
      setOtpCountdown(0);
      return;
    }
    setOtpCooldownUntil(Date.now() + safeSeconds * 1000);
    setOtpCountdown(safeSeconds);
  }

  function applyOtpApiError(error, fallbackMessage) {
    const errorCode = String(error?.errorCode || '').trim().toUpperCase();
    const retryAfterSeconds = Math.max(0, Math.floor(Number(error?.retryAfterSeconds || 0)));
    const attemptsRemainingRaw = Number(error?.attemptsRemaining);
    const attemptsRemaining = Number.isFinite(attemptsRemainingRaw) ? attemptsRemainingRaw : null;

    if (errorCode === 'OTP_COOLDOWN') {
      if (retryAfterSeconds > 0) {
        startOtpCooldown(retryAfterSeconds);
      }
      const secondsLabel = retryAfterSeconds > 0 ? ` ${retryAfterSeconds}s` : '';
      setOtpFeedback(`Bitte warte${secondsLabel}, bevor du einen neuen Code anforderst.`, 'warning');
      return;
    }

    if (errorCode === 'OTP_INVALID') {
      if (attemptsRemaining !== null && attemptsRemaining >= 0) {
        if (attemptsRemaining === 0) {
          setOtpFeedback('Code ungültig. Bitte fordere einen neuen Code an.', 'error');
        } else {
          setOtpFeedback(`Code ungültig. Noch ${attemptsRemaining} Versuch${attemptsRemaining === 1 ? '' : 'e'}.`, 'error');
        }
      } else {
        setOtpFeedback('Code ungültig.', 'error');
      }
      return;
    }

    if (errorCode === 'OTP_EXPIRED') {
      setOtpFeedback('Code abgelaufen. Bitte „Code neu senden“ nutzen.', 'warning');
      return;
    }

    if (errorCode === 'OTP_ATTEMPTS_EXCEEDED') {
      setOtpFeedback('Zu viele Fehlversuche. Bitte „Code neu senden“ nutzen.', 'error');
      return;
    }

    if (errorCode === 'OTP_REQUEST_NOT_FOUND') {
      setOtpFeedback('Kein aktiver OTP-Request gefunden. Bitte sende einen neuen Code.', 'warning');
      return;
    }

    if (errorCode === 'OTP_DELIVERY_FAILED') {
      setOtpFeedback('SMS-Zustellung aktuell nicht möglich. Bitte später erneut versuchen oder als Gast fortfahren.', 'error');
      return;
    }

    setOtpFeedback(String(error?.message || fallbackMessage || 'OTP-Anfrage fehlgeschlagen.'), 'error');
  }

  function applyOtpSuccessFeedback(responsePayload, fallbackMessage) {
    const debugCode = String(responsePayload?.debugCode || '').trim();
    const maskedPhone = String(responsePayload?.maskedPhone || patientPhone || '').trim();
    const resendAfterSeconds = Number(responsePayload?.resendAfterSeconds || 0);
    if (Number.isFinite(resendAfterSeconds) && resendAfterSeconds > 0) {
      startOtpCooldown(resendAfterSeconds);
    } else {
      startOtpCooldown(MOBILE_OTP_COOLDOWN_SECONDS_FALLBACK);
    }

    if (debugCode) {
      setOtpFeedback(`Testmodus aktiv: Code ${debugCode} (nur lokale Entwicklung).`, 'info');
      return;
    }
    const phoneLabel = maskedPhone || 'deine Nummer';
    setOtpFeedback(fallbackMessage || `Code an ${phoneLabel} gesendet.`, 'success');
  }

  function resetOtpFlow() {
    setOtpCode('');
    setOtpRequestId('');
    setOtpRequestedPhone('');
    setOtpExpiresAt('');
    setOtpUiMessage('');
    setOtpUiType('neutral');
    setOtpCooldownUntil(0);
    setOtpCountdown(0);
    setOtpResendLoading(false);
  }

function continueToAccessStep() {
  let selectedClinicName = String(clinicLookupName || '').trim();
  let selectedClinicId = String(clinicLookupId || '').trim();
  const queryName = String(clinicSearchQuery || '').trim();

  // Auto-pick best match from dropdown/local fallback if user only typed a partial name.
  if ((!selectedClinicName || !selectedClinicId) && queryName) {
    const queryLower = queryName.toLowerCase();
    const bestMatch =
      clinicSuggestionResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase() === queryLower
      )
      || clinicSuggestionResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase().startsWith(queryLower)
      )
      || clinicSuggestionResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase().includes(queryLower)
      );
    const fallbackResults = buildLocalClinicFallbackResults(
      queryName,
      clinicProfile,
      clinicLookupName,
      clinicLookupId,
      normalizeUrl(onboardingBaseUrl || analyticsBaseUrl || APP_DEFAULT_BACKEND_URL)
    );
    const fallbackMatch =
      fallbackResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase() === queryLower
      )
      || fallbackResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase().startsWith(queryLower)
      )
      || fallbackResults.find(
        (entry) => String(entry?.name || '').trim().toLowerCase().includes(queryLower)
      );
    const resolvedMatch = bestMatch || fallbackMatch;

    if (resolvedMatch) {
      const bestName = String(resolvedMatch?.name || '').trim();
      const bestId = String(resolvedMatch?.id || '').trim();
      if (bestName) {
        selectedClinicName = bestName;
        selectedClinicId = bestId;
        setClinicLookupName(bestName);
        setClinicLookupId(bestId);
        setClinicSearchQuery(bestName);
      }
    }
  }

  if (!selectedClinicName && !selectedClinicId) {
    setBackendCheckMessage('Bitte wähle eine MedSpa aus der Liste aus.');
    Alert.alert('MedSpa fehlt', 'Bitte suche zuerst deine MedSpa.');
    return;
  }

  clinicSearchRequestRef.current = 0;
  setClinicSearchLoading(false);
  setClinicSearchResults([]);
  setClinicDropdownOpen(false);
  setBackendCheckMessage('');
  resetOtpFlow();
  setOnboardingStep('access');
}

  async function openClinicInMaps() {
    const clinicName = String(clinicProfile?.name || clinicLookupName || '').trim() || 'MedSpa';
    const addressCandidate = [clinicProfile?.address, clinicProfile?.city].filter(Boolean).join(', ');
    const locationQuery = String(addressCandidate || clinicName).trim();
    const coords = resolveClinicCoordinates(clinicProfile);
    const encodedLabel = encodeURIComponent(clinicName);
    const encodedQuery = encodeURIComponent(locationQuery);
    const hasExactCoords =
      Number.isFinite(Number(clinicProfile?.latitude))
      && Number.isFinite(Number(clinicProfile?.longitude));

    const iosUrl = hasExactCoords
      ? `http://maps.apple.com/?ll=${coords.latitude},${coords.longitude}&q=${encodedLabel}`
      : `http://maps.apple.com/?q=${encodedQuery}`;
    const crossPlatformUrl = hasExactCoords
      ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    const preferredUrl = Platform.OS === 'ios' ? iosUrl : crossPlatformUrl;
    const fallbackUrl = Platform.OS === 'ios' ? crossPlatformUrl : iosUrl;
    try {
      const preferredSupported = await Linking.canOpenURL(preferredUrl);
      if (preferredSupported) {
        await Linking.openURL(preferredUrl);
        track('MedSpa in Maps geöffnet', 'clinic_map_open', {
          metadata: {
            clinicName,
            method: Platform.OS === 'ios' ? 'apple_maps' : 'google_maps',
          },
        });
        return;
      }
      const fallbackSupported = await Linking.canOpenURL(fallbackUrl);
      if (fallbackSupported) {
        await Linking.openURL(fallbackUrl);
        track('MedSpa in Maps geöffnet (Fallback)', 'clinic_map_open', {
          metadata: {
            clinicName,
            method: Platform.OS === 'ios' ? 'google_maps_fallback' : 'apple_maps_fallback',
          },
        });
      } else {
        Alert.alert('Karte nicht verfügbar', 'Auf diesem Gerät konnte keine Karten-App geöffnet werden.');
      }
    } catch {
      Alert.alert('Karte nicht verfügbar', 'Die Kartenansicht konnte nicht geöffnet werden.');
    }
  }

  async function callClinicNow() {
    const phoneRaw = String(clinicProfile?.phone || '').trim();
    if (!phoneRaw) {
      Alert.alert('Telefonnummer fehlt', 'Für diese MedSpa ist noch keine Telefonnummer hinterlegt.');
      return;
    }
    const dialTarget = `tel:${phoneRaw.replace(/\s+/g, '')}`;
    try {
      const supported = await Linking.canOpenURL(dialTarget);
      if (!supported) {
        Alert.alert('Anruf nicht möglich', `Bitte manuell anrufen: ${phoneRaw}`);
        return;
      }
      await Linking.openURL(dialTarget);
      track(`Call now: ${phoneRaw}`, 'clinic_call_click', {
        metadata: { clinicName: clinicProfile.name || '' },
      });
    } catch {
      Alert.alert('Anruf nicht möglich', `Bitte manuell anrufen: ${phoneRaw}`);
    }
  }

  async function useQrOrReferralCode() {
    const normalized = prioritizeApiCandidates(
      resolveApiCandidates(
        showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl,
        expoBackendUrl,
        APP_DEFAULT_BACKEND_URL
      ),
      { preferPublic: shouldPreferPublicBackends }
    )[0] || '';
    if (!normalized) {
      setBackendCheckMessage('Service aktuell nicht erreichbar. Bitte später erneut versuchen.');
      return;
    }

    const rawCode = String(scanCodeValue || '').trim();
    if (!rawCode) {
      setBackendCheckMessage('Bitte gib einen MedSpa- oder QR-Code ein.');
      return;
    }

    let parsedClinicName = resolveClinicNameFromQrOrCode(rawCode);
    let resolvedBaseForQr = normalized;
    try {
      const { value: resolved, baseUrl: resolvedBaseUrl } = await runWithBaseUrlFallback(
        normalized,
        (baseUrlCandidate) => resolveClinicByCode(baseUrlCandidate, { code: rawCode }),
        { preferPublic: shouldPreferPublicBackends }
      );
      if (resolvedBaseUrl) {
        resolvedBaseForQr = normalizeUrl(resolvedBaseUrl);
        setAnalyticsBaseUrl(resolvedBaseUrl);
        setOnboardingBaseUrl(resolvedBaseUrl);
      }
      const resolvedName = String(resolved?.resolvedClinicName || resolved?.clinic?.name || '').trim();
      if (resolvedName) {
        parsedClinicName = resolvedName;
      }
    } catch {
      // fallback below
    }

    if (!parsedClinicName) {
      setBackendCheckMessage('Code konnte nicht aufgelöst werden.');
      return;
    }

    setClinicSearchQuery(parsedClinicName);
    setClinicLookupName(parsedClinicName);
    setClinicLookupId('');
    setScanCodeValue('');

    try {
      const response = await fetchClinicSearch(resolvedBaseForQr, parsedClinicName, 8);
      const clinics = Array.isArray(response.clinics) ? response.clinics : [];
      setClinicSearchResults(clinics);
      if (clinics.length > 0) {
        selectClinicFromSearch(clinics[0]);
        resetOtpFlow();
        setBackendCheckMessage('');
        setOnboardingStep('access');
        return;
      }
    } catch {
      // Falls Suche fehlschlaegt, kann Nutzer trotzdem manuell weiter.
    }
    resetOtpFlow();
    setBackendCheckMessage('');
    setOnboardingStep('access');
  }

  async function continueWithPhone(forceRequest = false) {
    if (otpLoading || otpResendLoading) return;
    const normalizedPhone = normalizePhone(patientPhone);
    const digits = normalizedPhone.replace(/\D/g, '');
    if (digits.length < 7) {
      setOtpFeedback('Bitte gib eine gültige Telefonnummer ein.', 'error');
      return;
    }

    const normalized = prioritizeApiCandidates(
      resolveApiCandidates(
        showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl,
        expoBackendUrl,
        APP_DEFAULT_BACKEND_URL
      ),
      { preferPublic: shouldPreferPublicBackends }
    )[0] || '';
    const effectiveBaseUrl = normalized;
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    const resolvedClinicId = String(clinicLookupId || '').trim();
    if (!effectiveBaseUrl) {
      setOtpFeedback('Backend nicht verbunden. Bitte später erneut versuchen.', 'warning');
      return;
    }
    if (!resolvedClinicName && !resolvedClinicId) {
      setOtpFeedback('Bitte wähle zuerst eine MedSpa aus.', 'warning');
      return;
    }

    const shouldRequestOtp = forceRequest || !otpRequestId || otpRequestedPhone !== normalizedPhone;
    if (shouldRequestOtp) {
      setOtpLoading(true);
      setOtpFeedback('Code wird angefordert ...', 'info');
      try {
        const { value: response, baseUrl } = await runWithBaseUrlFallback(
          effectiveBaseUrl,
          (baseUrlCandidate) =>
            requestPhoneOtp(baseUrlCandidate, {
              clinicId: resolvedClinicId || undefined,
              clinicName: resolvedClinicName,
              phone: normalizedPhone,
            }),
          { preferPublic: shouldPreferPublicBackends }
        );
        setBackendCheckMessage(
          showTechnicalSetup ? `OTP-Service verbunden über: ${baseUrl}` : 'OTP-Service verbunden.'
        );
        setOtpRequestId(String(response.requestId || '').trim());
        setOtpRequestedPhone(normalizedPhone);
        setOtpExpiresAt(String(response.expiresAt || '').trim());
        setOtpCode('');
        applyOtpSuccessFeedback(response, `Code gesendet an ${String(response.maskedPhone || normalizedPhone).trim()}.`);
      } catch (error) {
        applyOtpApiError(error, 'OTP-Code konnte nicht angefordert werden.');
      } finally {
        setOtpLoading(false);
      }
      return;
    }

    const safeOtpCode = String(otpCode || '').trim();
    if (!/^\d{4,8}$/.test(safeOtpCode)) {
      setOtpFeedback('Bitte gib den SMS-Code ein.', 'warning');
      return;
    }

    setOtpLoading(true);
    setOtpFeedback('Code wird bestätigt ...', 'info');
    try {
      const { value: response } = await runWithBaseUrlFallback(
        effectiveBaseUrl,
        (baseUrlCandidate) =>
          verifyPhoneOtp(baseUrlCandidate, {
            clinicId: resolvedClinicId || undefined,
            clinicName: resolvedClinicName,
            phone: normalizedPhone,
            requestId: otpRequestId,
            code: safeOtpCode,
          }),
        { preferPublic: shouldPreferPublicBackends }
      );
      const memberEmail = String(response.memberEmail || '').trim().toLowerCase();
      const memberName = String(response.memberName || settingsName || '').trim();
      if (!memberEmail.includes('@')) {
        throw new Error('OTP erfolgreich, aber Mitgliedskonto konnte nicht abgeleitet werden.');
      }

      setPatientPhone(normalizedPhone);
      setPatientGuestMode(false);
      await writeSecureValue(STORAGE_KEYS.patientPhone, normalizedPhone);
      await writeSecureValue(STORAGE_KEYS.patientGuestMode, '0');
      setOtpFeedback('Telefonnummer bestätigt. Verbinde MedSpa ...', 'success');
      setOtpCooldownUntil(0);
      setOtpCountdown(0);
      setOtpCode('');

      await connectAnalytics({
        clinicId: resolvedClinicId,
        memberEmail,
        memberName,
        completeOnboarding: true,
        silentFailure: true,
      });
    } catch (error) {
      applyOtpApiError(error, 'OTP-Code konnte nicht bestätigt werden.');
    } finally {
      setOtpLoading(false);
    }
  }

  async function resendOtpCode() {
    if (otpLoading || otpResendLoading) return;
    if (otpCountdown > 0) {
      setOtpFeedback(`Bitte warte ${otpCountdown}s, bevor du einen neuen Code anforderst.`, 'warning');
      return;
    }

    const normalized = prioritizeApiCandidates(
      resolveApiCandidates(
        showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl,
        expoBackendUrl,
        APP_DEFAULT_BACKEND_URL
      ),
      { preferPublic: shouldPreferPublicBackends }
    )[0] || '';
    const effectiveBaseUrl = normalized;
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    const resolvedClinicId = String(clinicLookupId || '').trim();
    const normalizedPhone = normalizePhone(patientPhone);
    if (!effectiveBaseUrl) {
      setOtpFeedback('Backend nicht verbunden. Bitte später erneut versuchen.', 'warning');
      return;
    }
    if ((!resolvedClinicName && !resolvedClinicId) || !normalizedPhone) {
      setOtpFeedback('MedSpa oder Telefonnummer fehlt.', 'warning');
      return;
    }

    setOtpResendLoading(true);
    setOtpFeedback('Code wird neu gesendet ...', 'info');
    try {
      const { value: response, baseUrl } = await runWithBaseUrlFallback(
        effectiveBaseUrl,
        (baseUrlCandidate) =>
          resendPhoneOtp(baseUrlCandidate, {
            clinicId: resolvedClinicId || undefined,
            clinicName: resolvedClinicName,
            phone: normalizedPhone,
          }),
        { preferPublic: shouldPreferPublicBackends }
      );
      setBackendCheckMessage(
        showTechnicalSetup ? `OTP-Service verbunden über: ${baseUrl}` : 'OTP-Service verbunden.'
      );
      setOtpRequestId(String(response.requestId || '').trim());
      setOtpRequestedPhone(normalizedPhone);
      setOtpExpiresAt(String(response.expiresAt || '').trim());
      setOtpCode('');
      applyOtpSuccessFeedback(response, `Neuer Code an ${String(response.maskedPhone || normalizedPhone).trim()} gesendet.`);
    } catch (error) {
      applyOtpApiError(error, 'Code konnte nicht erneut gesendet werden.');
    } finally {
      setOtpResendLoading(false);
    }
  }

  async function continueAsGuest() {
    const resolvedClinicId = String(clinicLookupId || '').trim();
    resetOtpFlow();
    setPatientGuestMode(true);
    setPatientPhone('');
    await writeSecureValue(STORAGE_KEYS.patientPhone, '');
    await writeSecureValue(STORAGE_KEYS.patientGuestMode, '1');
    await connectAnalytics({
      clinicId: resolvedClinicId,
      memberEmail: '',
      completeOnboarding: true,
      silentFailure: true,
    });
  }

  async function disconnectClinicSession() {
    setShowOnboarding(true);
    setOnboardingStep('clinic');
    setClinicSearchResults([]);
    setClinicLookupId('');
    setSelectedTreatment(null);
    setCartItems([]);
    setMembershipStatus(null);
    setAnalyticsConnected(false);
    setPatientPhone('');
    setPatientGuestMode(false);
    resetOtpFlow();
    await writeSecureValue(STORAGE_KEYS.clinicName, '');
    await writeSecureValue(STORAGE_KEYS.clinicId, '');
    await writeSecureValue(STORAGE_KEYS.patientPhone, '');
    await writeSecureValue(STORAGE_KEYS.patientGuestMode, '');
    await writeSecureValue(STORAGE_KEYS.onboardingDone, '');
  }

  async function continueOfflineDemo() {
    setPatientGuestMode(true);
    await writeSecureValue(STORAGE_KEYS.onboardingDone, '1');
    await writeSecureValue(STORAGE_KEYS.patientGuestMode, '1');
    setShowOnboarding(false);
  }

  async function addToCart() {
    if (!selectedTreatment || cartSyncing || checkoutLoading) return;

    const membershipApplies = hasActiveMembership;
    const isIncluded = membershipApplies && includedTreatmentIds.includes(selectedTreatment.id);
    const fallbackPrice = Number(selectedTreatment.priceCents || 0);
    const parsedMemberPrice = Number(selectedTreatment.memberPriceCents);
    const memberPrice = Number.isFinite(parsedMemberPrice) && parsedMemberPrice >= 0 ? parsedMemberPrice : fallbackPrice;
    const localUnitPrice = membershipApplies ? (isIncluded ? 0 : memberPrice) : fallbackPrice;
    const localTotal = localUnitPrice * units;

    if (analyticsConnected) {
      const normalized = normalizeUrl(analyticsBaseUrl);
      const resolvedClinicName = String(clinicProfile.name || clinicLookupName || clinicSearchQuery || '').trim();
      if (!normalized || !resolvedClinicName) {
        Alert.alert('Backend fehlt', 'Bitte zuerst MedSpa verbinden oder als Offline-Demo fortfahren.');
        return;
      }

      setCartSyncing(true);
      try {
        const payload = await addMobileCartItem(normalized, {
          clinicName: resolvedClinicName,
          treatmentId: selectedTreatment.id,
          memberEmail: String(settingsEmail || '').trim().toLowerCase(),
          sessionId: appSessionId,
          units,
        });
        const item = payload?.lineItem || {};
        const normalizedItem = {
          id: String(item.id || `${selectedTreatment.id}-${Date.now()}`),
          treatmentId: String(item.treatmentId || selectedTreatment.id),
          name: String(item.name || selectedTreatment.name),
          units: Math.max(1, Number(item.units || units || 1)),
          unitCents: Math.max(0, Number(item.unitCents ?? localUnitPrice)),
          totalCents: Math.max(0, Number(item.totalCents ?? localTotal)),
          priceSource: String(item.priceSource || ''),
        };
        setCartItems((prev) => [...prev, normalizedItem]);

        const nextMembership = payload?.membership || null;
        if (nextMembership) {
          setMembershipStatus(nextMembership);
          if (nextMembership.membershipId) {
            setActiveMembership(nextMembership.membershipId);
          }
        }

        tapFeedback(6);
        track(`In den Warenkorb: ${normalizedItem.name}`);
        Alert.alert('Zum Warenkorb hinzugefügt', `${normalizedItem.name} (${normalizedItem.units}x)`);
      } catch (error) {
        Alert.alert('Warenkorb fehlgeschlagen', String(error?.message || error));
      } finally {
        setCartSyncing(false);
      }
      return;
    }

    const fallbackItem = {
      id: `${selectedTreatment.id}-${Date.now()}`,
      treatmentId: selectedTreatment.id,
      name: selectedTreatment.name,
      units,
      unitCents: localUnitPrice,
      totalCents: localTotal,
      priceSource: membershipApplies ? (isIncluded ? 'included' : 'member') : 'standard',
    };
    setCartItems((prev) => [...prev, fallbackItem]);
    tapFeedback(6);
    track(`In den Warenkorb: ${selectedTreatment.name}`, 'add_to_cart', {
      treatmentId: selectedTreatment.id,
      amountCents: localTotal,
      metadata: { units },
    });
    Alert.alert('Zum Warenkorb hinzugefügt', `${selectedTreatment.name} (${units}x)`);
  }

  function updateCartItemUnits(itemId, nextUnits) {
    const normalizedUnits = Math.max(1, Math.min(20, Number(nextUnits || 1)));
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const unitCents = Math.max(0, Number(item.unitCents || 0));
        return {
          ...item,
          units: normalizedUnits,
          totalCents: unitCents * normalizedUnits,
        };
      })
    );
  }

  function removeCartItem(itemId) {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function runCheckout() {
    if (cartItems.length === 0) {
      Alert.alert('Warenkorb leer', 'Bitte wähle zuerst mindestens eine Behandlung.');
      return;
    }
    if (checkoutLoading || cartSyncing) return;
    const paymentMethod = String(selectedCheckoutMethod || 'card').toLowerCase();
    const paymentStatus = checkoutDefaultPaymentStatus(paymentMethod);
    const paymentMethodText = checkoutMethodLabel(paymentMethod);

    if (analyticsConnected) {
      const normalized = normalizeUrl(analyticsBaseUrl);
      const resolvedClinicName = String(clinicProfile.name || clinicLookupName || clinicSearchQuery || '').trim();
      if (!normalized || !resolvedClinicName) {
        Alert.alert('Backend fehlt', 'Bitte zuerst MedSpa verbinden oder als Offline-Demo fortfahren.');
        return;
      }

      setCheckoutLoading(true);
      try {
        const payload = await completeMobileCheckout(normalized, {
          clinicName: resolvedClinicName,
          memberEmail: String(settingsEmail || '').trim().toLowerCase(),
          sessionId: appSessionId,
          paymentStatus,
          paymentMethod,
          cartItems: cartItems.map((item) => ({
            treatmentId: String(item.treatmentId || item.id || ''),
            units: Math.max(1, Number(item.units || 1)),
          })),
        });

        const spentCents = Math.max(0, Number(payload?.totalCents || 0));
        const earnedPoints = Math.max(0, Number(payload?.earnedPoints || 0));
        const purchasedItems = Array.isArray(payload?.lineItems) ? payload.lineItems : [];

        setPoints((prev) => prev + earnedPoints);
        setHistory((prev) => [
          {
            id: String(payload?.orderId || `purchase-${Date.now()}`),
            type: 'purchase',
            title: `${purchasedItems.length || cartItems.length} Behandlung(en) gekauft`,
            amount: spentCents,
            createdAt: Date.now(),
          },
          ...prev,
        ]);

        const nextMembership = payload?.membership || null;
        if (nextMembership) {
          setMembershipStatus(nextMembership);
          if (nextMembership.membershipId) {
            setActiveMembership(nextMembership.membershipId);
          }
        }

        setCartItems([]);
        setSelectedTreatment(null);
        setUnits(1);

        tapFeedback(8);
        track(`Kauf abgeschlossen (${paymentMethodText}): ${formatPrice(spentCents)} | +${earnedPoints} Punkte`);
        Alert.alert(
          'Kauf erfolgreich',
          `Gesamt: ${formatPrice(spentCents)}\nZahlart: ${paymentMethodText}\nVerdiente Punkte: ${earnedPoints}\nBestellnummer: ${String(payload?.orderId || '—')}`
        );
      } catch (error) {
        Alert.alert('Checkout fehlgeschlagen', String(error?.message || error));
      } finally {
        setCheckoutLoading(false);
      }
      return;
    }

    const spentCents = totalCartCents;
    const earnedPoints = Math.round(spentCents / 100);

    setPoints((prev) => prev + earnedPoints);
    setHistory((prev) => [
      {
        id: `purchase-${Date.now()}`,
        type: 'purchase',
        title: `${cartItems.length} Behandlung(en) gekauft`,
        amount: spentCents,
        createdAt: Date.now(),
      },
      ...prev,
    ]);

    setCartItems([]);
    setSelectedTreatment(null);
    setUnits(1);

    tapFeedback(8);
    track(`Kauf abgeschlossen (${paymentMethodText}): ${formatPrice(spentCents)} | +${earnedPoints} Punkte`, 'purchase_success', {
      treatmentId: cartItems.map((item) => item.name).join(', ').slice(0, 100),
      amountCents: spentCents,
      metadata: { items: cartItems.length, earnedPoints, paymentMethod, paymentStatus },
    });
    Alert.alert(
      'Kauf erfolgreich',
      `Gesamt: ${formatPrice(spentCents)}\nZahlart: ${paymentMethodText}\nVerdiente Punkte: ${earnedPoints}\n\nFür Tests kannst du im Stripe-Checkout die Karte 4242 4242 4242 4242 nutzen.`
    );
  }

  function claimActionPoints(action) {
    setPoints((prev) => prev + action.points);
    setHistory((prev) => [
      {
        id: `reward-${action.id}-${Date.now()}`,
        type: 'reward',
        title: action.label,
        points: action.points,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    track(`Reward verbucht: ${action.label} (+${action.points})`, 'reward_claim', {
      metadata: { rewardAction: action.id, points: action.points },
    });
  }

  function redeemReward(item) {
    if (points < item.requiredPoints) {
      Alert.alert('Nicht genug Punkte', `Du brauchst ${item.requiredPoints} Punkte.`);
      return;
    }

    setPoints((prev) => prev - item.requiredPoints);
    setWalletCents((prev) => prev + item.valueCents);
    setHistory((prev) => [
      {
        id: `redeem-${item.id}-${Date.now()}`,
        type: 'redeem',
        title: item.label,
        amount: item.valueCents,
        createdAt: Date.now(),
      },
      ...prev,
    ]);

    track(`Eingelöst: ${item.label}`, 'reward_redeem', {
      amountCents: item.valueCents,
      metadata: { rewardId: item.id, pointsSpent: item.requiredPoints },
    });
    Alert.alert('Guthaben erhöht', `${item.label} wurde deinem Wallet gutgeschrieben.`);
  }

  async function activateMembership(membershipId) {
    const membership = memberships.find((item) => item.id === membershipId);
    if (!membership) {
      Alert.alert('Membership nicht gefunden', 'Bitte lade den Katalog neu.');
      return;
    }

    if (!analyticsConnected) {
      setActiveMembership(membershipId);
      track(`Mitgliedschaft aktiviert (Demo): ${membership.name}`, 'membership_join', {
        metadata: { membershipId, mode: 'offline_demo' },
      });
      return;
    }

    const normalized = normalizeUrl(analyticsBaseUrl);
    const memberEmail = String(settingsEmail || '').trim().toLowerCase();
    const memberName = String(settingsName || '').trim();
    const resolvedClinicName = String(clinicProfile.name || clinicLookupName || '').trim();

    if (!normalized || !resolvedClinicName) {
      Alert.alert('Backend fehlt', 'Bitte zuerst Backend verbinden.');
      return;
    }
    if (!memberEmail || !memberEmail.includes('@')) {
      Alert.alert('E-Mail fehlt', 'Bitte setze im Profil eine gültige E-Mail für die Membership.');
      return;
    }

    setMembershipSyncing(true);
    try {
      const response = await activatePatientMembership(normalized, {
        clinicName: resolvedClinicName,
        memberEmail,
        memberName,
        membershipId,
      });
      const row = response.membership || null;
      setMembershipStatus(row);
      if (row?.membershipId) {
        setActiveMembership(row.membershipId);
      } else {
        setActiveMembership(membershipId);
      }
      track(`Mitgliedschaft aktiviert: ${membership.name}`);
      Alert.alert(
        'Membership aktiv',
        `${membership.name} wurde aktiviert.${row?.nextChargeAt ? `\nNächste Abbuchung: ${formatDate(row.nextChargeAt)}` : ''}`
      );
    } catch (error) {
      Alert.alert('Aktivierung fehlgeschlagen', String(error?.message || error));
    } finally {
      setMembershipSyncing(false);
    }
  }

  async function cancelMembership() {
    if (!analyticsConnected) {
      setMembershipStatus((prev) => (prev ? { ...prev, status: 'canceled' } : prev));
      track('Mitgliedschaft gekündigt (Demo)');
      return;
    }

    const normalized = normalizeUrl(analyticsBaseUrl);
    const memberEmail = String(settingsEmail || '').trim().toLowerCase();
    const resolvedClinicName = String(clinicProfile.name || clinicLookupName || '').trim();
    if (!normalized || !resolvedClinicName || !memberEmail) {
      Alert.alert('Daten fehlen', 'Backend, MedSpa-Name oder E-Mail fehlt.');
      return;
    }

    setMembershipSyncing(true);
    try {
      const response = await cancelPatientMembership(normalized, {
        clinicName: resolvedClinicName,
        memberEmail,
      });
      setMembershipStatus(response.membership || null);
      track('Mitgliedschaft gekündigt');
      Alert.alert('Mitgliedschaft beendet', 'Dein Abo wurde auf gekündigt gesetzt.');
    } catch (error) {
      Alert.alert('Kündigung fehlgeschlagen', String(error?.message || error));
    } finally {
      setMembershipSyncing(false);
    }
  }

  function checkInViaScan() {
    const bonusPoints = 30;
    setPoints((prev) => prev + bonusPoints);
    setHistory((prev) => [
      {
        id: `scan-${Date.now()}`,
        type: 'reward',
        title: `Check-in Scan (${clinicProfile.shortName || 'APP'})`,
        points: bonusPoints,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    track(`Check-in Scan erfolgreich (+${bonusPoints} Punkte)`, 'reward_claim', {
      metadata: { source: 'scan_checkin', points: bonusPoints },
    });
    Alert.alert('Check-in gespeichert', `+${bonusPoints} Punkte wurden gutgeschrieben.`);
  }

  useEffect(() => {
    let isActive = true;
    (async () => {
      const storedBaseUrl = normalizeUrl(await readSecureValue(STORAGE_KEYS.analyticsBaseUrl));
      const storedClinicName = String(await readSecureValue(STORAGE_KEYS.clinicName)).trim();
      const storedClinicId = String(await readSecureValue(STORAGE_KEYS.clinicId)).trim();
      const storedOnboardingDone = String(await readSecureValue(STORAGE_KEYS.onboardingDone)).trim();
      const storedName = String(await readSecureValue(STORAGE_KEYS.settingsName)).trim();
      const storedEmail = String(await readSecureValue(STORAGE_KEYS.settingsEmail)).trim();
      const storedPatientPhone = normalizePhone(await readSecureValue(STORAGE_KEYS.patientPhone));
      const storedPatientGuestMode = String(await readSecureValue(STORAGE_KEYS.patientGuestMode)).trim() === '1';
      const defaultBaseUrl = normalizeUrl(APP_DEFAULT_BACKEND_URL);
      const expoDetectedBaseUrl = normalizeUrl(expoBackendUrl);
      const defaultClinicName = String(APP_DEFAULT_CLINIC_NAME || '').trim();

      if (!isActive) return;

      if (storedName) setSettingsName(storedName);
      if (storedEmail) setSettingsEmail(storedEmail);
      if (storedPatientPhone) {
        setPatientPhone(storedPatientPhone);
      }
      if (storedPatientGuestMode) {
        setPatientGuestMode(true);
      }
      const initialCandidates = prioritizeApiCandidates(
        resolveApiCandidates(storedBaseUrl, defaultBaseUrl, expoDetectedBaseUrl),
        { preferPublic: PREFER_PUBLIC_BACKENDS_DEFAULT }
      );
      const initialBaseUrl = initialCandidates[0] || '';
      const initialClinicName = storedClinicName || defaultClinicName;
      if (initialBaseUrl) {
        setAnalyticsBaseUrl(initialBaseUrl);
        setOnboardingBaseUrl(initialBaseUrl);
      }
      if (initialClinicName) {
        setClinicLookupName(initialClinicName);
        setClinicSearchQuery(initialClinicName);
      }
      if (storedClinicId) {
        setClinicLookupId(storedClinicId);
      }

      if ((initialClinicName || storedClinicId) && initialCandidates.length > 0) {
        for (const candidate of initialCandidates) {
          try {
            await loadClinicBundle(candidate, initialClinicName, storedClinicId);
            if (!isActive) return;
            if (storedOnboardingDone !== '1') {
              setShowOnboarding(true);
              setOnboardingStep('clinic');
            }
            setIsBootstrapping(false);
            return;
          } catch (error) {
            if (isActive) {
              setBackendCheckMessage(
                describeConnectionError(candidate, error, {
                  includeTechnicalDetails: showTechnicalSetup,
                })
              );
            }
          }
        }
      }

      if (!isActive) return;
      setShowOnboarding(storedOnboardingDone !== '1');
      setOnboardingStep('clinic');
      setIsBootstrapping(false);
    })();
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expoBackendUrl]);

  useEffect(() => {
    track('App geöffnet', 'app_open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    liquidShineAnim.setValue(-34);
    floatingAuraAnim.setValue(0.16);
  }, [floatingAuraAnim, liquidShineAnim]);

  useEffect(() => {
    if (!memberships.some((item) => item.id === activeMembership) && memberships[0]?.id) {
      setActiveMembership(memberships[0].id);
    }
  }, [activeMembership, memberships]);

  useEffect(() => {
    if (!analyticsConnected) return;
    void syncMembershipStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsConnected, settingsEmail]);

  useEffect(() => {
    void writeSecureValue(STORAGE_KEYS.settingsName, settingsName);
  }, [settingsName]);

  useEffect(() => {
    void writeSecureValue(STORAGE_KEYS.settingsEmail, settingsEmail);
  }, [settingsEmail]);

  useEffect(() => {
    if (!otpCooldownUntil) {
      if (otpCountdown !== 0) {
        setOtpCountdown(0);
      }
      return undefined;
    }
    const tick = () => {
      const nextSeconds = Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
      setOtpCountdown(nextSeconds);
      if (nextSeconds <= 0) {
        setOtpCooldownUntil(0);
      }
    };
    tick();
    const timerId = setInterval(tick, 500);
    return () => clearInterval(timerId);
  }, [otpCooldownUntil]);

  useEffect(() => {
    if (!showOnboarding || onboardingStep !== 'clinic') return undefined;
    const query = String(clinicSearchQuery || '').trim();
    if (query.length < 1 && !clinicDropdownOpen) return undefined;
    const timeoutId = setTimeout(() => {
      void runClinicSearch({ query, silent: true, allowEmpty: clinicDropdownOpen });
    }, 380);
    return () => clearTimeout(timeoutId);
  }, [showOnboarding, onboardingStep, clinicSearchQuery, clinicDropdownOpen]);

  const hasCart = cartItems.length > 0;
  const cartCtaLabel = cartSyncing ? 'Wird hinzugefügt ...' : 'In den Warenkorb';
  const checkoutCtaLabel = checkoutLoading ? 'Wird verarbeitet ...' : 'Jetzt bezahlen';
  const normalizedPhoneInput = normalizePhone(patientPhone);
  const otpReadyToVerify = Boolean(otpRequestId) && normalizedPhoneInput === otpRequestedPhone;
  const otpCtaLabel = connectLoading
    ? 'Verbinde ...'
    : otpLoading
      ? (otpReadyToVerify ? 'Code wird geprüft ...' : 'Code wird gesendet ...')
      : (otpReadyToVerify ? 'Code bestätigen' : 'Code senden');
  const otpResendLabel = otpResendLoading
    ? 'Code wird neu gesendet ...'
    : otpCountdown > 0
      ? `Code neu senden in ${otpCountdown}s`
      : 'Code neu senden';

  if (isBootstrapping) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.bootWrap}>
          <ActivityIndicator size="large" color={THEME.brand} />
          <Text style={styles.bootTitle}>Curabo wird geladen ...</Text>
          <Text style={styles.bootBody}>Die App wird gestartet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <View pointerEvents="none" style={styles.ambientLayer}>
            <View style={styles.ambientWash} />
            <View style={styles.ambientBeam} />
            <View style={styles.ambientLensTop} />
            <View style={styles.ambientLensBottom} />
            <View style={styles.ambientOrbA} />
            <View style={styles.ambientOrbB} />
            <View style={styles.ambientOrbC} />
          </View>
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
                  ? 'Suche deine MedSpa nach Name oder nutze einen QR-/Referral-Code. Danach bleibt alles an einem Ort: Treatments, Rewards und Membership.'
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

              {ALLOW_TECHNICAL_SETUP && (
                <Pressable
                  style={[styles.secondaryCta, styles.techToggleCta]}
                  onPress={() => setShowTechnicalSetup((prev) => !prev)}
                >
                  <Text style={styles.secondaryCtaText}>
                    {showTechnicalSetup ? 'Technik ausblenden' : 'Technik / Backend (optional)'}
                  </Text>
                </Pressable>
              )}

              {ALLOW_TECHNICAL_SETUP && showTechnicalSetup && (
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
                    onChangeText={(value) => {
                      const next = String(value || '');
                      setClinicSearchQuery(next);
                      setClinicDropdownOpen(true);
                      setBackendCheckMessage('');
                      if (String(clinicLookupName || '').trim().toLowerCase() !== next.trim().toLowerCase()) {
                        setClinicLookupName('');
                        setClinicLookupId('');
                      }
                      if (!next.trim()) {
                        setClinicSearchResults([]);
                      }
                    }}
                    onFocus={() => {
                      setClinicDropdownOpen(true);
                      void runClinicSearch({ query: clinicSearchQuery, silent: true, allowEmpty: true });
                    }}
                    placeholder="MedSpa Name eingeben"
                    placeholderTextColor={THEME.muted}
                    autoCorrect={false}
                    returnKeyType="search"
                    onSubmitEditing={() => {
                      setClinicDropdownOpen(true);
                      void runClinicSearch();
                    }}
                  />
                  <Pressable
                    style={[styles.secondaryCta, clinicSearchLoading && styles.ctaDisabled]}
                    disabled={clinicSearchLoading}
                    onPress={() => {
                      setClinicDropdownOpen(true);
                      void runClinicSearch();
                    }}
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

                  <Pressable
                    style={styles.primaryCta}
                    onPress={continueToAccessStep}
                  >
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View pointerEvents="none" style={styles.ambientLayer}>
          <View style={styles.ambientWash} />
          <View style={styles.ambientBeam} />
          <View style={styles.ambientLensTop} />
          <View style={styles.ambientLensBottom} />
          <View style={styles.ambientOrbA} />
          <View style={styles.ambientOrbB} />
          <View style={styles.ambientOrbC} />
        </View>
        <Animated.View
          style={[
            styles.mainAnimatedPanel,
            {
              opacity: tabFadeAnim,
              transform: [
                {
                  translateY: tabFadeAnim.interpolate({
                    inputRange: [0.55, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {mainTab === 'home' && (
            <View>
              <TopHeader
                title="Start"
                clinicShortName={clinicProfile.shortName}
                onSearchPress={openHeaderSearch}
                onCartPress={openHeaderCart}
                cartCount={cartItems.length}
              />

              <View style={styles.heroCard}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heroLiquidShine,
                    {
                      transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                    },
                  ]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heroAeroCluster,
                    {
                      transform: [
                        {
                          translateY: floatingAuraAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -14],
                          }),
                        },
                        {
                          translateX: floatingAuraAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 8],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.heroAeroHalo} />
                  <View style={styles.heroAeroCore} />
                  <View style={styles.heroAeroRing} />
                  <View style={styles.heroAeroDot} />
                </Animated.View>
                <View pointerEvents="none" style={styles.heroGlossArc} />
                <View pointerEvents="none" style={styles.heroGlassPill} />
                <View pointerEvents="none" style={styles.heroPearl} />
                <View pointerEvents="none" style={styles.heroGlowPrimary} />
                <View pointerEvents="none" style={styles.heroGlowSecondary} />
                <Text style={styles.heroEyebrow}>PERSONALISIERT FÜR DICH</Text>
                <Text style={styles.heroTitle}>Mehr Ergebnisse mit deinem {activeMembershipName}</Text>
                <Text style={styles.heroBody}>
                  Erhalte exklusive Pakete, Punkte pro Besuch und priorisierte Terminbuchung direkt in der App.
                </Text>
                <Pressable
                  style={styles.heroCta}
                  onPress={() => {
                    switchMainTab('shop');
                    track('Start > Shop geöffnet', 'offer_view', {
                      treatmentId: 'shop_overview',
                    });
                  }}
                >
                  <Text style={styles.heroCtaText}>Angebote ansehen</Text>
                </Pressable>
              </View>

              <View style={styles.financeBanner}>
                <View pointerEvents="none" style={styles.surfaceRim} />
                <View pointerEvents="none" style={styles.surfaceBlueAura} />
                <View pointerEvents="none" style={styles.financeGlow} />
                <Text style={styles.financeTitle}>Heute behandeln. Später zahlen. Punkte sammeln.</Text>
                <Text style={styles.financeBody}>Flexible Monatsraten und Rewards für wiederkehrende Besuche.</Text>
              </View>

              <Text style={styles.sectionTitle}>Wissen & Tipps</Text>
              {homeArticles.map((article) => (
                <View key={article.id} style={styles.articleCard}>
                  <View pointerEvents="none" style={styles.surfaceRim} />
                  <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                  <Text style={styles.articleTag}>{article.tag}</Text>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleBody}>{article.body}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>MedSpa</Text>
              <View style={styles.clinicCard}>
                <View pointerEvents="none" style={styles.surfaceRim} />
                <View pointerEvents="none" style={styles.surfaceBlueAura} />
                <View pointerEvents="none" style={styles.cardChrome} />
                <Pressable style={styles.mapWrap} onPress={() => { void openClinicInMaps(); }}>
                  <MapView style={styles.mapView} initialRegion={clinicMapRegion}>
                    <Marker
                      coordinate={clinicCoordinates}
                      title={clinicProfile.name || 'MedSpa'}
                      description={clinicProfile.address || clinicProfile.city || 'Standort'}
                    />
                  </MapView>
                  <View style={styles.mapOpenHint}>
                    <Ionicons name="map-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.mapOpenHintText}>In Maps öffnen</Text>
                  </View>
                </Pressable>
                <Text style={styles.clinicName}>{clinicProfile.name}</Text>
                <View style={styles.clinicMetaRow}>
                  <Ionicons name="location-outline" size={14} color={THEME.mutedSoft} />
                  <Text style={styles.clinicMeta}>{clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}</Text>
                </View>
                <View style={styles.clinicMetaRow}>
                  <Ionicons name="time-outline" size={14} color={THEME.mutedSoft} />
                  <Text style={styles.clinicMeta}>{clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}</Text>
                </View>
                <Pressable
                  style={styles.callNowCta}
                  onPress={() => { void callClinicNow(); }}
                >
                  <Text style={styles.callNowCtaText}>Call now</Text>
                </Pressable>
                <Pressable style={styles.secondaryCta} onPress={() => switchMainTab('profile')}>
                  <Text style={styles.secondaryCtaText}>Profil & Mitgliedschaft öffnen</Text>
                </Pressable>
              </View>
            </View>
          )}

          {mainTab === 'shop' && (
            <View>
              <TopHeader
                title="Shop"
                clinicShortName={clinicProfile.shortName}
                onSearchPress={openHeaderSearch}
                onCartPress={openHeaderCart}
                cartCount={cartItems.length}
              />

              <View style={styles.shopTabsRow}>
                <ShopTabButton label="Browse" active={shopTab === 'browse'} onPress={() => setShopTab('browse')} />
                <ShopTabButton
                  label={shopMembershipTabLabel}
                  active={shopTab === 'membership'}
                  onPress={() => setShopTab('membership')}
                />
                <ShopTabButton
                  label="Treatments"
                  active={shopTab === 'treatments'}
                  onPress={() => setShopTab('treatments')}
                />
              </View>

              {shopTab === 'browse' && !selectedTreatment && (
                <View>
                  <View style={styles.shopPinkHeroCard}>
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.shopPinkLiquidShine,
                        {
                          transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                        },
                      ]}
                    />
                    <View pointerEvents="none" style={styles.shopPinkHeroGloss} />
                    <View pointerEvents="none" style={styles.shopPinkHeroPearl} />
                    <View pointerEvents="none" style={styles.shopPinkHeroGlow} />
                    <Text style={styles.shopPinkHeroTitle}>Treat today. Pay later. Earn rewards.</Text>
                    <Text style={styles.shopPinkHeroBody}>Kostenlose Treatments und exklusive Member-Vorteile.</Text>
                    <Pressable
                      style={styles.shopPinkHeroCta}
                      onPress={() => {
                        setShopTab('membership');
                      }}
                    >
                      <Text style={styles.shopPinkHeroCtaText}>Wie funktioniert es?</Text>
                    </Pressable>
                  </View>

                  <View style={styles.categoryGrid}>
                    {treatmentCategories.map((cat) => (
                      <Pressable
                        key={cat.id}
                        style={[styles.categoryTile, categoryId === cat.id && styles.categoryTileActive]}
                        onPress={() => setCategoryId(cat.id)}
                      >
                        <View pointerEvents="none" style={styles.categoryTileGloss} />
                        {categoryId === cat.id && <View pointerEvents="none" style={styles.categoryTileGlow} />}
                        <View
                          style={[
                            styles.categoryTileIconWrap,
                            categoryId === cat.id && styles.categoryTileIconWrapActive,
                          ]}
                        >
                          <Ionicons
                            name={categoryIconName(cat.id)}
                            size={20}
                            color={categoryId === cat.id ? THEME.ink : THEME.muted}
                          />
                        </View>
                        <Text style={[styles.categoryTileText, categoryId === cat.id && styles.categoryTileTextActive]}>
                          {cat.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.shopListTitle}>Alle "{selectedCategory?.label || categoryId}" treatments</Text>
                  <Text style={styles.shopListSubtitle}>{selectedCategoryMeta.description}</Text>
                  <View style={styles.treatmentGrid}>
                    {browseItems.map((item) => (
                      <TreatmentCard key={item.id} treatment={item} onPress={openTreatment} />
                    ))}
                  </View>
                  {browseItems.length === 0 && (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>Keine Behandlungen in dieser Kategorie</Text>
                      <Text style={styles.emptyBody}>Passe später den MedSpa-Katalog im Backend an.</Text>
                    </View>
                  )}
                </View>
              )}

              {shopTab === 'browse' && selectedTreatment && (
                <View style={styles.detailCard}>
                  <View pointerEvents="none" style={styles.cardChrome} />
                  <Pressable onPress={() => setSelectedTreatment(null)}>
                    <Text style={styles.backLink}>← Zurück</Text>
                  </Pressable>

                  {preferredTreatmentImage(selectedTreatment) ? (
                    <Image source={{ uri: preferredTreatmentImage(selectedTreatment) }} style={styles.detailImage} />
                  ) : (
                    <View style={styles.detailImageMock} />
                  )}

                  {Array.isArray(selectedTreatment.galleryUrls) && selectedTreatment.galleryUrls.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.detailGalleryRow}
                    >
                      {selectedTreatment.galleryUrls.slice(0, 6).map((url) => (
                        <Image key={`${selectedTreatment.id}-${url}`} source={{ uri: url }} style={styles.detailThumbImage} />
                      ))}
                    </ScrollView>
                  )}

                  <Text style={styles.detailTitle}>{selectedTreatment.name}</Text>
                  <Text style={styles.detailBody}>{selectedTreatment.description}</Text>
                  <Text style={styles.detailMeta}>⏱ {selectedTreatment.durationMinutes} Min / Behandlung</Text>
                  <View style={styles.detailQuoteCard}>
                    <Text style={styles.detailQuoteText}>
                      “{selectedTreatment.name} war schnell, präzise und deutlich angenehmer als erwartet.”
                    </Text>
                  </View>

                  <Text style={styles.sectionSubTitle}>Behandlungsplan wählen</Text>
                  <View style={styles.unitsRow}>
                    <Pressable
                      style={styles.unitsBtn}
                      onPress={() => setUnits((prev) => Math.max(1, prev - 1))}
                    >
                      <Text style={styles.unitsBtnText}>−</Text>
                    </Pressable>
                    <View style={styles.unitsValueWrap}>
                      <Text style={styles.unitsValue}>{units} Behandlung(en)</Text>
                    </View>
                    <Pressable style={styles.unitsBtn} onPress={() => setUnits((prev) => prev + 1)}>
                      <Text style={styles.unitsBtnText}>＋</Text>
                    </Pressable>
                  </View>

                  <View style={styles.detailPlanSummaryRow}>
                    <Text style={styles.detailPlanSummaryMain}>
                      {formatPrice((selectedTreatment.priceCents || 0) * units)}
                    </Text>
                    <Text style={styles.detailPlanSummaryDivider}>|</Text>
                    <Text style={styles.detailPlanSummaryMember}>
                      {hasActiveMembership
                        ? `Member: ${formatPrice(((selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents) || 0) * units)}`
                        : `Member: ${formatPrice((selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents) || 0)}`}
                    </Text>
                  </View>

                  <Text style={styles.priceLine}>Standard: {formatPrice(selectedTreatment.priceCents)}</Text>
                  <Text style={styles.priceLine}>Mitglied: {formatPrice(selectedTreatment.memberPriceCents ?? selectedTreatment.priceCents)}</Text>
                  {!hasActiveMembership && (
                    <Text style={styles.priceHint}>
                      Aktiviere eine Membership, um Member-Preise und inkludierte Treatments freizuschalten.
                    </Text>
                  )}

                  <Pressable
                    style={[styles.primaryCta, (cartSyncing || checkoutLoading) && styles.ctaDisabled]}
                    disabled={cartSyncing || checkoutLoading}
                    onPress={() => {
                      void addToCart();
                    }}
                  >
                    <Text style={styles.primaryCtaText}>{cartCtaLabel}</Text>
                  </Pressable>
                </View>
              )}

              {shopTab === 'membership' && (
                <View>
                  {memberships.map((plan) => {
                    const active =
                      membershipStatus?.status === 'active' && membershipStatus?.membershipId === plan.id;
                    const recovering =
                      membershipStatus?.status === 'past_due' && membershipStatus?.membershipId === plan.id;
                    const highlightedPerks = (Array.isArray(plan.perks) ? plan.perks : []).slice(0, 4);
                    const includedIds = Array.isArray(plan.includedTreatmentIds) ? plan.includedTreatmentIds : [];
                    const includedTreatments = treatments
                      .filter((item) => includedIds.includes(item.id))
                      .slice(0, 4);
                    const resultGallery = includedTreatments
                      .flatMap((item) => (Array.isArray(item.galleryUrls) ? item.galleryUrls.slice(0, 2) : []))
                      .filter(Boolean)
                      .slice(0, 6);
                    return (
                      <View
                        key={plan.id}
                        style={[styles.shopMembershipBlock, active && styles.shopMembershipBlockActive]}
                      >
                        <View pointerEvents="none" style={styles.surfaceRim} />
                        <View pointerEvents="none" style={styles.surfacePinkAura} />
                        <View style={styles.shopMembershipHero}>
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.shopMembershipLiquidShine,
                              {
                                transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                              },
                            ]}
                          />
                          <View pointerEvents="none" style={styles.shopMembershipHeroGloss} />
                          <View pointerEvents="none" style={styles.shopMembershipHeroPearl} />
                          <Text style={styles.shopMembershipHeroEyebrow}>MEMBERSHIP</Text>
                          <Text style={styles.shopMembershipHeroTitle}>{plan.name}</Text>
                          <Text style={styles.shopMembershipHeroBody}>
                            {highlightedPerks[0] || 'Exklusive Member-Vorteile mit monatlichem Mehrwert.'}
                          </Text>
                          <View style={styles.shopMembershipPriceRow}>
                            <Text style={styles.shopMembershipHeroPrice}>{formatPrice(plan.priceCents)} / Monat</Text>
                            {active && <Text style={styles.shopMembershipHeroBadge}>Aktiv</Text>}
                          </View>
                        </View>

                        <View style={styles.shopMembershipBenefitsGrid}>
                          {highlightedPerks.map((perk, index) => (
                            <View
                              key={`${plan.id}-perk-${index}`}
                              style={[
                                styles.shopMembershipBenefitCard,
                                index % 2 === 1 && styles.shopMembershipBenefitCardAlt,
                              ]}
                            >
                              <Text style={styles.shopMembershipBenefitText}>{perk}</Text>
                            </View>
                          ))}
                        </View>

                        <Text style={styles.shopMembershipIncludedTitle}>Inkludierte Treatments</Text>
                        {includedTreatments.length === 0 && (
                          <Text style={styles.shopMembershipIncludedEmpty}>
                            Dieses Paket enthält aktuell keine fixen Inklusiv-Treatments.
                          </Text>
                        )}
                        {includedTreatments.map((item) => (
                          <Pressable
                            key={`${plan.id}-${item.id}`}
                            style={styles.shopMembershipIncludedCard}
                            onPress={() => {
                              setShopTab('browse');
                              openTreatment(item);
                            }}
                          >
                            <View pointerEvents="none" style={styles.surfaceRimSoft} />
                            {preferredTreatmentImage(item) ? (
                              <Image source={{ uri: preferredTreatmentImage(item) }} style={styles.shopMembershipIncludedImage} />
                            ) : (
                              <View style={styles.shopMembershipIncludedImageMock} />
                            )}
                            <View style={styles.shopMembershipIncludedBody}>
                              <Text style={styles.shopMembershipIncludedName}>{item.name}</Text>
                              <Text style={styles.shopMembershipIncludedMeta}>1 Behandlung</Text>
                              <Text style={styles.shopMembershipIncludedLink}>Mehr über dieses Treatment</Text>
                            </View>
                          </Pressable>
                        ))}

                        {resultGallery.length > 0 && (
                          <View style={styles.shopMembershipResultsWrap}>
                            <Text style={styles.shopMembershipResultsTitle}>Member Results</Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.shopMembershipResultsRow}
                            >
                              {resultGallery.map((url, index) => (
                                <Image
                                  key={`${plan.id}-result-${index}`}
                                  source={{ uri: url }}
                                  style={styles.shopMembershipResultImage}
                                />
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        <Pressable
                          style={[styles.primaryCta, active && styles.secondaryCtaActive]}
                          disabled={membershipSyncing}
                          onPress={() => {
                            void activateMembership(plan.id);
                          }}
                        >
                          <Text style={styles.primaryCtaText}>
                            {active
                              ? 'Aktiv'
                              : recovering
                                ? 'Zahlung fehlgeschlagen – reaktivieren'
                                : membershipSyncing
                                  ? 'Wird aktiviert...'
                                  : 'Mitgliedschaft starten'}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}

              {shopTab === 'treatments' && (
                <View>
                  {treatments.map((item) => (
                    <View key={item.id} style={styles.treatmentListCard}>
                      <View pointerEvents="none" style={styles.surfaceRimSoft} />
                      <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                      <Text style={styles.treatmentListTitle}>{item.name}</Text>
                      <Text style={styles.treatmentListBody}>{item.description}</Text>
                      <Text style={styles.treatmentListMeta}>
                        ab {formatPrice(item.priceCents)} • {item.durationMinutes} Min
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {hasCart && (
                <View style={styles.cartBox}>
                  <View pointerEvents="none" style={styles.surfaceRim} />
                  <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                  <View pointerEvents="none" style={styles.cartBoxGlow} />
                  <Text style={styles.cartTitle}>Warenkorb ({cartItems.length})</Text>
                  {cartItems.slice(0, 3).map((item) => (
                    <Text key={item.id} style={styles.cartItem}>
                      {item.name} • {item.units}x • {formatPrice(item.totalCents)}
                    </Text>
                  ))}
                  <Text style={styles.cartTotal}>Gesamt: {formatPrice(totalCartCents)}</Text>
                  <View style={styles.checkoutMethodWrap}>
                    <Text style={styles.checkoutMethodLabel}>Zahlart</Text>
                    <View style={styles.checkoutMethodRow}>
                      {CHECKOUT_METHOD_OPTIONS.map((option) => {
                        const active = selectedCheckoutMethod === option.id;
                        return (
                          <Pressable
                            key={`box-${option.id}`}
                            style={[styles.checkoutMethodChip, active && styles.checkoutMethodChipActive]}
                            onPress={() => setSelectedCheckoutMethod(option.id)}
                          >
                            <Text style={[styles.checkoutMethodChipText, active && styles.checkoutMethodChipTextActive]}>
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  <Pressable
                    style={[styles.primaryCta, (checkoutLoading || cartSyncing) && styles.ctaDisabled]}
                    disabled={checkoutLoading || cartSyncing}
                    onPress={() => {
                      void runCheckout();
                    }}
                  >
                    <Text style={styles.primaryCtaText}>{checkoutCtaLabel}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {mainTab === 'scan' && (
            <View>
              <TopHeader
                title="Scan"
                clinicShortName={clinicProfile.shortName}
                onSearchPress={openHeaderSearch}
                onCartPress={openHeaderCart}
                cartCount={cartItems.length}
              />

              <View style={styles.scanCard}>
                <View pointerEvents="none" style={styles.surfaceRim} />
                <View pointerEvents="none" style={styles.surfaceBlueAura} />
                <View pointerEvents="none" style={styles.cardChrome} />
                <Text style={styles.scanTitle}>Check-in QR</Text>
                <Text style={styles.scanBody}>
                  Scanne beim Empfang deinen App-Code. So werden Besuche sauber erfasst und Rewards automatisch gutgeschrieben.
                </Text>
                <View style={styles.scanQrMock}>
                  <View pointerEvents="none" style={styles.scanQrGloss} />
                  <View pointerEvents="none" style={styles.scanQrGlow} />
                  <Text style={styles.scanQrText}>{clinicProfile.shortName || 'APP'}-{String(points).slice(0, 4)}</Text>
                </View>
                <Pressable style={styles.primaryCta} onPress={checkInViaScan}>
                  <Text style={styles.primaryCtaText}>Scan bestätigen (Demo)</Text>
                </Pressable>
              </View>

              <View style={styles.inlineInfoBox}>
                <Text style={styles.inlineInfoTitle}>So funktioniert es live</Text>
                <Text style={styles.inlineInfoText}>• Empfang scannt den QR aus der App</Text>
                <Text style={styles.inlineInfoText}>• Besuch wird in der MedSpa-Historie verbucht</Text>
                <Text style={styles.inlineInfoText}>• Punkte werden automatisch gutgeschrieben</Text>
              </View>
            </View>
          )}

          {mainTab === 'rewards' && (
            <View>
              <TopHeader
                title="Rewards"
                clinicShortName={clinicProfile.shortName}
                onSearchPress={openHeaderSearch}
                onCartPress={openHeaderCart}
                cartCount={cartItems.length}
              />

              <View style={styles.rewardsBalanceCard}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.rewardsLiquidShine,
                    {
                      transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
                    },
                  ]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.rewardsOrbit,
                    {
                      transform: [
                        {
                          translateY: floatingAuraAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                          }),
                        },
                        {
                          translateX: floatingAuraAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 6],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.rewardsOrbitCore} />
                  <View style={styles.rewardsOrbitRing} />
                </Animated.View>
                <View pointerEvents="none" style={styles.rewardsBalanceGloss} />
                <View pointerEvents="none" style={styles.rewardsBalancePearl} />
                <View pointerEvents="none" style={styles.rewardsBalanceGlow} />
                <View pointerEvents="none" style={styles.rewardsBalanceGlowSecondary} />
                <Text style={styles.rewardsBalanceLogo}>O</Text>
                <Text style={styles.rewardsBalanceLabel}>Loyalty Points</Text>
                <View style={styles.rewardsCardStatsRow}>
                  <View style={styles.rewardsCardStatItem}>
                    <Text style={styles.rewardsCardStatValue}>{points}</Text>
                    <Text style={styles.rewardsCardStatLabel}>Punkte</Text>
                  </View>
                  <View style={styles.rewardsCardStatItem}>
                    <Text style={styles.rewardsCardStatValue}>{rewardHistoryItems.length}</Text>
                    <Text style={styles.rewardsCardStatLabel}>Aktivitäten</Text>
                  </View>
                </View>
                <View style={styles.rewardsBalanceFooter}>
                  <View>
                    <Text style={styles.rewardsBalanceMember}>{patientGuestMode ? 'Guest' : 'Member'}</Text>
                    <Text style={styles.rewardsBalanceJoined}>Joined now</Text>
                  </View>
                  <View style={styles.rewardsBalanceRight}>
                    <Text style={styles.rewardsBalanceWallet}>{formatPrice(walletCents)}</Text>
                    <Text style={styles.rewardsBalanceCash}>{clinicProfile.shortName || 'APP'} Cash</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rewardsHeaderRow}>
                <Text style={styles.rewardsHeaderTitle}>Rewards</Text>
                <Pressable onPress={() => setRewardsView('past')}>
                  <Text style={styles.rewardsHeaderLink}>Mehr sehen ›</Text>
                </Pressable>
              </View>

              <View style={styles.rewardsSegmentRow}>
                <Pressable
                  style={[styles.rewardsSegmentBtn, rewardsView === 'active' && styles.rewardsSegmentBtnActive]}
                  onPress={() => setRewardsView('active')}
                >
                  <Text
                    style={[
                      styles.rewardsSegmentText,
                      rewardsView === 'active' && styles.rewardsSegmentTextActive,
                    ]}
                  >
                    Aktiv
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.rewardsSegmentBtn, rewardsView === 'past' && styles.rewardsSegmentBtnActive]}
                  onPress={() => setRewardsView('past')}
                >
                  <Text
                    style={[
                      styles.rewardsSegmentText,
                      rewardsView === 'past' && styles.rewardsSegmentTextActive,
                    ]}
                  >
                    Vergangen
                  </Text>
                </Pressable>
              </View>

              {rewardsView === 'active' && (
                <View>
                  <Text style={styles.rewardsSectionTitle}>Mehr Punkte sammeln?</Text>
                  {rewardActions.map((action) => (
                    <View key={action.id} style={styles.rewardsActionRow}>
                      <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                      <View style={styles.rewardsActionLeft}>
                        <View style={styles.rewardsActionIconWrap}>
                          <Ionicons name={rewardActionIcon(action.id)} size={17} color={THEME.brandStrong} />
                        </View>
                        <Text style={styles.rewardsActionLabel}>{action.label}</Text>
                      </View>
                      <Pressable style={styles.rewardsActionBtn} onPress={() => claimActionPoints(action)}>
                        <Text style={styles.rewardsActionBtnText}>+{action.points} Punkte</Text>
                      </Pressable>
                    </View>
                  ))}

                  <Text style={styles.rewardsSectionTitle}>Punkte einlösen</Text>
                  {rewardRedeems.map((item) => (
                    <View key={item.id} style={styles.rewardsRedeemRow}>
                      <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                      <View>
                        <Text style={styles.rewardsRedeemLabel}>{item.label}</Text>
                        <Text style={styles.rewardsRedeemHint}>{item.requiredPoints} Punkte</Text>
                      </View>
                      <Pressable
                        style={[
                          styles.rewardsRedeemBtn,
                          points < item.requiredPoints && styles.rewardsRedeemBtnDisabled,
                        ]}
                        disabled={points < item.requiredPoints}
                        onPress={() => redeemReward(item)}
                      >
                        <Text style={styles.rewardsRedeemBtnText}>Einlösen</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {rewardsView === 'past' && (
                <View style={styles.rewardsPastList}>
                  {rewardHistoryItems.length === 0 && (
                    <Text style={styles.rewardsPastEmpty}>Keine Rewards in diesem Bereich.</Text>
                  )}
                  {rewardHistoryItems.map((entry) => (
                    <View key={entry.id} style={styles.rewardsPastItem}>
                      <View pointerEvents="none" style={styles.surfaceGlossStrip} />
                      <Text style={styles.rewardsPastTitle}>{entry.title}</Text>
                      <Text style={styles.rewardsPastMeta}>{formatDate(entry.createdAt)}</Text>
                      {'points' in entry && (
                        <Text style={styles.rewardsPastMeta}>+{entry.points} Punkte</Text>
                      )}
                      {'amount' in entry && (
                        <Text style={styles.rewardsPastMeta}>{formatPrice(entry.amount)}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {mainTab === 'profile' && (
            <View>
              <TopHeader
                title="Konto"
                clinicShortName={clinicProfile.shortName}
                onSearchPress={openHeaderSearch}
                onCartPress={openHeaderCart}
                cartCount={cartItems.length}
              />

              <View style={styles.segmentRow}>
                <TabButton
                  label="Behandlungen"
                  active={profileTab === 'behandlungen'}
                  onPress={() => setProfileTab('behandlungen')}
                />
                <TabButton
                  label="Membership"
                  active={profileTab === 'membership'}
                  onPress={() => setProfileTab('membership')}
                />
                <TabButton
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
                      <Pressable
                        style={styles.profileEmptyCta}
                        onPress={() => {
                          setShopTab('browse');
                          switchMainTab('shop');
                        }}
                      >
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
                    {hasActiveMembership ? currentMembership.name : 'Keine aktive Membership'}
                  </Text>
                  <Text style={styles.membershipPrice}>
                    Status: {membershipStatusText}
                    {membershipStatus?.nextChargeAt ? ` • Nächste Abbuchung: ${formatDate(membershipStatus.nextChargeAt)}` : ''}
                  </Text>
                  {hasActiveMembership ? (
                    <View>
                      <Text style={styles.membershipPerk}>Inklusive Treatments:</Text>
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
                      <Text style={styles.profileEmptyMembershipText}>Keine aktive Membership</Text>
                      <Pressable
                        style={styles.profileEmptyCta}
                        onPress={() => {
                          setShopTab('membership');
                          switchMainTab('shop');
                        }}
                      >
                        <Text style={styles.profileEmptyCtaText}>Memberships ansehen</Text>
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
                  <Pressable
                    style={styles.secondaryCta}
                    onPress={async () => {
                      try {
                        await loadClinicBundle();
                      } catch (error) {
                        Alert.alert('MedSpa-Daten konnten nicht geladen werden', String(error?.message || error));
                      }
                    }}
                  >
                    <Text style={styles.secondaryCtaText}>MedSpa-Daten neu laden</Text>
                  </Pressable>
                  <Pressable
                    style={styles.secondaryCta}
                    onPress={() => {
                      setOnboardingBaseUrl(analyticsBaseUrl || onboardingBaseUrl);
                      setClinicSearchQuery(clinicLookupName || clinicSearchQuery);
                      setClinicSearchResults([]);
                      setShowOnboarding(true);
                    }}
                  >
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
                    Membership-Konto: {String(settingsEmail || '').trim() || 'nicht gesetzt'}
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
          )}

          {!!lastAction && (
            <View style={styles.lastActionBox}>
              <Text style={styles.lastActionText}>{lastAction}</Text>
            </View>
          )}
          </ScrollView>
        </Animated.View>

        {headerSearchOpen && (
          <View style={styles.overlayLayer} pointerEvents="box-none">
            <Pressable style={styles.overlayBackdrop} onPress={closeHeaderSearch} />
            <View style={styles.searchOverlayCard}>
              <View pointerEvents="none" style={styles.surfaceRim} />
              <View pointerEvents="none" style={styles.overlayCardGloss} />
              <View style={styles.searchOverlayHeader}>
                <Text style={styles.searchOverlayTitle}>Suchen</Text>
                <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderSearch}>
                  <Ionicons name="close" size={20} color={THEME.inkSoft} />
                </Pressable>
              </View>
              <TextInput
                style={styles.searchOverlayInput}
                value={headerSearchQuery}
                onChangeText={setHeaderSearchQuery}
                placeholder="Treatments, Memberships, Artikel"
                placeholderTextColor={THEME.muted}
                autoCorrect={false}
                autoCapitalize="none"
              />

              {!headerSearchQuery.trim() && (
                <Text style={styles.searchOverlayHint}>
                  Tipp: Suche nach „Laser“, „Mikrodermabrasion“ oder „Silber“.
                </Text>
              )}

              {!!headerSearchQuery.trim() && globalSearchResults.length === 0 && (
                <Text style={styles.searchOverlayHint}>Keine Ergebnisse gefunden.</Text>
              )}

              {!!headerSearchQuery.trim() && globalSearchResults.length > 0 && (
                <ScrollView
                  style={styles.searchOverlayResults}
                  contentContainerStyle={styles.searchOverlayResultsContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {globalSearchResults.map((item) => (
                    <Pressable
                      key={`${item.type}-${item.id}`}
                      style={styles.searchOverlayRow}
                      onPress={() => onGlobalSearchSelect(item)}
                    >
                      <View style={styles.searchOverlayIconWrap}>
                        <Ionicons name={searchResultIcon(item.type)} size={16} color={THEME.accent} />
                      </View>
                      <View style={styles.searchOverlayMain}>
                        <Text style={styles.searchOverlayRowTitle}>{item.title}</Text>
                        <Text style={styles.searchOverlayRowMeta}>{item.subtitle}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={THEME.mutedSoft} />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        {cartSheetOpen && (
          <View style={styles.overlayLayer} pointerEvents="box-none">
            <Pressable style={styles.overlayBackdrop} onPress={closeHeaderCart} />
            <View style={styles.cartOverlayCard}>
              <View pointerEvents="none" style={styles.surfaceRim} />
              <View pointerEvents="none" style={styles.overlayCardGloss} />
              <View style={styles.searchOverlayHeader}>
                <Text style={styles.searchOverlayTitle}>Warenkorb</Text>
                <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderCart}>
                  <Ionicons name="close" size={20} color={THEME.inkSoft} />
                </Pressable>
              </View>

              {cartItems.length === 0 ? (
                <Text style={styles.searchOverlayHint}>Dein Warenkorb ist aktuell leer.</Text>
              ) : (
                <ScrollView
                  style={styles.searchOverlayResults}
                  contentContainerStyle={styles.searchOverlayResultsContent}
                >
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.cartOverlayRow}>
                      <View style={styles.cartOverlayMain}>
                        <Text style={styles.cartOverlayName}>{item.name}</Text>
                        <Text style={styles.cartOverlayMeta}>Einzelpreis: {formatPrice(item.unitCents)}</Text>
                        <View style={styles.cartOverlayControlsRow}>
                          <Pressable
                            style={styles.cartOverlayStepBtn}
                            onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) - 1)}
                          >
                            <Text style={styles.cartOverlayStepBtnText}>−</Text>
                          </Pressable>
                          <Text style={styles.cartOverlayUnitsText}>{Math.max(1, Number(item.units || 1))}</Text>
                          <Pressable
                            style={styles.cartOverlayStepBtn}
                            onPress={() => updateCartItemUnits(item.id, Number(item.units || 1) + 1)}
                          >
                            <Text style={styles.cartOverlayStepBtnText}>+</Text>
                          </Pressable>
                          <Pressable style={styles.cartOverlayRemoveBtn} onPress={() => removeCartItem(item.id)}>
                            <Ionicons name="trash-outline" size={14} color={THEME.brandStrong} />
                            <Text style={styles.cartOverlayRemoveText}>Entfernen</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Text style={styles.cartOverlayPrice}>{formatPrice(item.totalCents)}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={styles.checkoutMethodWrap}>
                <Text style={styles.checkoutMethodLabel}>Zahlart</Text>
                <View style={styles.checkoutMethodRow}>
                  {CHECKOUT_METHOD_OPTIONS.map((option) => {
                    const active = selectedCheckoutMethod === option.id;
                    return (
                      <Pressable
                        key={`overlay-${option.id}`}
                        style={[styles.checkoutMethodChip, active && styles.checkoutMethodChipActive]}
                        onPress={() => setSelectedCheckoutMethod(option.id)}
                      >
                        <Text style={[styles.checkoutMethodChipText, active && styles.checkoutMethodChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.cartOverlayFooter}>
                <Text style={styles.cartOverlayTotalLabel}>Gesamt</Text>
                <Text style={styles.cartOverlayTotalValue}>{formatPrice(totalCartCents)}</Text>
              </View>

              <Pressable
                style={[styles.primaryCta, (checkoutLoading || cartSyncing || cartItems.length === 0) && styles.ctaDisabled]}
                disabled={checkoutLoading || cartSyncing || cartItems.length === 0}
                onPress={() => {
                  void runCheckout();
                }}
              >
                <Text style={styles.primaryCtaText}>{checkoutCtaLabel}</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.bottomBar}>
          <View pointerEvents="none" style={styles.bottomBarGlow} />
          <View pointerEvents="none" style={styles.bottomBarGloss} />
          <BottomTab label="Home" active={mainTab === 'home'} onPress={() => switchMainTab('home')} />
          <BottomTab label="Shop" active={mainTab === 'shop'} onPress={() => switchMainTab('shop')} />
          <BottomTab label="Scan" active={mainTab === 'scan'} onPress={() => switchMainTab('scan')} />
          <BottomTab label="Rewards" active={mainTab === 'rewards'} onPress={() => switchMainTab('rewards')} />
          <BottomTab label="Profil" active={mainTab === 'profile'} onPress={() => switchMainTab('profile')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.backgroundSoft,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.backgroundSoft,
    overflow: 'hidden',
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  ambientWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  ambientBeam: {
    position: 'absolute',
    top: -56,
    left: -44,
    right: -44,
    height: 220,
    borderRadius: 80,
    backgroundColor: 'transparent',
    transform: [{ rotate: '-8deg' }],
  },
  ambientLensTop: {
    position: 'absolute',
    top: -110,
    left: -72,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  ambientLensBottom: {
    position: 'absolute',
    bottom: -140,
    right: -90,
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  ambientOrbA: {
    position: 'absolute',
    top: -16,
    right: -78,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  ambientOrbB: {
    position: 'absolute',
    top: 192,
    left: -82,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  ambientOrbC: {
    position: 'absolute',
    bottom: 82,
    right: -24,
    width: 196,
    height: 196,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  bootTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    letterSpacing: -0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  bootBody: {
    marginTop: 8,
    color: THEME.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 34,
    padding: 24,
    marginTop: 4,
    shadowOpacity: 0.28,
    ...SOFT_CARD_SHADOW,
  },
  cardChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  cardChromeSecondary: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 120,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    transform: [{ rotate: '8deg' }],
  },
  onboardingEyebrow: {
    color: THEME.brandStrong,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 10,
    fontSize: 11,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1,
    color: THEME.ink,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingBody: {
    color: THEME.inkSoft,
    lineHeight: 23,
    marginBottom: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  mainAnimatedPanel: {
    flex: 1,
  },
  onboardingScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 56,
  },
  onboardingHero: {
    position: 'relative',
    minHeight: 168,
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingRight: 130,
  },
  onboardingHeroVisual: {
    position: 'absolute',
    top: 0,
    right: -8,
    width: 154,
    height: 154,
  },
  onboardingLiquidShine: {
    position: 'absolute',
    top: -18,
    left: -180,
    width: 88,
    height: 208,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  onboardingHeroGlass: {
    position: 'absolute',
    top: 18,
    right: 0,
    width: 128,
    height: 128,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    shadowColor: '#70D9FF',
    shadowOpacity: 0.34,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },
  onboardingHeroBubbleLarge: {
    position: 'absolute',
    top: 4,
    right: 42,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(75,203,255,0.46)',
  },
  onboardingHeroBubbleSmall: {
    position: 'absolute',
    bottom: 4,
    left: 10,
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: 'rgba(241,139,207,0.44)',
  },
  onboardingHeroChip: {
    alignSelf: 'flex-start',
    backgroundColor: SURFACE_PANEL,
    color: THEME.brandStrong,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingHeroTitle: {
    color: THEME.ink,
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
    marginBottom: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingHeroBody: {
    color: THEME.inkSoft,
    lineHeight: 23,
    fontSize: 15,
    maxWidth: 480,
    fontFamily: UI_FONT_FAMILY,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 136,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOFT_CARD_SHADOW,
  },
  headerAvatarText: {
    color: '#1B6CB8',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  headerClinic: {
    alignSelf: 'flex-start',
    fontSize: 11,
    letterSpacing: 1,
    color: THEME.brandStrong,
    marginTop: 6,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 38,
    letterSpacing: -1,
    fontFamily: UI_FONT_FAMILY,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButtonWrap: {
    backgroundColor: SURFACE_RAISED,
    borderColor: BORDER_TINT,
    borderWidth: 1,
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#86DFFF',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: THEME.brandStrong,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: 'flex-start',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.overlay,
  },
  searchOverlayCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 78,
    marginHorizontal: 12,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 30,
    padding: 18,
    maxHeight: 430,
    shadowColor: '#3C7CC8',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  cartOverlayCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 78,
    marginHorizontal: 12,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 30,
    padding: 18,
    maxHeight: 500,
    shadowColor: '#3C7CC8',
    shadowOpacity: 0.18,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  surfaceRim: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  surfaceRimSoft: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.66)',
  },
  surfaceBlueAura: {
    position: 'absolute',
    top: -26,
    right: -22,
    width: 122,
    height: 122,
    borderRadius: 999,
    backgroundColor: 'rgba(102, 221, 255, 0.16)',
  },
  surfacePinkAura: {
    position: 'absolute',
    bottom: -28,
    left: -16,
    width: 112,
    height: 112,
    borderRadius: 999,
    backgroundColor: 'rgba(241, 139, 207, 0.12)',
  },
  overlayCardGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 86,
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  searchOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  searchOverlayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    fontFamily: UI_FONT_FAMILY,
  },
  overlayCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE_PANEL,
  },
  searchOverlayInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_TINT,
    borderRadius: 18,
    paddingHorizontal: 14,
    color: THEME.ink,
    marginBottom: 8,
  },
  searchOverlayHint: {
    color: THEME.muted,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 21,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayResults: {
    maxHeight: 280,
  },
  searchOverlayResultsContent: {
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
  },
  searchOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: SURFACE_PANEL,
  },
  searchOverlayIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: 'rgba(71,196,234,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchOverlayMain: {
    flex: 1,
    gap: 1,
  },
  searchOverlayRowTitle: {
    color: THEME.ink,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayRowMeta: {
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: SURFACE_PANEL,
  },
  cartOverlayMain: {
    flex: 1,
    marginRight: 10,
  },
  cartOverlayName: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 1,
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayMeta: {
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayPrice: {
    color: THEME.ink,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayControlsRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cartOverlayStepBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'rgba(255,255,255,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartOverlayStepBtnText: {
    color: THEME.ink,
    fontSize: 16,
    fontWeight: '800',
    marginTop: -1,
  },
  cartOverlayUnitsText: {
    minWidth: 20,
    textAlign: 'center',
    color: THEME.ink,
    fontWeight: '700',
  },
  cartOverlayRemoveBtn: {
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    minHeight: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6D8D8',
    backgroundColor: '#FBF2F3',
  },
  cartOverlayRemoveText: {
    color: THEME.brandStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutMethodWrap: {
    marginTop: 4,
    marginBottom: 6,
  },
  checkoutMethodLabel: {
    color: THEME.muted,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  checkoutMethodRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  checkoutMethodChip: {
    minHeight: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutMethodChipActive: {
    borderColor: '#D7E2F0',
    backgroundColor: THEME.accentSoft,
  },
  checkoutMethodChipText: {
    color: THEME.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutMethodChipTextActive: {
    color: THEME.accent,
  },
  cartOverlayFooter: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 12,
  },
  cartOverlayTotalLabel: {
    color: THEME.muted,
    fontWeight: '700',
  },
  cartOverlayTotalValue: {
    color: THEME.ink,
    fontWeight: '800',
    fontSize: 20,
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1087FF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.64)',
    borderRadius: 34,
    padding: 24,
    paddingRight: 126,
    marginBottom: 18,
    ...SOFT_CARD_SHADOW,
  },
  heroLiquidShine: {
    position: 'absolute',
    top: -26,
    left: -200,
    width: 108,
    height: 286,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  heroAeroCluster: {
    position: 'absolute',
    top: 58,
    right: 14,
    width: 114,
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAeroHalo: {
    position: 'absolute',
    width: 114,
    height: 114,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroAeroCore: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
  },
  heroAeroRing: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.46)',
  },
  heroAeroDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.88)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  heroGlossArc: {
    position: 'absolute',
    top: -12,
    left: -14,
    right: 36,
    height: 92,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.42)',
    transform: [{ rotate: '-5deg' }],
  },
  heroGlassPill: {
    position: 'absolute',
    top: 18,
    right: 22,
    width: 108,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.56)',
  },
  heroPearl: {
    position: 'absolute',
    top: 56,
    right: 14,
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -22,
    right: -18,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(241,139,207,0.48)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 156,
    height: 156,
    borderRadius: 999,
    backgroundColor: 'rgba(106,241,222,0.44)',
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#D7DEEA',
    marginBottom: 10,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: '#F7FBFF',
    marginBottom: 10,
    letterSpacing: -0.9,
    fontFamily: UI_FONT_FAMILY,
  },
  heroBody: {
    color: '#C7D0DC',
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDFEFF',
    borderColor: 'rgba(193,224,247,0.92)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#61E8FF',
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    overflow: 'hidden',
  },
  heroCtaText: {
    color: THEME.ink,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  financeBanner: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: 'rgba(212,226,240,0.98)',
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  financeGlow: {
    position: 'absolute',
    top: -26,
    right: -16,
    width: 116,
    height: 116,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.32)',
  },
  financeTitle: {
    color: THEME.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  financeBody: {
    color: THEME.muted,
    lineHeight: 22,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: THEME.ink,
    marginTop: 12,
    marginBottom: 14,
    letterSpacing: -0.8,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionSubTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.4,
    fontFamily: UI_FONT_FAMILY,
  },
  articleCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_RAISED,
    borderColor: BORDER_TINT,
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  articleTag: {
    alignSelf: 'flex-start',
    color: THEME.brandStrong,
    fontWeight: '700',
    marginBottom: 10,
    backgroundColor: THEME.brandSoft,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    letterSpacing: 0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
    letterSpacing: -0.3,
    fontFamily: UI_FONT_FAMILY,
  },
  articleBody: {
    color: THEME.muted,
    lineHeight: 22,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_RAISED,
    borderColor: BORDER_TINT,
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.13,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  mapWrap: {
    height: 190,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  mapView: {
    height: '100%',
    width: '100%',
  },
  mapOpenHint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(20, 29, 43, 0.82)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  mapOpenHintText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicMeta: {
    color: THEME.muted,
    marginBottom: 4,
    flex: 1,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  callNowCta: {
    marginTop: 12,
    backgroundColor: '#2C87E4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.44)',
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#59DDF8',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  callNowCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  segmentRow: {
    backgroundColor: SURFACE_SOFT,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 24,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    ...SOFT_CARD_SHADOW,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    shadowColor: '#5DCBEE',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  segmentText: {
    color: THEME.muted,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  segmentTextActive: {
    color: THEME.ink,
    fontWeight: '800',
  },
  shopTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 24,
    backgroundColor: SURFACE_SOFT,
    padding: 6,
    marginBottom: 16,
    ...SOFT_CARD_SHADOW,
  },
  shopTabBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  shopTabBtnActive: {
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
  },
  shopTabText: {
    color: THEME.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 0,
    fontFamily: UI_FONT_FAMILY,
  },
  shopTabTextActive: {
    color: THEME.ink,
    fontWeight: '800',
  },
  shopTabUnderline: {
    height: 0,
    width: 0,
  },
  shopTabUnderlineActive: {
    backgroundColor: 'transparent',
  },
  shopPinkHeroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: '#FFF0FA',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    marginBottom: 18,
    ...SOFT_CARD_SHADOW,
  },
  shopPinkLiquidShine: {
    position: 'absolute',
    top: -24,
    left: -190,
    width: 96,
    height: 230,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  shopPinkHeroGloss: {
    position: 'absolute',
    top: -14,
    left: -10,
    right: 48,
    height: 84,
    borderRadius: 52,
    backgroundColor: 'rgba(255,255,255,0.34)',
    transform: [{ rotate: '-6deg' }],
  },
  shopPinkHeroPearl: {
    position: 'absolute',
    bottom: -24,
    right: -10,
    width: 122,
    height: 122,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  shopPinkHeroGlow: {
    position: 'absolute',
    top: -14,
    right: -10,
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: 'rgba(241,139,207,0.22)',
  },
  shopPinkHeroTitle: {
    color: THEME.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.8,
    fontFamily: UI_FONT_FAMILY,
  },
  shopPinkHeroBody: {
    color: THEME.muted,
    marginBottom: 14,
    lineHeight: 21,
    fontFamily: UI_FONT_FAMILY,
  },
  shopPinkHeroCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#2E90E8',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#65DEFF',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    overflow: 'hidden',
  },
  shopPinkHeroCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTile: {
    position: 'relative',
    overflow: 'hidden',
    width: '31.5%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    ...SOFT_CARD_SHADOW,
  },
  categoryTileActive: {
    borderColor: BORDER_TINT,
    backgroundColor: 'rgba(195,246,255,0.98)',
    shadowColor: '#59DDF8',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  categoryTileGloss: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: 22,
    height: 44,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.40)',
    transform: [{ rotate: '-6deg' }],
  },
  categoryTileGlow: {
    position: 'absolute',
    top: -10,
    right: -8,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.22)',
  },
  categoryTileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_PANEL,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileIconWrapActive: {
    borderColor: BORDER_TINT,
    backgroundColor: SURFACE_RAISED,
  },
  categoryTileText: {
    color: THEME.inkSoft,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  categoryTileTextActive: {
    color: THEME.ink,
    fontWeight: '800',
  },
  shopListTitle: {
    color: THEME.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.9,
    fontFamily: UI_FONT_FAMILY,
  },
  shopListSubtitle: {
    color: THEME.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  treatmentCard: {
    position: 'relative',
    width: '48.2%',
    marginBottom: 14,
    borderRadius: 26,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    ...SOFT_CARD_SHADOW,
  },
  treatmentCardGloss: {
    position: 'absolute',
    top: -8,
    left: -6,
    right: 30,
    height: 54,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.42)',
    zIndex: 2,
    transform: [{ rotate: '-6deg' }],
  },
  treatmentCardGlow: {
    position: 'absolute',
    top: -12,
    right: -8,
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.24)',
    zIndex: 1,
  },
  treatmentCardPearl: {
    position: 'absolute',
    bottom: 34,
    right: -12,
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: 'rgba(241,139,207,0.18)',
    zIndex: 1,
  },
  treatmentImageMock: {
    height: 132,
    backgroundColor: THEME.surfaceMuted,
  },
  treatmentImageReal: {
    height: 132,
    width: '100%',
    backgroundColor: THEME.surfaceMuted,
  },
  treatmentCardBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentDescription: {
    color: THEME.muted,
    lineHeight: 19,
    minHeight: 42,
    fontSize: 13,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentPrice: {
    color: THEME.ink,
    fontWeight: '800',
    fontSize: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  detailCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 32,
    padding: 20,
    ...SOFT_CARD_SHADOW,
  },
  detailImage: {
    width: '100%',
    height: 228,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: THEME.surfaceMuted,
  },
  detailImageMock: {
    width: '100%',
    height: 228,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: THEME.surfaceMuted,
  },
  detailGalleryRow: {
    gap: 10,
    paddingBottom: 8,
    marginBottom: 6,
  },
  detailThumbImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: THEME.surfaceMuted,
  },
  backLink: {
    color: THEME.accent,
    fontWeight: '700',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 40,
    marginBottom: 10,
    letterSpacing: -0.8,
    fontFamily: UI_FONT_FAMILY,
  },
  detailBody: {
    color: THEME.muted,
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  detailMeta: {
    color: THEME.inkSoft,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  detailQuoteCard: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_TINT,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailQuoteText: {
    color: THEME.inkSoft,
    fontWeight: '600',
    lineHeight: 21,
    fontFamily: UI_FONT_FAMILY,
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  unitsBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitsBtnText: {
    fontSize: 24,
    color: THEME.ink,
    marginTop: -1,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  unitsValueWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 16,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: SURFACE_PANEL,
  },
  unitsValue: {
    color: THEME.ink,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  detailPlanSummaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  detailPlanSummaryMain: {
    color: THEME.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  detailPlanSummaryDivider: {
    color: THEME.mutedSoft,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  detailPlanSummaryMember: {
    color: THEME.brandStrong,
    fontWeight: '700',
  },
  priceLine: {
    color: THEME.muted,
    marginBottom: 5,
  },
  priceHint: {
    color: THEME.brandStrong,
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  primaryCta: {
    marginTop: 10,
    backgroundColor: '#2A96EA',
    borderWidth: 1,
    borderColor: 'rgba(210,241,255,0.96)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#51D8FF',
    shadowOpacity: 0.48,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
    overflow: 'hidden',
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  secondaryCta: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(204,224,241,0.96)',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#8CDEFF',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: 'hidden',
  },
  secondaryCtaActive: {
    backgroundColor: '#356AE7',
    borderColor: 'rgba(255,255,255,0.36)',
  },
  secondaryCtaText: {
    color: THEME.ink,
    fontWeight: '800',
  },
  secondaryCtaTextActive: {
    color: '#fff',
  },
  membershipCard: {
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 28,
    padding: 16,
    marginBottom: 12,
    ...SOFT_CARD_SHADOW,
  },
  membershipCardActive: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,247,253,0.96)',
    borderColor: BORDER_LIGHT,
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginBottom: 14,
    ...SOFT_CARD_SHADOW,
  },
  membershipName: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 5,
    letterSpacing: -0.4,
    fontFamily: UI_FONT_FAMILY,
  },
  membershipPrice: {
    color: THEME.brandStrong,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  membershipPerk: {
    color: THEME.muted,
    marginBottom: 4,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipBlock: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(212,226,240,0.98)',
    borderRadius: 30,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#355A90',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  shopMembershipBlockActive: {
    borderColor: '#D7E1EE',
    shadowColor: '#243247',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  shopMembershipHero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#2D73E2',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.56)',
    marginBottom: 14,
  },
  shopMembershipLiquidShine: {
    position: 'absolute',
    top: -26,
    left: -190,
    width: 98,
    height: 232,
    borderRadius: 68,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  shopMembershipHeroGloss: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: 40,
    height: 78,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.40)',
    transform: [{ rotate: '-5deg' }],
  },
  shopMembershipHeroPearl: {
    position: 'absolute',
    bottom: -26,
    right: -12,
    width: 118,
    height: 118,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  shopMembershipHeroEyebrow: {
    color: '#D7DEEA',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 1,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipHeroTitle: {
    color: '#F7FBFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.8,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipHeroBody: {
    color: '#C8D2DE',
    lineHeight: 21,
    marginBottom: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  shopMembershipHeroPrice: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipHeroBadge: {
    color: THEME.brandStrong,
    backgroundColor: THEME.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
    overflow: 'hidden',
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopMembershipBenefitCard: {
    width: '48.4%',
    marginBottom: 10,
  },
  shopMembershipBenefitCardAlt: {
    opacity: 1,
  },
  shopMembershipBenefitText: {
    color: THEME.inkSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    backgroundColor: SURFACE_PANEL,
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipIncludedTitle: {
    color: THEME.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipIncludedEmpty: {
    color: THEME.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  shopMembershipIncludedCard: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 20,
    backgroundColor: SURFACE_PANEL,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  shopMembershipIncludedImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: THEME.surfaceMuted,
  },
  shopMembershipIncludedImageMock: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: THEME.surfaceMuted,
  },
  shopMembershipIncludedBody: {
    flex: 1,
    justifyContent: 'center',
  },
  shopMembershipIncludedName: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 3,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipIncludedMeta: {
    color: THEME.muted,
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipIncludedLink: {
    color: THEME.accent,
    fontWeight: '700',
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipResultsWrap: {
    marginTop: 6,
    marginBottom: 12,
  },
  shopMembershipResultsTitle: {
    color: THEME.ink,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipResultsRow: {
    gap: 12,
    paddingRight: 6,
  },
  shopMembershipResultImage: {
    width: 132,
    height: 132,
    borderRadius: 18,
    backgroundColor: THEME.surfaceMuted,
  },
  treatmentListCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 24,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.11,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  treatmentListTitle: {
    color: THEME.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 5,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentListBody: {
    color: THEME.muted,
    lineHeight: 20,
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentListMeta: {
    color: THEME.inkSoft,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  cartBox: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 16,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 28,
    padding: 16,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  surfaceGlossStrip: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: 28,
    height: 50,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.34)',
    transform: [{ rotate: '-6deg' }],
  },
  cartBoxGlow: {
    position: 'absolute',
    top: -14,
    right: -10,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.22)',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  cartItem: {
    color: THEME.muted,
    marginBottom: 4,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  cartTotal: {
    color: THEME.ink,
    fontWeight: '800',
    marginTop: 8,
    fontSize: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 34,
    padding: 20,
    backgroundColor: THEME.rewardsB,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    marginBottom: 18,
    ...SOFT_CARD_SHADOW,
  },
  rewardsLiquidShine: {
    position: 'absolute',
    top: -30,
    left: -210,
    width: 112,
    height: 260,
    borderRadius: 76,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  rewardsOrbit: {
    position: 'absolute',
    top: 26,
    right: 18,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsOrbitCore: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  rewardsOrbitRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  rewardsBalanceGloss: {
    position: 'absolute',
    top: -18,
    left: -14,
    right: 64,
    height: 96,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.40)',
    transform: [{ rotate: '-6deg' }],
  },
  rewardsBalancePearl: {
    position: 'absolute',
    bottom: -36,
    right: -12,
    width: 138,
    height: 138,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  rewardsBalanceGlow: {
    position: 'absolute',
    right: -42,
    top: -42,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  rewardsBalanceGlowSecondary: {
    position: 'absolute',
    left: -28,
    bottom: -46,
    width: 134,
    height: 134,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  rewardsBalanceLogo: {
    color: '#ECFFFB',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceLabel: {
    color: '#D4EEEB',
    marginBottom: 20,
    letterSpacing: 0.5,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsCardStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  rewardsCardStatItem: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rewardsCardStatValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 3,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsCardStatLabel: {
    color: '#D9F0EC',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rewardsBalanceMember: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceJoined: {
    color: '#CCE5E2',
    marginTop: 4,
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceRight: {
    alignItems: 'flex-end',
  },
  rewardsBalanceWallet: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceCash: {
    color: '#E5FAF7',
    marginTop: 4,
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  rewardsHeaderTitle: {
    color: THEME.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsHeaderLink: {
    color: THEME.accent,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsSegmentRow: {
    flexDirection: 'row',
    backgroundColor: SURFACE_SOFT,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    padding: 6,
    marginBottom: 14,
    ...SOFT_CARD_SHADOW,
  },
  rewardsSegmentBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
  },
  rewardsSegmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  rewardsSegmentText: {
    color: THEME.muted,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsSegmentTextActive: {
    color: THEME.ink,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsSectionTitle: {
    color: THEME.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  rewardsActionRow: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    ...SOFT_CARD_SHADOW,
  },
  rewardsActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    paddingRight: 8,
  },
  rewardsActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'rgba(71,196,234,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsActionLabel: {
    color: THEME.ink,
    fontWeight: '700',
    flex: 1,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsActionBtn: {
    backgroundColor: '#2D8FE8',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  rewardsActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsRedeemRow: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    ...SOFT_CARD_SHADOW,
  },
  rewardsRedeemLabel: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsRedeemHint: {
    color: THEME.muted,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsRedeemBtn: {
    backgroundColor: '#2D8FE8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  rewardsRedeemBtnDisabled: {
    opacity: 0.4,
  },
  rewardsRedeemBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsPastList: {
    marginTop: 4,
  },
  rewardsPastEmpty: {
    color: THEME.muted,
    lineHeight: 21,
  },
  rewardsPastItem: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    ...SOFT_CARD_SHADOW,
  },
  rewardsPastTitle: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsPastMeta: {
    color: THEME.muted,
    marginBottom: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  scanCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(212,226,240,0.98)',
    borderRadius: 30,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  scanTitle: {
    color: THEME.ink,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  scanBody: {
    color: THEME.muted,
    lineHeight: 22,
    fontFamily: UI_FONT_FAMILY,
  },
  scanQrMock: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.94)',
    borderStyle: 'dashed',
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
  },
  scanQrGloss: {
    position: 'absolute',
    top: -10,
    left: -4,
    right: 26,
    height: 54,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.40)',
    transform: [{ rotate: '-6deg' }],
  },
  scanQrGlow: {
    position: 'absolute',
    top: 22,
    right: 20,
    width: 76,
    height: 76,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.18)',
  },
  scanQrText: {
    color: THEME.ink,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: UI_FONT_FAMILY,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(212,226,240,0.98)',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  emptyTitle: {
    color: THEME.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyBody: {
    color: THEME.muted,
    lineHeight: 20,
  },
  historyItem: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    ...SOFT_CARD_SHADOW,
  },
  historyTitle: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  historyMeta: {
    color: THEME.muted,
    marginBottom: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  profileEmptyCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(212,226,240,0.98)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  profileGhostList: {
    marginBottom: 18,
    gap: 12,
  },
  profileGhostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileGhostAvatar: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surfaceSoft,
  },
  profileGhostLineWrap: {
    flex: 1,
    gap: 6,
  },
  profileGhostLine: {
    height: 8,
    borderRadius: 999,
    backgroundColor: THEME.surfaceMuted,
    width: '72%',
  },
  profileGhostLineWide: {
    width: '88%',
  },
  profileEmptyTitle: {
    color: THEME.muted,
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  profileEmptyCta: {
    alignSelf: 'center',
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#2B93E9',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.46)',
    alignItems: 'center',
  },
  profileEmptyCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileEmptyMembershipWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  profileEmptyMembershipText: {
    color: THEME.muted,
    marginBottom: 14,
    fontWeight: '600',
  },
  settingsCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 30,
    padding: 18,
    gap: 2,
    ...SOFT_CARD_SHADOW,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_PANEL,
    borderRadius: 18,
    paddingHorizontal: 14,
    color: THEME.ink,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  otpCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 22,
    backgroundColor: SURFACE_PANEL,
    padding: 14,
  },
  otpTitle: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  otpHint: {
    color: THEME.muted,
    marginTop: 0,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  otpUiMessage: {
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 20,
    fontWeight: '600',
    color: THEME.muted,
    fontFamily: UI_FONT_FAMILY,
  },
  otpUiError: {
    color: '#A12323',
  },
  otpUiWarning: {
    color: '#8A5A2F',
  },
  otpUiSuccess: {
    color: '#1F8E52',
  },
  analyticsStatus: {
    color: THEME.muted,
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  diagnosticText: {
    color: THEME.brandStrong,
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  searchResultsCard: {
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 22,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  searchResultsScroll: {
    maxHeight: 196,
  },
  searchResultsScrollContent: {
    paddingVertical: 4,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  searchResultRowLast: {
    borderBottomWidth: 0,
  },
  searchResultMain: {
    flex: 1,
    paddingRight: 8,
  },
  searchResultName: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 3,
    fontFamily: UI_FONT_FAMILY,
  },
  searchResultMeta: {
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  searchSelectLabel: {
    color: THEME.accent,
    fontWeight: '700',
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  searchEmptyText: {
    color: THEME.muted,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  inlineInfoBox: {
    marginTop: 10,
    backgroundColor: SURFACE_TINT,
    borderColor: BORDER_TINT,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    shadowColor: '#69CFF0',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  inlineInfoTitle: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  techToggleCta: {
    marginTop: 8,
  },
  inlineInfoText: {
    color: THEME.muted,
    marginBottom: 3,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  tapScaleSoft: {
    transform: [{ scale: 0.992 }],
    opacity: 0.98,
  },
  tapScaleCard: {
    transform: [{ scale: 0.996 }],
    opacity: 0.99,
  },
  lastActionBox: {
    marginTop: 10,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lastActionText: {
    color: THEME.inkSoft,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  bottomBar: {
    position: 'absolute',
    overflow: 'hidden',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    backgroundColor: SURFACE_RAISED,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#3B78C9',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 9,
  },
  bottomBarGlow: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: -18,
    height: 60,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  bottomBarGloss: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    zIndex: 1,
    overflow: 'hidden',
  },
  bottomTabBtnActive: {
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    shadowColor: '#5CCAEF',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  bottomTabActiveGlow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 4,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(71,196,234,0.22)',
  },
  bottomTabActiveBeam: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  bottomTabIcon: {
    color: '#8B93A2',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomTabIconActive: {
    color: THEME.brand,
  },
  bottomTabLabel: {
    color: THEME.muted,
    fontWeight: '600',
    fontSize: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  bottomTabLabelActive: {
    color: '#1A5FAD',
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
});
