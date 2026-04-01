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
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import ScanScreen from './src/screens/ScanScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AppointmentDetailScreen from './src/screens/AppointmentDetailScreen';
import AmbientBackground from './src/components/AmbientBackground';
import BottomNavigation from './src/components/BottomNavigation';
import HeaderSearchOverlay from './src/overlays/HeaderSearchOverlay';
import CartOverlay from './src/overlays/CartOverlay';
import {
  THEME,
  SOFT_CARD_SHADOW,
  UI_FONT_FAMILY,
  SURFACE_RAISED,
  SURFACE_PANEL,
  SURFACE_SOFT,
  SURFACE_TINT,
  BORDER_TINT,
  BORDER_LIGHT,
  createMowgliTheme,
} from './src/theme/tokens';

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
    hideImage: true,
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
  { id: 'andere', label: 'Andere' },
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
  andere: {
    icon: '∙',
    description: 'Weitere Bereiche, Kombinationen und individuelle Spezialbehandlungen.',
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

const DEMO_APPOINTMENTS = [
  {
    id: 'demo-appointment-1',
    clinicId: 'demo-clinic',
    patientEmail: 'anna@muster.at',
    patientName: 'Anna Muster',
    treatmentId: 't-basic-glow',
    treatmentName: 'Basic Glow',
    treatmentDurationMinutes: 60,
    practitionerName: 'Dr. Milani',
    startsAt: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)).toISOString(),
    endsAt: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7) + (1000 * 60 * 60)).toISOString(),
    locationLabel: CLINIC.name,
    locationAddress: CLINIC.address,
    status: 'confirmed',
    notes: 'Bitte komme 10 Minuten früher zum Check-in.',
    orderId: 'demo-order-1',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)).toISOString(),
    updatedAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)).toISOString(),
    segment: 'upcoming',
  },
  {
    id: 'demo-appointment-2',
    clinicId: 'demo-clinic',
    patientEmail: 'anna@muster.at',
    patientName: 'Anna Muster',
    treatmentId: 't-prp',
    treatmentName: 'PRP Mesohair',
    treatmentDurationMinutes: 60,
    practitionerName: 'Dr. Moser',
    startsAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 18)).toISOString(),
    endsAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 18) + (1000 * 60 * 60)).toISOString(),
    locationLabel: CLINIC.name,
    locationAddress: CLINIC.address,
    status: 'completed',
    notes: 'Nachsorge mit mildem Shampoo für 24 Stunden empfohlen.',
    orderId: 'demo-order-2',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 24)).toISOString(),
    updatedAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 18)).toISOString(),
    segment: 'past',
  },
];

const STORAGE_KEYS = {
  analyticsBaseUrl: 'appointmentix.analyticsBaseUrl',
  clinicName: 'appointmentix.clinicName',
  clinicId: 'appointmentix.clinicId',
  uiAppearance: 'appointmentix.uiAppearance',
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

function normalizeHomeArticles(baseUrl, articles) {
  const safeList = Array.isArray(articles) ? articles : [];
  return safeList.map((article) => ({
    ...article,
    imageUrl: absolutizeMediaUrl(baseUrl, article?.imageUrl),
    heroImageUrl: absolutizeMediaUrl(baseUrl, article?.heroImageUrl),
    coverImageUrl: absolutizeMediaUrl(baseUrl, article?.coverImageUrl),
    thumbnailUrl: absolutizeMediaUrl(baseUrl, article?.thumbnailUrl),
  }));
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

function appointmentSegmentValue(appointment) {
  const normalizedStatus = String(appointment?.status || '').trim().toLowerCase();
  const startsAt = appointment?.startsAt ? new Date(appointment.startsAt) : null;
  if (normalizedStatus === 'completed' || normalizedStatus === 'canceled') return 'past';
  if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() < Date.now()) return 'past';
  return 'upcoming';
}

function normalizeAppointmentList(items) {
  const safeItems = Array.isArray(items) ? items : [];
  return safeItems
    .map((item) => ({
      ...item,
      segment: item?.segment || appointmentSegmentValue(item),
    }))
    .sort((left, right) => {
      const leftSegment = left.segment || appointmentSegmentValue(left);
      const rightSegment = right.segment || appointmentSegmentValue(right);
      if (leftSegment !== rightSegment) {
        return leftSegment === 'upcoming' ? -1 : 1;
      }

      const leftTime = left?.startsAt ? new Date(left.startsAt).getTime() : 0;
      const rightTime = right?.startsAt ? new Date(right.startsAt).getTime() : 0;
      const leftCreated = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightCreated = right?.createdAt ? new Date(right.createdAt).getTime() : 0;

      if (leftSegment === 'upcoming') {
        return (leftTime || leftCreated || 0) - (rightTime || rightCreated || 0);
      }
      return (rightTime || rightCreated || 0) - (leftTime || leftCreated || 0);
    });
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

async function fetchPatientAppointments(baseUrl, clinicName, memberEmail) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const safeClinicName = String(clinicName || '').trim();
  const safeEmail = String(memberEmail || '').trim().toLowerCase();
  const query = `?clinicName=${encodeURIComponent(safeClinicName)}&memberEmail=${encodeURIComponent(safeEmail)}`;
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/appointments${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('Termine konnten nicht geladen werden.', response.status, text);
  }
  return parseJsonPayload(text) || {};
}

async function updatePatientAppointment(baseUrl, appointmentId, action, payload) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const safeAction = String(action || '').trim().toLowerCase();
  const endpoint = safeAction === 'cancel'
    ? `${safeBaseUrl}/api/mobile/appointments/${appointmentId}/cancel`
    : `${safeBaseUrl}/api/mobile/appointments/${appointmentId}/reschedule-request`;
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  }, { timeoutMs: 12000, retries: 1, retryDelayMs: 500 });

  const text = await response.text();
  if (!response.ok) {
    throw buildApiError('Termin konnte nicht aktualisiert werden.', response.status, text);
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
    case 'andere':
      return 'apps-outline';
    default:
      return 'ellipse-outline';
  }
}

export default function App() {
  const [mainTab, setMainTab] = useState('home');
  const [shopTab, setShopTab] = useState('browse');
  const [profileTab, setProfileTab] = useState('overview');
  const [rewardsView, setRewardsView] = useState('active');
  const [appointmentSegment, setAppointmentSegment] = useState('upcoming');
  const [categoryId, setCategoryId] = useState('gesicht');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedHomeArticle, setSelectedHomeArticle] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [units, setUnits] = useState(1);

  const [clinicProfile, setClinicProfile] = useState(CLINIC);
  const [homeArticles, setHomeArticles] = useState(HOME_ARTICLES);
  const [treatmentCategories, setTreatmentCategories] = useState(TREATMENT_CATEGORIES);
  const [treatments, setTreatments] = useState(TREATMENTS);
  const [memberships, setMemberships] = useState(MEMBERSHIPS);
  const [rewardActions, setRewardActions] = useState(REWARD_ACTIONS);
  const [rewardRedeems, setRewardRedeems] = useState(REWARD_REDEEMS);
  const [appointments, setAppointments] = useState(() => normalizeAppointmentList(DEMO_APPOINTMENTS));
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);

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
  const [uiAppearance, setUiAppearance] = useState('dark');
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
  const mainScrollRef = useRef(null);
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

  const selectedAppointmentImageUrl = useMemo(() => {
    if (!selectedAppointment?.treatmentId) return '';
    const match = treatments.find((item) => String(item.id || '') === String(selectedAppointment.treatmentId || ''));
    return preferredTreatmentImage(match);
  }, [selectedAppointment, treatments]);

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

  const selectedClinicPreview = useMemo(() => {
    const selectedName = String(clinicLookupName || clinicSearchQuery || '').trim().toLowerCase();
    if (!selectedName) return null;
    return (
      clinicSuggestionResults.find((entry) => String(entry?.name || '').trim().toLowerCase() === selectedName)
      || null
    );
  }, [clinicSuggestionResults, clinicLookupName, clinicSearchQuery]);

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
    if (nextTab !== 'profile') {
      setSelectedAppointment(null);
      setProfileTab('overview');
    }
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
      mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
      setShopTab('browse');
      setSelectedTreatment(result.payload);
      switchMainTab('shop');
      closeHeaderSearch();
      return;
    }

    if (result.type === 'membership') {
      mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
      setShopTab('membership');
      switchMainTab('shop');
      closeHeaderSearch();
      return;
    }

    if (result.type === 'article') {
      mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
      setSelectedHomeArticle(result.payload || null);
      switchMainTab('home');
      closeHeaderSearch();
      return;
    }
  }

  function openTreatment(treatment) {
    mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
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

  async function syncPatientAppointments(nextBaseUrl = '', nextClinicName = '', nextEmail = '') {
    const normalized = normalizeUrl(nextBaseUrl || analyticsBaseUrl);
    const resolvedClinicName = String(nextClinicName || clinicLookupName || clinicProfile.name || '').trim();
    const resolvedEmail = String(nextEmail || settingsEmail || '').trim().toLowerCase();

    if (!normalized) {
      setAppointments(normalizeAppointmentList(DEMO_APPOINTMENTS));
      return;
    }
    if (patientGuestMode || !normalized || !resolvedClinicName || !resolvedEmail || !resolvedEmail.includes('@')) {
      setAppointments([]);
      setSelectedAppointment(null);
      return;
    }

    setAppointmentsLoading(true);
    try {
      const response = await fetchPatientAppointments(normalized, resolvedClinicName, resolvedEmail);
      const rows = normalizeAppointmentList(response.appointments || []);
      setAppointments(rows);
      setSelectedAppointment((prev) => {
        if (!prev) return null;
        return rows.find((item) => String(item.id) === String(prev.id)) || null;
      });
    } catch {
      setAppointments([]);
      setSelectedAppointment(null);
    } finally {
      setAppointmentsLoading(false);
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

    const rawCategories = Array.isArray(catalog.categories) ? catalog.categories : [];
    const hasOtherCategory = rawCategories.some(
      (item) => String(item?.id || '').trim().toLowerCase() === 'andere'
    );
    const nextCategories = rawCategories.length === 0
      ? TREATMENT_CATEGORIES
      : hasOtherCategory
        ? rawCategories
        : [...rawCategories, { id: 'andere', label: 'Andere' }];
    const nextTreatments = Array.isArray(catalog.treatments) ? catalog.treatments : [];
    const nextMemberships = Array.isArray(catalog.memberships) ? catalog.memberships : [];
    const nextRewardActions = Array.isArray(catalog.rewardActions) ? catalog.rewardActions : [];
    const nextRewardRedeems = Array.isArray(catalog.rewardRedeems) ? catalog.rewardRedeems : [];
    const nextHomeArticles = normalizeHomeArticles(normalized, catalog.homeArticles);

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
    setHomeArticles(nextHomeArticles.length > 0 ? nextHomeArticles : HOME_ARTICLES);
    setSelectedHomeArticle(null);
    setSelectedAppointment(null);
    setProfileTab('overview');

    if (clinic && typeof clinic === 'object') {
      setClinicProfile((prev) => ({
        ...CLINIC,
        ...prev,
        ...clinic,
      }));
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
    await syncPatientAppointments(normalized, clinic.name || resolvedClinicName || clinicLookupName, nextEmail || settingsEmail);
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
  setClinicProfile((prev) => ({
    ...prev,
    name,
    city: clinic?.city || prev?.city || '',
    website: clinic?.website || prev?.website || '',
    logoUrl: clinic?.logoUrl || prev?.logoUrl || '',
    brandColor: clinic?.brandColor || prev?.brandColor || '',
    accentColor: clinic?.accentColor || prev?.accentColor || '',
  }));
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
    setSelectedAppointment(null);
    setProfileTab('overview');
    setCartItems([]);
    setMembershipStatus(null);
    setAppointments(normalizeAppointmentList(DEMO_APPOINTMENTS));
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
    setAppointments(normalizeAppointmentList(DEMO_APPOINTMENTS));
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
          memberEmail: patientGuestMode ? '' : String(settingsEmail || '').trim().toLowerCase(),
          memberName: patientGuestMode ? '' : String(settingsName || '').trim(),
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
        const createdAppointments = normalizeAppointmentList(payload?.appointments || []);
        if (nextMembership) {
          setMembershipStatus(nextMembership);
          if (nextMembership.membershipId) {
            setActiveMembership(nextMembership.membershipId);
          }
        }
        if (createdAppointments.length > 0) {
          setAppointments((prev) => normalizeAppointmentList([...createdAppointments, ...prev]));
        }

        setCartItems([]);
        setSelectedTreatment(null);
        setUnits(1);

        tapFeedback(8);
        track(`Kauf abgeschlossen (${paymentMethodText}): ${formatPrice(spentCents)} | +${earnedPoints} Punkte`);
        Alert.alert(
          'Kauf erfolgreich',
          `Gesamt: ${formatPrice(spentCents)}\nZahlart: ${paymentMethodText}\nVerdiente Punkte: ${earnedPoints}\nBestellnummer: ${String(payload?.orderId || '—')}${createdAppointments.length > 0 ? `\nTerminwunsch: ${createdAppointments.length}x in Meine Termine gespeichert.` : ''}`
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
    const createdAppointments = normalizeAppointmentList(
      cartItems.map((item, index) => {
        const treatment = treatments.find((entry) => String(entry.id || '') === String(item.treatmentId || item.id || '')) || {};
        return {
          id: `demo-checkout-${Date.now()}-${index}`,
          clinicId: 'offline-demo',
          patientEmail: String(settingsEmail || '').trim().toLowerCase(),
          patientName: String(settingsName || '').trim(),
          treatmentId: String(item.treatmentId || item.id || ''),
          treatmentName: String(item.name || treatment.name || 'Treatment'),
          treatmentDurationMinutes: Number(treatment.durationMinutes || 0),
          practitionerName: '',
          startsAt: '',
          endsAt: '',
          locationLabel: clinicProfile.name || CLINIC.name,
          locationAddress: clinicProfile.address || CLINIC.address,
          status: 'pending_confirmation',
          notes: 'Die Klinik bestätigt deinen Termin separat.',
          orderId: `demo-order-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          segment: 'upcoming',
        };
      })
    );

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
    if (createdAppointments.length > 0) {
      setAppointments((prev) => normalizeAppointmentList([...createdAppointments, ...prev]));
    }

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
      `Gesamt: ${formatPrice(spentCents)}\nZahlart: ${paymentMethodText}\nVerdiente Punkte: ${earnedPoints}${createdAppointments.length > 0 ? `\nTerminwunsch: ${createdAppointments.length}x in Meine Termine gespeichert.` : ''}\n\nFür Tests kannst du im Stripe-Checkout die Karte 4242 4242 4242 4242 nutzen.`
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
      const storedAppearance = String(await readSecureValue(STORAGE_KEYS.uiAppearance)).trim().toLowerCase();
      const storedOnboardingDone = String(await readSecureValue(STORAGE_KEYS.onboardingDone)).trim();
      const storedName = String(await readSecureValue(STORAGE_KEYS.settingsName)).trim();
      const storedEmail = String(await readSecureValue(STORAGE_KEYS.settingsEmail)).trim();
      const storedPatientPhone = normalizePhone(await readSecureValue(STORAGE_KEYS.patientPhone));
      const storedPatientGuestMode = String(await readSecureValue(STORAGE_KEYS.patientGuestMode)).trim() === '1';
      const defaultBaseUrl = normalizeUrl(APP_DEFAULT_BACKEND_URL);
      const expoDetectedBaseUrl = normalizeUrl(expoBackendUrl);
      const defaultClinicName = String(APP_DEFAULT_CLINIC_NAME || '').trim();

      if (!isActive) return;

      if (storedAppearance === 'dark' || storedAppearance === 'light') {
        setUiAppearance(storedAppearance);
      }
      if (storedName) setSettingsName(storedName);
      if (storedEmail) setSettingsEmail(storedEmail);
      if (storedPatientPhone) {
        setPatientPhone(storedPatientPhone);
      }
      if (storedPatientGuestMode) {
        setPatientGuestMode(true);
      }
      setAppointments(normalizeAppointmentList(DEMO_APPOINTMENTS));
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
    if (!analyticsConnected) {
      setAppointments(normalizeAppointmentList(DEMO_APPOINTMENTS));
      return;
    }
    if (patientGuestMode) {
      setAppointments([]);
      setSelectedAppointment(null);
      return;
    }
    void syncPatientAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsConnected, settingsEmail, patientGuestMode]);

  useEffect(() => {
    void writeSecureValue(STORAGE_KEYS.uiAppearance, uiAppearance);
  }, [uiAppearance]);

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
  const mowgliTheme = useMemo(
    () => createMowgliTheme({
      mode: uiAppearance,
      brandColor: clinicProfile?.brandColor,
      accentColor: clinicProfile?.accentColor,
    }),
    [uiAppearance, clinicProfile?.brandColor, clinicProfile?.accentColor]
  );
  const onboardingMowgliTheme = useMemo(
    () => createMowgliTheme({
      mode: uiAppearance,
      brandColor: selectedClinicPreview?.brandColor || clinicProfile?.brandColor,
      accentColor: selectedClinicPreview?.accentColor || clinicProfile?.accentColor,
    }),
    [
      uiAppearance,
      selectedClinicPreview?.brandColor,
      selectedClinicPreview?.accentColor,
      clinicProfile?.brandColor,
      clinicProfile?.accentColor,
    ]
  );
  const cartCount = cartItems.length;

  const handleClinicSearchChange = (value) => {
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
  };

  const handleClinicSearchFocus = () => {
    setClinicDropdownOpen(true);
    void runClinicSearch({ query: clinicSearchQuery, silent: true, allowEmpty: true });
  };

  const handleClinicSearchSubmit = () => {
    setClinicDropdownOpen(true);
    void runClinicSearch();
  };

  const handleReloadClinicBundle = async () => {
    try {
      await loadClinicBundle();
    } catch (error) {
      Alert.alert('MedSpa-Daten konnten nicht geladen werden', String(error?.message || error));
    }
  };

  const handleOpenOnboardingSetup = () => {
    setOnboardingBaseUrl(analyticsBaseUrl || onboardingBaseUrl);
    setClinicSearchQuery(clinicLookupName || clinicSearchQuery);
    setClinicSearchResults([]);
    setShowOnboarding(true);
  };

  const handleOpenOffers = () => {
    switchMainTab('shop');
    track('Start > Shop geöffnet', 'offer_view', {
      treatmentId: 'shop_overview',
    });
  };

  const handleOpenHomeTreatment = (treatment) => {
    setShopTab('browse');
    switchMainTab('shop');
    openTreatment(treatment);
  };

  const handleOpenHomeArticle = (article) => {
    if (!article) return;
    mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
    setSelectedHomeArticle(article);
    switchMainTab('home');
    track(`Artikel geöffnet: ${article.title || 'Beitrag'}`, 'article_open', {
      articleId: article.id || '',
    });
  };

  const handleCloseHomeArticle = () => {
    setSelectedHomeArticle(null);
  };

  const handleOpenShopBrowse = () => {
    setShopTab('browse');
    switchMainTab('shop');
  };

  const handleOpenMembershipTab = () => {
    setShopTab('membership');
    switchMainTab('shop');
  };

  const handleOpenMembershipTreatment = (item) => {
    setShopTab('browse');
    openTreatment(item);
  };

  const handleOpenAppointments = () => {
    setProfileTab('appointments');
    setAppointmentSegment('upcoming');
    setSelectedAppointment(null);
    switchMainTab('profile');
    void syncPatientAppointments();
  };

  const handleCloseAppointments = () => {
    setSelectedAppointment(null);
    setProfileTab('overview');
  };

  const handleOpenAppointment = (appointment) => {
    if (!appointment) return;
    mainScrollRef.current?.scrollTo?.({ y: 0, animated: false });
    setProfileTab('appointments');
    setSelectedAppointment(appointment);
    switchMainTab('profile');
    track(`Termin geöffnet: ${appointment.treatmentName || 'Termin'}`, 'offer_view', {
      treatmentId: appointment.treatmentId || '',
      metadata: { screen: 'appointments' },
    });
  };

  const handleRequestAppointmentUpdate = async (appointment, action) => {
    if (!appointment) return;
    if (!analyticsConnected) {
      const nextStatus = action === 'cancel' ? 'canceled' : 'reschedule_requested';
      const nextRows = normalizeAppointmentList(
        appointments.map((item) => (
          String(item.id) === String(appointment.id)
            ? { ...item, status: nextStatus, updatedAt: new Date().toISOString(), segment: appointmentSegmentValue({ ...item, status: nextStatus }) }
            : item
        ))
      );
      setAppointments(nextRows);
      setSelectedAppointment(nextRows.find((item) => String(item.id) === String(appointment.id)) || null);
      return;
    }

    const normalized = normalizeUrl(analyticsBaseUrl);
    const resolvedClinicName = String(clinicProfile.name || clinicLookupName || clinicSearchQuery || '').trim();
    const memberEmail = patientGuestMode ? '' : String(settingsEmail || '').trim().toLowerCase();
    if (!normalized || !resolvedClinicName || !memberEmail) {
      Alert.alert('Daten fehlen', 'Für Terminaktionen muss dein Profil mit einer E-Mail und einer MedSpa verbunden sein.');
      return;
    }

    setAppointmentActionLoading(true);
    try {
      const payload = await updatePatientAppointment(normalized, appointment.id, action, {
        clinicName: resolvedClinicName,
        memberEmail,
      });
      const updatedRow = payload?.appointment || null;
      if (updatedRow) {
        const nextRows = normalizeAppointmentList(
          appointments.map((item) => (String(item.id) === String(updatedRow.id) ? updatedRow : item))
        );
        setAppointments(nextRows);
        setSelectedAppointment(nextRows.find((item) => String(item.id) === String(updatedRow.id)) || updatedRow);
      }
      Alert.alert(
        action === 'cancel' ? 'Termin storniert' : 'Verschiebung angefragt',
        action === 'cancel'
          ? 'Der Termin wurde storniert.'
          : 'Die Klinik wurde über deinen Verschiebungswunsch informiert.'
      );
    } catch (error) {
      Alert.alert('Aktion fehlgeschlagen', String(error?.message || error));
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const renderMainTabScreen = () => {
    switch (mainTab) {
      case 'home':
        return (
          <HomeScreen
            styles={styles}
            mowgliTheme={mowgliTheme}
            clinicProfile={clinicProfile}
            settingsName={settingsName}
            cartCount={cartCount}
            onSearchPress={openHeaderSearch}
            onCartPress={openHeaderCart}
            liquidShineAnim={liquidShineAnim}
            floatingAuraAnim={floatingAuraAnim}
            activeMembershipName={activeMembershipName}
            currentMembership={currentMembership}
            onViewOffers={handleOpenOffers}
            homeArticles={homeArticles}
            clinicMapRegion={clinicMapRegion}
            clinicCoordinates={clinicCoordinates}
            openClinicInMaps={openClinicInMaps}
            callClinicNow={callClinicNow}
            openProfile={() => switchMainTab('profile')}
            treatments={treatments}
            preferredTreatmentImage={preferredTreatmentImage}
            openTreatmentFromHome={handleOpenHomeTreatment}
            openMembershipTab={handleOpenMembershipTab}
            formatPrice={formatPrice}
            selectedArticle={selectedHomeArticle}
            openArticle={handleOpenHomeArticle}
            closeArticle={handleCloseHomeArticle}
          />
        );
      case 'shop':
        return (
          <ShopScreen
            styles={styles}
            mowgliTheme={mowgliTheme}
            clinicProfile={clinicProfile}
            cartCount={cartCount}
            onSearchPress={openHeaderSearch}
            onCartPress={openHeaderCart}
            shopTab={shopTab}
            setShopTab={setShopTab}
            shopMembershipTabLabel={shopMembershipTabLabel}
            selectedTreatment={selectedTreatment}
            liquidShineAnim={liquidShineAnim}
            treatmentCategories={treatmentCategories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categoryIconName={categoryIconName}
            selectedCategory={selectedCategory}
            selectedCategoryMeta={selectedCategoryMeta}
            browseItems={browseItems}
            openTreatment={openTreatment}
            preferredTreatmentImage={preferredTreatmentImage}
            setSelectedTreatment={setSelectedTreatment}
            units={units}
            setUnits={setUnits}
            formatPrice={formatPrice}
            hasActiveMembership={hasActiveMembership}
            cartSyncing={cartSyncing}
            checkoutLoading={checkoutLoading}
            addToCart={addToCart}
            cartCtaLabel={cartCtaLabel}
            memberships={memberships}
            membershipStatus={membershipStatus}
            treatments={treatments}
            membershipSyncing={membershipSyncing}
            activateMembership={activateMembership}
            hasCart={hasCart}
            cartItems={cartItems}
            totalCartCents={totalCartCents}
            selectedCheckoutMethod={selectedCheckoutMethod}
            setSelectedCheckoutMethod={setSelectedCheckoutMethod}
            checkoutMethodOptions={CHECKOUT_METHOD_OPTIONS}
            runCheckout={runCheckout}
            checkoutCtaLabel={checkoutCtaLabel}
            openMembershipTreatment={handleOpenMembershipTreatment}
          />
        );
      case 'scan':
        return (
          <ScanScreen
            styles={styles}
            mowgliTheme={mowgliTheme}
            clinicProfile={clinicProfile}
            points={points}
            checkInViaScan={checkInViaScan}
          />
        );
      case 'rewards':
        return (
          <RewardsScreen
            styles={styles}
            mowgliTheme={mowgliTheme}
            clinicProfile={clinicProfile}
            cartCount={cartCount}
            onSearchPress={openHeaderSearch}
            onCartPress={openHeaderCart}
            liquidShineAnim={liquidShineAnim}
            floatingAuraAnim={floatingAuraAnim}
            points={points}
            rewardHistoryItems={rewardHistoryItems}
            patientGuestMode={patientGuestMode}
            walletCents={walletCents}
            formatPrice={formatPrice}
            rewardsView={rewardsView}
            setRewardsView={setRewardsView}
            rewardActions={rewardActions}
            rewardActionIcon={rewardActionIcon}
            claimActionPoints={claimActionPoints}
            rewardRedeems={rewardRedeems}
            redeemReward={redeemReward}
            formatDate={formatDate}
          />
        );
      case 'profile':
        if (selectedAppointment) {
          return (
            <AppointmentDetailScreen
              mowgliTheme={mowgliTheme}
              appointment={selectedAppointment}
              onBack={() => setSelectedAppointment(null)}
              onOpenMaps={openClinicInMaps}
              onCallClinic={callClinicNow}
              onRequestReschedule={() => handleRequestAppointmentUpdate(selectedAppointment, 'reschedule-request')}
              onCancelAppointment={() => handleRequestAppointmentUpdate(selectedAppointment, 'cancel')}
              actionLoading={appointmentActionLoading}
              treatmentImageUrl={selectedAppointmentImageUrl}
            />
          );
        }
        if (profileTab === 'appointments') {
          return (
            <AppointmentsScreen
              mowgliTheme={mowgliTheme}
              appointments={appointments}
              appointmentsLoading={appointmentsLoading}
              appointmentSegment={appointmentSegment}
              setAppointmentSegment={setAppointmentSegment}
              openAppointment={handleOpenAppointment}
              backToProfile={handleCloseAppointments}
              openShopBrowse={handleOpenShopBrowse}
            />
          );
        }
        return (
          <ProfileScreen
            styles={styles}
            mowgliTheme={mowgliTheme}
            clinicProfile={clinicProfile}
            cartCount={cartCount}
            onSearchPress={openHeaderSearch}
            onCartPress={openHeaderCart}
            profileTab={profileTab}
            setProfileTab={setProfileTab}
            history={history}
            formatDate={formatDate}
            formatPrice={formatPrice}
            openShopBrowse={handleOpenShopBrowse}
            hasActiveMembership={hasActiveMembership}
            currentMembership={currentMembership}
            membershipStatusText={membershipStatusText}
            membershipStatus={membershipStatus}
            treatments={treatments}
            membershipSyncing={membershipSyncing}
            cancelMembership={cancelMembership}
            openAppointments={handleOpenAppointments}
            openMembershipTab={handleOpenMembershipTab}
            settingsName={settingsName}
            setSettingsName={setSettingsName}
            settingsEmail={settingsEmail}
            setSettingsEmail={setSettingsEmail}
            uiAppearance={uiAppearance}
            setUiAppearance={setUiAppearance}
            analyticsConnected={analyticsConnected}
            backendCheckMessage={backendCheckMessage}
            patientGuestMode={patientGuestMode}
            patientPhone={patientPhone}
            reloadClinicBundle={handleReloadClinicBundle}
            openOnboardingSetup={handleOpenOnboardingSetup}
            disconnectClinicSession={disconnectClinicSession}
          />
        );
      default:
        return null;
    }
  };

  if (isBootstrapping) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: mowgliTheme.page }]}>
        <StatusBar style={uiAppearance === 'dark' ? 'light' : 'dark'} />
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
      <OnboardingScreen
        styles={styles}
        mowgliTheme={onboardingMowgliTheme}
        liquidShineAnim={liquidShineAnim}
        onboardingStep={onboardingStep}
        showTechnicalSetup={showTechnicalSetup}
        setShowTechnicalSetup={setShowTechnicalSetup}
        needsBackendProvisioning={needsBackendProvisioning}
        onboardingBaseUrl={onboardingBaseUrl}
        setOnboardingBaseUrl={setOnboardingBaseUrl}
        backendCheckLoading={backendCheckLoading}
        runBackendHealthCheck={runBackendHealthCheck}
        clinicSearchQuery={clinicSearchQuery}
        onClinicSearchChange={handleClinicSearchChange}
        onClinicSearchFocus={handleClinicSearchFocus}
        onClinicSearchSubmit={handleClinicSearchSubmit}
        clinicSearchLoading={clinicSearchLoading}
        clinicDropdownOpen={clinicDropdownOpen}
        clinicSuggestionResults={clinicSuggestionResults}
        clinicLookupName={clinicLookupName}
        selectClinicFromSearch={selectClinicFromSearch}
        scanCodeValue={scanCodeValue}
        setScanCodeValue={setScanCodeValue}
        useQrOrReferralCode={useQrOrReferralCode}
        continueToAccessStep={continueToAccessStep}
        patientPhone={patientPhone}
        setPatientPhone={setPatientPhone}
        connectLoading={connectLoading}
        otpLoading={otpLoading}
        otpResendLoading={otpResendLoading}
        continueWithPhone={continueWithPhone}
        otpCtaLabel={otpCtaLabel}
        otpUiMessage={otpUiMessage}
        otpUiType={otpUiType}
        otpReadyToVerify={otpReadyToVerify}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        otpExpiresAt={otpExpiresAt}
        formatClock={formatClock}
        otpCountdown={otpCountdown}
        resendOtpCode={resendOtpCode}
        otpResendLabel={otpResendLabel}
        continueAsGuest={continueAsGuest}
        resetOtpFlow={resetOtpFlow}
        setOnboardingStep={setOnboardingStep}
        backendCheckMessage={backendCheckMessage}
        continueOfflineDemo={continueOfflineDemo}
        allowTechnicalSetup={ALLOW_TECHNICAL_SETUP}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: mowgliTheme.page }]}>
      <StatusBar style={uiAppearance === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.container, { backgroundColor: mowgliTheme.page }]}>
        <AmbientBackground styles={styles} />
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
          <ScrollView ref={mainScrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderMainTabScreen()}
            {!!lastAction && (
              <View style={styles.lastActionBox}>
                <Text style={styles.lastActionText}>{lastAction}</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {headerSearchOpen && (
          <HeaderSearchOverlay
            styles={styles}
            mowgliTheme={mowgliTheme}
            closeHeaderSearch={closeHeaderSearch}
            headerSearchQuery={headerSearchQuery}
            setHeaderSearchQuery={setHeaderSearchQuery}
            globalSearchResults={globalSearchResults}
            searchResultIcon={searchResultIcon}
            onGlobalSearchSelect={onGlobalSearchSelect}
          />
        )}

        {cartSheetOpen && (
          <CartOverlay
            styles={styles}
            mowgliTheme={mowgliTheme}
            closeHeaderCart={closeHeaderCart}
            cartItems={cartItems}
            formatPrice={formatPrice}
            updateCartItemUnits={updateCartItemUnits}
            removeCartItem={removeCartItem}
            checkoutMethodOptions={CHECKOUT_METHOD_OPTIONS}
            selectedCheckoutMethod={selectedCheckoutMethod}
            setSelectedCheckoutMethod={setSelectedCheckoutMethod}
            totalCartCents={totalCartCents}
            checkoutLoading={checkoutLoading}
            cartSyncing={cartSyncing}
            runCheckout={runCheckout}
            checkoutCtaLabel={checkoutCtaLabel}
          />
        )}

        {!(mainTab === 'home' && selectedHomeArticle) && !(mainTab === 'shop' && selectedTreatment) && !(mainTab === 'profile' && selectedAppointment) && (
          <BottomNavigation styles={styles} mowgliTheme={mowgliTheme} mainTab={mainTab} switchMainTab={switchMainTab} />
        )}
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
    borderRadius: 36,
    padding: 26,
    marginTop: 4,
    shadowColor: '#3A72B8',
    shadowOpacity: 0.12,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  cardChrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 74,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  cardChromeSecondary: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 92,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    transform: [{ rotate: '5deg' }],
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 44,
  },
  onboardingSafeArea: {
    flex: 1,
    backgroundColor: '#0B0B0D',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#0B0B0D',
    overflow: 'hidden',
  },
  onboardingBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  onboardingBackdropBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0B0D',
  },
  onboardingBackdropBeam: {
    position: 'absolute',
    top: -84,
    left: -220,
    width: 220,
    height: 420,
    backgroundColor: 'rgba(200,169,126,0.08)',
    borderRadius: 999,
    transform: [{ rotate: '18deg' }],
  },
  onboardingBackdropGlowTop: {
    position: 'absolute',
    top: -110,
    right: -54,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.10)',
  },
  onboardingBackdropGlowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: 'rgba(110,88,63,0.12)',
  },
  onboardingStageHeader: {
    marginBottom: 24,
  },
  onboardingBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  onboardingBrandMark: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.22)',
    backgroundColor: '#151518',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  onboardingBrandCore: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#C8A97E',
  },
  onboardingBrandTextWrap: {
    flex: 1,
    gap: 2,
  },
  onboardingBrandText: {
    color: '#F2ECE3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingBrandSubtext: {
    color: '#8F8579',
    fontSize: 11,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingStepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.18)',
    backgroundColor: 'rgba(200,169,126,0.08)',
  },
  onboardingStepBadgeText: {
    color: '#C8A97E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingStageEyebrow: {
    color: '#C8A97E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.1,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingStageTitle: {
    color: '#F2ECE3',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.9,
    marginBottom: 10,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  onboardingStageBody: {
    color: '#A9A097',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 520,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingPanelDark: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  onboardingPanelEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  onboardingPanelAccent: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.05)',
  },
  onboardingUtilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginBottom: 12,
  },
  onboardingUtilityToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onboardingUtilityToggleText: {
    color: '#B9AEA2',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingTechnicalBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
    backgroundColor: '#111113',
  },
  onboardingTechnicalHint: {
    marginTop: 10,
    color: '#A89D92',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingSection: {
    gap: 12,
  },
  onboardingSectionHead: {
    marginBottom: 4,
  },
  onboardingSectionEyebrow: {
    color: '#7F7367',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingSectionTitle: {
    color: '#F2ECE3',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
    marginBottom: 2,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  onboardingFieldLabel: {
    color: '#C8A97E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingInputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    backgroundColor: '#101013',
    paddingHorizontal: 14,
  },
  onboardingInputIcon: {
    marginRight: 10,
  },
  onboardingInput: {
    flex: 1,
    minHeight: 54,
    color: '#F2ECE3',
    fontSize: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingActionButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  onboardingActionPrimary: {
    backgroundColor: '#F2ECE3',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  onboardingActionSecondary: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.16)',
  },
  onboardingActionPressed: {
    transform: [{ translateY: -1 }],
    opacity: 0.94,
  },
  onboardingActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  onboardingActionText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingActionTextPrimary: {
    color: '#0A0A0C',
  },
  onboardingActionTextSecondary: {
    color: '#F2ECE3',
  },
  onboardingClinicResults: {
    marginTop: 2,
  },
  onboardingMiniLabel: {
    color: '#7F7367',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingClinicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    marginBottom: 10,
  },
  onboardingClinicCardSelected: {
    borderColor: 'rgba(200,169,126,0.38)',
    backgroundColor: '#1A1714',
  },
  onboardingClinicCardLast: {
    marginBottom: 0,
  },
  onboardingClinicCardPressed: {
    transform: [{ translateY: -1 }],
  },
  onboardingClinicLogo: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101013',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
  },
  onboardingClinicText: {
    flex: 1,
    gap: 3,
  },
  onboardingClinicName: {
    color: '#F2ECE3',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  onboardingClinicMeta: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingClinicAction: {
    color: '#C8A97E',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingClinicSwatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  onboardingEmptyState: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
  },
  onboardingEmptyText: {
    flex: 1,
    color: '#8F8579',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingDivider: {
    height: 1,
    backgroundColor: 'rgba(200,169,126,0.10)',
    marginVertical: 4,
  },
  onboardingSummaryRow: {
    paddingHorizontal: 2,
    gap: 4,
  },
  onboardingSummaryLabel: {
    color: '#7F7367',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingSummaryValue: {
    color: '#F2ECE3',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingSelectedClinicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    backgroundColor: '#111113',
  },
  onboardingSelectedClinicIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
  },
  onboardingSelectedClinicText: {
    flex: 1,
    gap: 2,
  },
  onboardingSelectedClinicLabel: {
    color: '#7F7367',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingSelectedClinicName: {
    color: '#F2ECE3',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  onboardingMessageBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#18181B',
    borderColor: 'rgba(200,169,126,0.14)',
  },
  onboardingMessageError: {
    borderColor: 'rgba(178,82,82,0.28)',
    backgroundColor: 'rgba(68,24,24,0.36)',
  },
  onboardingMessageWarning: {
    borderColor: 'rgba(200,169,126,0.28)',
    backgroundColor: 'rgba(76,58,35,0.34)',
  },
  onboardingMessageSuccess: {
    borderColor: 'rgba(92,145,105,0.28)',
    backgroundColor: 'rgba(28,54,36,0.34)',
  },
  onboardingMessageText: {
    color: '#F2ECE3',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingOtpCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    backgroundColor: '#111113',
    gap: 10,
  },
  onboardingOtpHint: {
    color: '#A9A097',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingOtpExpiry: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingAuxActions: {
    gap: 10,
  },
  onboardingDemoLink: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 6,
  },
  onboardingDemoLinkText: {
    color: '#8F8579',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingKeyboardAccessory: {
    backgroundColor: '#141416',
    borderTopWidth: 1,
    borderTopColor: 'rgba(200,169,126,0.12)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  onboardingKeyboardAccessoryHandle: {
    width: 34,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.26)',
  },
  onboardingKeyboardAccessoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F2ECE3',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  onboardingKeyboardAccessoryButtonText: {
    color: '#0A0A0C',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingHero: {
    position: 'relative',
    minHeight: 176,
    marginBottom: 18,
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
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginBottom: 14,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingHeroTitle: {
    color: THEME.ink,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.9,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  onboardingHeroBody: {
    color: THEME.inkSoft,
    lineHeight: 22,
    fontSize: 14,
    maxWidth: 420,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliScreenShell: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#0A0A0C',
    gap: 24,
  },
  mowgliHeader: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mowgliHeaderCopy: {
    flex: 1,
    paddingRight: 14,
  },
  mowgliHeaderBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  mowgliHeaderBrandText: {
    color: '#C8A97E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.7,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeaderTitle: {
    color: '#F0F0EE',
    fontSize: 24,
    lineHeight: 26,
    marginBottom: 0,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliHeaderSubtitle: {
    color: '#93897E',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mowgliHeaderAction: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  mowgliHeaderActionDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#C8A97E',
  },
  mowgliLiftSoft: {
    transform: [{ translateY: -1 }],
    opacity: 0.96,
  },
  mowgliHeaderMinimal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    paddingTop: 2,
    paddingBottom: 8,
  },
  mowgliHeaderMinimalCopy: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  mowgliHeaderSmallLabel: {
    color: '#8F8579',
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeaderClinicName: {
    color: '#F2ECE3',
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliWelcomeBlock: {
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  mowgliWelcomeTitle: {
    color: '#F2ECE3',
    fontSize: 34,
    lineHeight: 37,
    letterSpacing: -1,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliWelcomeBody: {
    color: '#A59A8E',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 520,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliClinicHeroCard: {
    position: 'relative',
    overflow: 'hidden',
    height: 246,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
  },
  mowgliClinicHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliClinicHeroFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliClinicHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliClinicHeroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    gap: 5,
  },
  mowgliClinicHeroTitle: {
    color: '#F2ECE3',
    fontSize: 30,
    lineHeight: 33,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliClinicHeroBody: {
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 420,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverviewRail: {
    gap: 12,
    marginBottom: 10,
  },
  mowgliOverviewCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mowgliOverviewCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  mowgliOverviewCardCopy: {
    flex: 1,
    gap: 4,
  },
  mowgliOverviewCardTitle: {
    color: '#F2ECE3',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliOverviewCardBody: {
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverviewCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliHeroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#121214',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 20,
    minHeight: 244,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },
  mowgliHeroGlow: {
    position: 'absolute',
    top: -46,
    right: -24,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.11)',
  },
  mowgliHeroShimmer: {
    position: 'absolute',
    bottom: -20,
    left: 22,
    right: 22,
    height: 1,
    backgroundColor: 'rgba(200,169,126,0.36)',
  },
  mowgliHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  mowgliHeroChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#1A1A1D',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.16)',
  },
  mowgliHeroChipText: {
    color: '#C8A97E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
  },
  mowgliHeroStatusText: {
    color: '#E8D8BE',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeroEyebrow: {
    color: '#8B7F73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeroTitle: {
    color: '#F2ECE3',
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.9,
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliHeroBody: {
    color: '#A59A8E',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: 520,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliHeroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2ECE3',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  mowgliHeroCtaText: {
    color: '#0A0A0C',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliQuickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mowgliQuickActionCard: {
    flex: 1,
    minHeight: 136,
    backgroundColor: '#151518',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 16,
    justifyContent: 'space-between',
  },
  mowgliQuickActionPressed: {
    transform: [{ translateY: -1 }],
    borderColor: 'rgba(200,169,126,0.22)',
  },
  mowgliQuickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101013',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
    marginBottom: 16,
  },
  mowgliQuickActionTitle: {
    color: '#F2ECE3',
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 6,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliQuickActionCaption: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 20,
  },
  mowgliMembershipGlow: {
    position: 'absolute',
    top: -52,
    right: -32,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.09)',
  },
  mowgliMembershipTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  mowgliMembershipTitle: {
    color: '#F2ECE3',
    fontSize: 22,
    lineHeight: 25,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliMembershipIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#19191C',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
  },
  mowgliMembershipBody: {
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliTextLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mowgliTextLinkText: {
    color: '#C8A97E',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSectionBlock: {
    gap: 12,
  },
  mowgliSectionHead: {
    gap: 4,
  },
  mowgliSectionHeadCompact: {
    gap: 4,
    marginBottom: 12,
  },
  mowgliSectionEyebrow: {
    color: '#8B7F73',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSectionTitle: {
    color: '#F2ECE3',
    fontSize: 28,
    lineHeight: 30,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliSectionTitleSmall: {
    color: '#F2ECE3',
    fontSize: 21,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliArticleFeatured: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#121214',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 0,
    minHeight: 214,
  },
  mowgliArticleFeaturedGlow: {
    position: 'absolute',
    bottom: -72,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(200,169,126,0.08)',
  },
  mowgliArticleFeaturedImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliArticleFeaturedFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliArticleFeaturedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliArticleFeaturedContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 4,
  },
  mowgliArticleList: {
    gap: 10,
  },
  mowgliArticleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#151518',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
  },
  mowgliArticleThumb: {
    width: 78,
    height: 78,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101013',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
  },
  mowgliArticleRowImage: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#101013',
  },
  mowgliArticleCopy: {
    flex: 1,
    gap: 5,
  },
  mowgliArticleTag: {
    color: '#C8A97E',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleFeaturedTitle: {
    color: '#F2ECE3',
    fontSize: 27,
    lineHeight: 30,
    marginTop: 6,
    marginBottom: 6,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliArticleFeaturedBody: {
    color: '#A59A8E',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 420,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleTitle: {
    color: '#F2ECE3',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleBody: {
    color: '#8F8579',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleDetailStage: {
    gap: 0,
  },
  mowgliArticleDetailHero: {
    position: 'relative',
    height: 318,
    marginHorizontal: -24,
    marginTop: -12,
    overflow: 'hidden',
  },
  mowgliArticleDetailHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliArticleDetailHeroFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliArticleDetailHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliArticleDetailNavRow: {
    position: 'absolute',
    top: 22,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mowgliArticleDetailContent: {
    gap: 10,
    marginTop: -26,
    paddingTop: 22,
    paddingHorizontal: 2,
    paddingBottom: 20,
  },
  mowgliArticleDetailTitle: {
    color: '#F2ECE3',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliArticleDetailMeta: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleDetailBodyWrap: {
    gap: 12,
    marginTop: 6,
  },
  mowgliArticleDetailBody: {
    color: '#A59A8E',
    fontSize: 15,
    lineHeight: 25,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliArticleDetailNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  mowgliArticleDetailNoteText: {
    flex: 1,
    color: '#A59A8E',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliClinicCard: {
    backgroundColor: '#121214',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 18,
    overflow: 'hidden',
  },
  mowgliMapWrap: {
    height: 190,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  mowgliMapHint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10,10,12,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mowgliMapHintText: {
    color: '#F2ECE3',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliClinicMetaList: {
    gap: 10,
    marginBottom: 16,
  },
  mowgliClinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mowgliClinicMetaText: {
    flex: 1,
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliClinicActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mowgliClinicPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECE3',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mowgliClinicPrimaryText: {
    color: '#0A0A0C',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliClinicSecondary: {
    minWidth: 120,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
  },
  mowgliClinicSecondaryText: {
    color: '#F2ECE3',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliShopTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 4,
    gap: 6,
  },
  mowgliShopTab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  mowgliShopTabActive: {
    backgroundColor: '#17171A',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.16)',
  },
  mowgliShopTabText: {
    color: '#8F8579',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliShopTabTextActive: {
    color: '#E7D8C5',
  },
  mowgliShopSection: {
    gap: 14,
  },
  mowgliShopLead: {
    color: '#8F8579',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCategoryPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mowgliCategoryPill: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
  },
  mowgliCategoryPillActive: {
    backgroundColor: '#F2ECE3',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mowgliCategoryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101013',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
  },
  mowgliCategoryIconWrapActive: {
    backgroundColor: '#E6D7C4',
    borderColor: 'rgba(10,10,12,0.10)',
  },
  mowgliCategoryPillText: {
    color: '#F2ECE3',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCategoryPillTextActive: {
    color: '#0A0A0C',
  },
  mowgliProductGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  mowgliProductCard: {
    width: '48.2%',
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    overflow: 'hidden',
  },
  mowgliProductImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1A1A1D',
  },
  mowgliProductImageFallback: {
    width: '100%',
    height: 180,
    backgroundColor: '#101013',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliProductBody: {
    padding: 14,
  },
  mowgliProductMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  mowgliProductMeta: {
    color: '#C8A97E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProductPrice: {
    color: '#F2ECE3',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProductTitle: {
    color: '#F2ECE3',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProductDescription: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliEmptyCard: {
    gap: 8,
    backgroundColor: '#151518',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 16,
    alignItems: 'flex-start',
  },
  mowgliEmptyTitle: {
    color: '#F2ECE3',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliEmptyBody: {
    color: '#8F8579',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailCard: {
    gap: 14,
    backgroundColor: '#121214',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 18,
    overflow: 'hidden',
  },
  mowgliDetailImage: {
    width: '100%',
    height: 244,
    borderRadius: 22,
    backgroundColor: '#16161A',
  },
  mowgliDetailImageFallback: {
    width: '100%',
    height: 244,
    borderRadius: 22,
    backgroundColor: '#16161A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliDetailGalleryRow: {
    gap: 10,
  },
  mowgliDetailThumbImage: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: '#16161A',
  },
  mowgliDetailTitle: {
    color: '#F2ECE3',
    fontSize: 28,
    lineHeight: 31,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliDetailBody: {
    color: '#A59A8E',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailMeta: {
    color: '#C8A97E',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliUnitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mowgliUnitsButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
  },
  mowgliUnitsButtonText: {
    color: '#F2ECE3',
    fontSize: 22,
    fontWeight: '500',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliUnitsValueWrap: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
  },
  mowgliUnitsValue: {
    color: '#F2ECE3',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailPriceCard: {
    gap: 6,
    backgroundColor: '#17171A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 14,
  },
  mowgliDetailPriceMain: {
    color: '#F2ECE3',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailPriceSub: {
    color: '#C8A97E',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailHint: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipPlanCard: {
    gap: 12,
    backgroundColor: '#121214',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 18,
  },
  mowgliMembershipPlanCardActive: {
    borderColor: 'rgba(200,169,126,0.28)',
    backgroundColor: '#161413',
  },
  mowgliMembershipPlanTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  mowgliMembershipPlanCopy: {
    flex: 1,
    gap: 4,
  },
  mowgliMembershipPlanTitle: {
    color: '#F2ECE3',
    fontSize: 24,
    lineHeight: 27,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliMembershipPlanPrice: {
    color: '#C8A97E',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipPerkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mowgliMembershipPerkText: {
    flex: 1,
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliIncludedList: {
    gap: 8,
  },
  mowgliIncludedLabel: {
    color: '#8B7F73',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliIncludedCard: {
    backgroundColor: '#17171A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 12,
  },
  mowgliIncludedCardTitle: {
    color: '#F2ECE3',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliIncludedCardMeta: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipCta: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECE3',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mowgliMembershipCtaActive: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D1A18',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.26)',
  },
  mowgliMembershipCtaText: {
    color: '#0A0A0C',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipCtaTextActive: {
    color: '#E7D8C5',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCatalogRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#151518',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.10)',
    padding: 14,
  },
  mowgliCatalogCopy: {
    flex: 1,
    gap: 6,
  },
  mowgliCatalogTitle: {
    color: '#F2ECE3',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCatalogBody: {
    color: '#8F8579',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCatalogMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  mowgliCatalogPrice: {
    color: '#F2ECE3',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCatalogDuration: {
    color: '#C8A97E',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartCard: {
    gap: 10,
    backgroundColor: '#121214',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.14)',
    padding: 18,
  },
  mowgliCartTitle: {
    color: '#F2ECE3',
    fontSize: 22,
    lineHeight: 25,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliCartItem: {
    color: '#A59A8E',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartTotal: {
    color: '#F2ECE3',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCheckoutMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  mowgliCheckoutMethodChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#17171A',
    borderWidth: 1,
    borderColor: 'rgba(200,169,126,0.12)',
  },
  mowgliCheckoutMethodChipActive: {
    backgroundColor: '#F2ECE3',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mowgliCheckoutMethodChipText: {
    color: '#E7D8C5',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCheckoutMethodChipTextActive: {
    color: '#0A0A0C',
  },
  mowgliBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 28,
  },
  mowgliBottomTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliBottomTabCenter: {
    width: 56,
    height: 56,
    flex: 0,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: -18,
  },
  mowgliBottomTabActive: {
    backgroundColor: 'transparent',
  },
  mowgliBottomTabCenterActive: {},
  mowgliBottomTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliBottomIndicator: {
    width: 4,
    height: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  mowgliFeaturedHero: {
    height: 220,
    borderRadius: 14,
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 28,
  },
  mowgliFeaturedHeroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliFeaturedHeroFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliFeaturedHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliFeaturedHeroContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  mowgliFeaturedTag: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliFeaturedTitle: {
    fontSize: 28,
    lineHeight: 31,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliFeaturedBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 12,
  },
  mowgliSectionLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliPopularRow: {
    gap: 12,
    paddingBottom: 8,
    paddingRight: 12,
  },
  mowgliPopularCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mowgliPopularCardImage: {
    width: '100%',
    height: 100,
  },
  mowgliPopularCardFallback: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliPopularCardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mowgliPopularCardTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliPopularCardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  mowgliPopularCardMeta: {
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliPopularCardPrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMembershipPanel: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 16,
    marginBottom: 22,
    gap: 10,
  },
  mowgliMembershipPanelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  mowgliMembershipPanelTitle: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 25,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliMembershipPanelBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliActionSquareRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mowgliActionSquare: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 0,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
  },
  mowgliActionSquareIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliActionSquareTitle: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliKnowledgeList: {
    gap: 14,
    marginBottom: 24,
  },
  mowgliKnowledgeRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'stretch',
  },
  mowgliKnowledgeThumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliKnowledgeCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  mowgliKnowledgeTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliKnowledgeBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliMapPreview: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
  },
  mowgliScanShell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 96,
  },
  mowgliScanCenter: {
    alignItems: 'center',
  },
  mowgliScanBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  mowgliScanTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    marginBottom: 8,
  },
  mowgliScanBody: {
    maxWidth: 270,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliScanQrShell: {
    width: 256,
    height: 256,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#C8A97E',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  mowgliScanQrCard: {
    width: 216,
    height: 216,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliScanQrMark: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliScanManualCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  mowgliScanManualLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliScanManualValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliScanManualBody: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliScanToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  mowgliScanToggleText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayCard: {
    position: 'absolute',
    top: 88,
    left: 18,
    right: 18,
    bottom: 112,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  mowgliOverlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  mowgliOverlayTitleStack: {
    flex: 1,
    gap: 4,
  },
  mowgliOverlayEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayTitle: {
    fontSize: 28,
    lineHeight: 31,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliOverlaySubtitle: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayDivider: {
    height: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  mowgliOverlayInputShell: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mowgliOverlayInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayHint: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlaySectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayResults: {
    flex: 1,
    marginTop: 16,
  },
  mowgliOverlayResultsContent: {
    paddingBottom: 10,
    gap: 10,
  },
  mowgliOverlayResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  mowgliOverlayResultIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliOverlayResultCopy: {
    flex: 1,
    gap: 2,
  },
  mowgliOverlayResultTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayResultMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliOverlayFooterSection: {
    marginTop: 18,
  },
  mowgliCartOverlayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  mowgliCartOverlayMain: {
    flex: 1,
    gap: 6,
  },
  mowgliCartOverlayName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  mowgliCartOverlayStepBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliCartOverlayStepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayUnitsText: {
    minWidth: 18,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 'auto',
  },
  mowgliCartOverlayRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayPrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayFooter: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mowgliCartOverlayTotalLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliCartOverlayTotalValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsBalanceValue: {
    marginTop: 8,
    fontSize: 54,
    lineHeight: 56,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliRewardsBalanceSubtext: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    width: '100%',
  },
  mowgliRewardsStatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  mowgliRewardsStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsStatValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  mowgliRewardsActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliRewardsActionCopy: {
    flex: 1,
    gap: 2,
  },
  mowgliRewardsActionTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsActionMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsInlineCta: {
    minWidth: 70,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliRewardsInlineCtaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsActionCta: {
    minWidth: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliRewardsActionCtaText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsRedeemRow: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingRight: 12,
    gap: 12,
  },
  mowgliRewardsRedeemCard: {
    width: 220,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  mowgliRewardsRedeemIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliRewardsRedeemTitle: {
    fontSize: 18,
    lineHeight: 21,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliRewardsRedeemPoints: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsRedeemButton: {
    marginTop: 'auto',
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mowgliRewardsRedeemButtonText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  mowgliRewardsHistoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliRewardsHistoryCopy: {
    flex: 1,
    gap: 2,
  },
  mowgliRewardsHistoryTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsHistoryMeta: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsHistoryValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  mowgliProfileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliProfileAvatarText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliProfileIdentityCopy: {
    flex: 1,
    gap: 4,
  },
  mowgliProfileIdentityName: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliProfileIdentityMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSettingsCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  mowgliSettingsLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSettingsInputShell: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  mowgliSettingsInput: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliSettingsInfoText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  mowgliProfileMenuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliProfileMenuCopy: {
    flex: 1,
    gap: 2,
  },
  mowgliProfileMenuTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMenuSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsHeader: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  mowgliRewardsHeaderTitle: {
    fontSize: 34,
    lineHeight: 38,
    marginTop: 2,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliRewardsHeaderSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsBalancePanel: {
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: 24,
  },
  mowgliRewardsBalanceGlow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 150,
    height: 150,
    borderRadius: 999,
  },
  mowgliRewardsBalanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  mowgliRewardsBalanceLabel: {
    fontSize: 12,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsBalanceChip: {
    marginTop: 14,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mowgliRewardsBalanceChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardCardRow: {
    gap: 14,
    paddingBottom: 10,
    paddingRight: 12,
    marginBottom: 24,
  },
  mowgliRewardCard: {
    width: 170,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mowgliRewardCardVisual: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  mowgliRewardCardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mowgliRewardCardTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardCardPointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  mowgliRewardCardPoints: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardCardPointsMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardCardTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  mowgliRewardCardTrackFill: {
    height: '100%',
    borderRadius: 999,
  },
  mowgliRewardCardProgressLabel: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardCardButton: {
    marginTop: 12,
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  mowgliRewardCardButtonText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliRewardsActionList: {
    gap: 10,
    marginBottom: 24,
  },
  mowgliRewardsHistoryList: {
    gap: 10,
    marginBottom: 24,
  },
  mowgliProfileHeader: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  mowgliProfileHeaderTitle: {
    fontSize: 34,
    lineHeight: 38,
    marginTop: 2,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliProfileIdentityShell: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 24,
  },
  mowgliProfileIdentityGlow: {
    position: 'absolute',
    top: -22,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
  },
  mowgliProfileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 18,
  },
  mowgliProfileAvatarLarge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliProfileAvatarLargeText: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliProfileTopCopy: {
    flex: 1,
  },
  mowgliProfileTopName: {
    fontSize: 28,
    lineHeight: 31,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },
  mowgliProfileTopMeta: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  mowgliProfileTopBadgeText: {
    fontSize: 12,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileIdentityBadgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mowgliProfileIdentityBadge: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  mowgliProfileIdentityBadgeLabel: {
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileIdentityBadgeValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMembershipTeaser: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: 'hidden',
    marginBottom: 24,
  },
  mowgliProfileMembershipMark: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 96,
    height: 96,
    borderRadius: 999,
  },
  mowgliProfileMembershipTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMembershipMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMembershipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  mowgliProfileMembershipLinkText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileHistoryList: {
    gap: 10,
    marginBottom: 24,
  },
  mowgliProfileThemeToggle: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  mowgliProfileThemeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliProfileThemeButtonText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliProfileMenuList: {
    marginBottom: 24,
  },
  mowgliDetailStage: {
    marginHorizontal: -18,
    paddingBottom: 120,
  },
  mowgliDetailHero: {
    position: 'relative',
    height: 348,
    width: '100%',
    overflow: 'hidden',
  },
  mowgliDetailHeroImage: {
    width: '100%',
    height: '100%',
  },
  mowgliDetailHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mowgliDetailHeroNavRow: {
    position: 'absolute',
    top: 22,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mowgliDetailHeroNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowgliDetailContent: {
    marginTop: -26,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  mowgliDetailHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  mowgliDetailPriceStack: {
    alignItems: 'flex-end',
  },
  mowgliDetailHeroPrice: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailHeroPriceMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailTagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  mowgliDetailTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mowgliDetailTagText: {
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailSection: {
    marginBottom: 22,
  },
  mowgliDetailSectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  mowgliDetailBenefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  mowgliDetailStickyBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  mowgliDetailSecondaryCta: {
    minWidth: 158,
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mowgliDetailSecondaryCtaText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 138,
    paddingTop: 18,
  },
  headerShell: {
    marginBottom: 18,
    gap: 8,
  },
  headerContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerContextPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
    shadowColor: '#0F1C33',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  headerContextDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: THEME.accent,
  },
  headerContextText: {
    color: THEME.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: UI_FONT_FAMILY,
  },
  headerContextMeta: {
    flex: 1,
    textAlign: 'right',
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerAvatar: {
    position: 'relative',
    overflow: 'hidden',
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.99)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F1C33',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerAvatarGlow: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(39,128,199,0.12)',
  },
  headerAvatarText: {
    color: '#176CB8',
    fontWeight: '800',
    fontSize: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  headerTitleStack: {
    flex: 1,
  },
  headerClinic: {
    alignSelf: 'flex-start',
    fontSize: 10,
    letterSpacing: 0.7,
    color: THEME.inkSoft,
    marginTop: 0,
    backgroundColor: SURFACE_SOFT,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 26,
    letterSpacing: -0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  headerSubline: {
    color: THEME.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButtonWrap: {
    backgroundColor: 'rgba(255,255,255,0.99)',
    borderColor: THEME.border,
    borderWidth: 1,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F1C33',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
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
  overlayBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  searchOverlayCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 74,
    marginHorizontal: 14,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    borderRadius: 24,
    padding: 20,
    maxHeight: 448,
    shadowColor: '#10223C',
    shadowOpacity: 0.13,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  cartOverlayCard: {
    position: 'relative',
    overflow: 'hidden',
    marginTop: 74,
    marginHorizontal: 14,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    borderRadius: 24,
    padding: 20,
    maxHeight: 520,
    shadowColor: '#10223C',
    shadowOpacity: 0.13,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  surfaceRim: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.74)',
  },
  surfaceRimSoft: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.68)',
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
    height: 74,
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  searchOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  overlayTitleStack: {
    flex: 1,
  },
  overlayEyebrow: {
    color: THEME.mutedSoft,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
    fontSize: 10,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayTitle: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
    color: THEME.ink,
    fontFamily: UI_FONT_FAMILY,
  },
  overlaySubTitle: {
    color: THEME.inkSoft,
    lineHeight: 20,
    marginBottom: 10,
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  overlayHeaderDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginBottom: 12,
  },
  overlayCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE_SOFT,
  },
  searchOverlayInputShell: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  searchOverlayInput: {
    flex: 1,
    minHeight: 46,
    color: THEME.ink,
    paddingVertical: 0,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayHint: {
    color: THEME.muted,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 19,
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayResults: {
    maxHeight: 280,
  },
  searchOverlayResultsContent: {
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  overlaySectionLabel: {
    color: THEME.mutedSoft,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: SURFACE_SOFT,
  },
  searchOverlayIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: THEME.accentSoft,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRowPressed: {
    transform: [{ scale: 0.994 }],
    opacity: 0.94,
  },
  searchOverlayMain: {
    flex: 1,
    gap: 1,
  },
  searchOverlayRowTitle: {
    color: THEME.ink,
    fontWeight: '700',
    fontSize: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  searchOverlayRowMeta: {
    color: THEME.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: SURFACE_SOFT,
  },
  cartOverlayMain: {
    flex: 1,
    marginRight: 10,
  },
  cartOverlayName: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 3,
    fontFamily: UI_FONT_FAMILY,
  },
  cartOverlayMeta: {
    color: THEME.inkSoft,
    fontSize: 12,
    lineHeight: 17,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
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
    borderColor: '#E9DADF',
    backgroundColor: '#F9F2F5',
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
    borderRadius: 11,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutMethodChipActive: {
    borderColor: '#CBD9E8',
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
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: SURFACE_SOFT,
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
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#10223C',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  heroPanelGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  heroCornerPlate: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 76,
    height: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(215,225,235,0.98)',
    backgroundColor: 'rgba(244,248,252,0.92)',
  },
  heroLiquidShine: {
    position: 'absolute',
    top: -18,
    left: -200,
    width: 102,
    height: 292,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.76)',
  },
  heroAeroCluster: {
    position: 'absolute',
    top: 58,
    right: 12,
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAeroHalo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(20,151,232,0.08)',
  },
  heroAeroCore: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(210,229,242,0.98)',
  },
  heroAeroRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(20,151,232,0.18)',
  },
  heroAeroDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#2A72DA',
    shadowColor: '#83DFFF',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  heroGlossArc: {
    position: 'absolute',
    top: -16,
    left: -20,
    right: 82,
    height: 118,
    borderRadius: 66,
    backgroundColor: 'rgba(255,255,255,0.90)',
    transform: [{ rotate: '-5deg' }],
  },
  heroGlassPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 72,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(20,151,232,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(163,213,244,0.9)',
  },
  heroPearl: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.46)',
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -22,
    right: -32,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(20,151,232,0.08)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -54,
    left: -30,
    width: 132,
    height: 132,
    borderRadius: 999,
    backgroundColor: 'rgba(241,124,199,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  heroLabelChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
  },
  heroLabelChipText: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    fontFamily: UI_FONT_FAMILY,
  },
  heroSoftPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: SURFACE_SOFT,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  heroSoftPillText: {
    color: THEME.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  heroEyebrow: {
    fontSize: 10,
    letterSpacing: 1,
    color: THEME.mutedSoft,
    marginBottom: 8,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  heroTitle: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 10,
    letterSpacing: -0.9,
    fontFamily: UI_FONT_FAMILY,
  },
  heroBody: {
    color: THEME.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
    maxWidth: 290,
    fontFamily: UI_FONT_FAMILY,
  },
  heroSummaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroSummaryBlock: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroSummaryDivider: {
    width: 1,
    backgroundColor: THEME.border,
  },
  heroSummaryValue: {
    color: THEME.ink,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
    marginBottom: 3,
    fontFamily: UI_FONT_FAMILY,
  },
  heroSummaryLabel: {
    color: THEME.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    fontFamily: UI_FONT_FAMILY,
  },
  heroCta: {
    alignSelf: 'stretch',
    backgroundColor: THEME.accent,
    borderColor: '#D9E8F6',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: '#174A7C',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'hidden',
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
    textAlign: 'center',
  },
  financeBanner: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#10223C',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  financeGlow: {
    position: 'absolute',
    top: -18,
    right: -8,
    width: 84,
    height: 84,
    borderRadius: 999,
    backgroundColor: 'rgba(39,128,199,0.10)',
  },
  financeTitle: {
    color: THEME.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.3,
    fontFamily: UI_FONT_FAMILY,
  },
  financeBody: {
    color: THEME.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderCompact: {
    marginTop: 10,
  },
  sectionEyebrow: {
    color: THEME.accent,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 6,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
    letterSpacing: -0.55,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionLead: {
    color: THEME.inkSoft,
    lineHeight: 20,
    fontSize: 13,
    maxWidth: 310,
    fontFamily: UI_FONT_FAMILY,
  },
  sectionSubTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.ink,
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: -0.25,
    fontFamily: UI_FONT_FAMILY,
  },
  articleCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_RAISED,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#10223C',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  articleCardFeatured: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  articleCardEditorial: {
    paddingRight: 26,
  },
  articleEditorialGlow: {
    position: 'absolute',
    top: -18,
    right: -16,
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: 'rgba(39,128,199,0.08)',
  },
  articleCompactGrid: {
    gap: 10,
    marginBottom: 4,
  },
  articleCardCompact: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 0,
  },
  articleTag: {
    alignSelf: 'flex-start',
    color: THEME.inkSoft,
    fontWeight: '700',
    marginBottom: 8,
    backgroundColor: SURFACE_SOFT,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    letterSpacing: 0.4,
    borderWidth: 1,
    borderColor: THEME.border,
    fontFamily: UI_FONT_FAMILY,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 5,
    letterSpacing: -0.3,
    fontFamily: UI_FONT_FAMILY,
  },
  articleTitleFeatured: {
    fontSize: 20,
    lineHeight: 23,
    letterSpacing: -0.45,
  },
  articleBody: {
    color: THEME.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  articleBodyFeatured: {
    fontSize: 13,
    lineHeight: 20,
  },
  clinicCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_RAISED,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#10223C',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  clinicHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  clinicCaption: {
    color: THEME.muted,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 226,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicStatusPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
  },
  clinicStatusPillText: {
    color: THEME.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: UI_FONT_FAMILY,
  },
  mapWrap: {
    height: 170,
    borderRadius: 22,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicMeta: {
    color: THEME.muted,
    marginBottom: 2,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
    fontFamily: UI_FONT_FAMILY,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clinicActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  clinicPrimaryAction: {
    flex: 1,
    marginTop: 0,
  },
  clinicSecondaryAction: {
    flex: 1,
    marginTop: 0,
  },
  callNowCta: {
    marginTop: 12,
    backgroundColor: THEME.accent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E8F6',
    paddingVertical: 11,
    alignItems: 'center',
    shadowColor: '#174A7C',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  callNowCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  segmentRow: {
    backgroundColor: SURFACE_SOFT,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 18,
    padding: 5,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
    shadowColor: '#10223C',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#10223C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  segmentText: {
    color: THEME.muted,
    fontWeight: '600',
    fontSize: 13,
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
    borderRadius: 20,
    backgroundColor: SURFACE_PANEL,
    padding: 5,
    marginBottom: 16,
    shadowColor: '#3D79C0',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  shopTabBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
  },
  shopTabBtnActive: {
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#10223C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  shopTabText: {
    color: THEME.muted,
    fontSize: 13,
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
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    marginBottom: 18,
    shadowColor: '#536EA6',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    backgroundColor: 'rgba(255,255,255,0.82)',
    transform: [{ rotate: '-6deg' }],
  },
  shopPinkHeroPearl: {
    position: 'absolute',
    bottom: -24,
    right: -10,
    width: 122,
    height: 122,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  shopPinkHeroGlow: {
    position: 'absolute',
    top: -14,
    right: -10,
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: 'rgba(20,151,232,0.12)',
  },
  shopHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  shopHeroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_TINT,
  },
  shopHeroBadgeText: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    fontFamily: UI_FONT_FAMILY,
  },
  shopHeroBadgeSoft: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_SOFT,
  },
  shopHeroBadgeSoftText: {
    color: THEME.inkSoft,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  shopHeroFactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  shopHeroFactPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_SOFT,
  },
  shopHeroFactText: {
    color: THEME.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  shopPinkHeroTitle: {
    color: THEME.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  shopPinkHeroBody: {
    color: THEME.inkSoft,
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: UI_FONT_FAMILY,
  },
  shopPinkHeroCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F91E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(225,243,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#65DEFF',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: 'hidden',
  },
  shopPinkHeroCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTile: {
    position: 'relative',
    overflow: 'hidden',
    width: '31.5%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 98,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 20,
    shadowColor: '#3D79C0',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  categoryTileActive: {
    borderColor: THEME.accent,
    backgroundColor: SURFACE_RAISED,
    shadowColor: '#17385E',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  categoryTilePressed: {
    transform: [{ translateY: -3 }],
  },
  categoryTileGloss: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: 22,
    height: 44,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ rotate: '-6deg' }],
  },
  categoryTileGlow: {
    position: 'absolute',
    top: -10,
    right: -8,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  categoryTileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_PANEL,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileIconWrapActive: {
    borderColor: THEME.accent,
    backgroundColor: SURFACE_RAISED,
  },
  categoryTileText: {
    color: THEME.inkSoft,
    fontWeight: '700',
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 15,
    fontFamily: UI_FONT_FAMILY,
  },
  categoryTileTextActive: {
    color: THEME.ink,
    fontWeight: '800',
  },
  sectionMetaPill: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_PANEL,
  },
  sectionMetaPillText: {
    color: THEME.inkSoft,
    fontWeight: '700',
    fontSize: 11,
    fontFamily: UI_FONT_FAMILY,
  },
  shopListTitle: {
    color: THEME.ink,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.55,
    fontFamily: UI_FONT_FAMILY,
  },
  shopListSubtitle: {
    color: THEME.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  treatmentCard: {
    position: 'relative',
    width: '48.3%',
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#3D79C0',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  treatmentCardFeatured: {
    width: '100%',
    borderRadius: 24,
    marginBottom: 14,
    shadowOpacity: 0.07,
    shadowRadius: 14,
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
    height: 116,
    backgroundColor: THEME.surfaceMuted,
  },
  treatmentImageReal: {
    height: 116,
    width: '100%',
    backgroundColor: THEME.surfaceMuted,
  },
  treatmentImageFeatured: {
    height: 136,
  },
  treatmentCardBody: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 13,
  },
  treatmentMetaRow: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  treatmentMetaPill: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_SOFT,
    overflow: 'hidden',
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentDescription: {
    color: THEME.inkSoft,
    lineHeight: 17,
    minHeight: 36,
    fontSize: 12,
    marginBottom: 8,
    fontFamily: UI_FONT_FAMILY,
  },
  treatmentDescriptionFeatured: {
    minHeight: 46,
  },
  treatmentPrice: {
    color: THEME.ink,
    fontWeight: '800',
    fontSize: 14,
    fontFamily: UI_FONT_FAMILY,
  },
  detailCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 26,
    padding: 18,
    shadowColor: '#335C92',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  detailImage: {
    width: '100%',
    height: 184,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: THEME.surfaceMuted,
  },
  detailImageMock: {
    width: '100%',
    height: 184,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: THEME.surfaceMuted,
  },
  detailGalleryRow: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 4,
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
    fontSize: 28,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 30,
    marginBottom: 8,
    letterSpacing: -0.6,
    fontFamily: UI_FONT_FAMILY,
  },
  detailBody: {
    color: THEME.muted,
    lineHeight: 20,
    fontSize: 13,
    marginBottom: 8,
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
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_TINT,
    paddingHorizontal: 15,
    paddingVertical: 13,
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
    marginTop: 12,
    backgroundColor: THEME.accent,
    borderWidth: 1,
    borderColor: '#D9E8F6',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#174A7C',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    overflow: 'hidden',
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontFamily: UI_FONT_FAMILY,
  },
  secondaryCta: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#10223C',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
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
    fontFamily: UI_FONT_FAMILY,
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
    borderRadius: 32,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#486798',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
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
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#355A90',
    shadowOpacity: 0.1,
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
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#296FDC',
    borderWidth: 1,
    borderColor: 'rgba(230,241,255,0.72)',
    marginBottom: 16,
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
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.95,
    fontFamily: UI_FONT_FAMILY,
  },
  shopMembershipHeroBody: {
    color: '#D5E1EF',
    lineHeight: 22,
    marginBottom: 14,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    backgroundColor: SURFACE_PANEL,
    minHeight: 84,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 19,
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
    borderRadius: 22,
    backgroundColor: SURFACE_PANEL,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.07,
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
    borderRadius: 26,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 18,
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
    marginTop: 18,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 30,
    padding: 20,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  surfaceGlossStrip: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 42,
    height: 34,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ rotate: '-3deg' }],
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
    borderRadius: 28,
    padding: 18,
    backgroundColor: THEME.rewardsB,
    borderWidth: 1,
    borderColor: 'rgba(229,241,255,0.62)',
    marginBottom: 16,
    shadowColor: '#2B63B1',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  rewardsBalanceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
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
    top: 20,
    right: 14,
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsOrbitCore: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
  },
  rewardsOrbitRing: {
    position: 'absolute',
    width: 42,
    height: 42,
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
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceEyebrow: {
    color: '#D9F5F2',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 4,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceLabel: {
    color: '#D4EEEB',
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  rewardsBalanceStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsCardStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  rewardsCardStatItem: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  rewardsCardStatValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 2,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsCardStatLabel: {
    color: '#D9F0EC',
    fontSize: 10,
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
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceJoined: {
    color: '#CCE5E2',
    marginTop: 4,
    fontSize: 11,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsBalanceCash: {
    color: '#E5FAF7',
    marginTop: 4,
    fontSize: 11,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 12,
    gap: 12,
  },
  rewardsHeaderTitle: {
    color: THEME.ink,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: -0.55,
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
    padding: 5,
    marginBottom: 14,
    shadowColor: '#3D79C0',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  rewardsSegmentBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
  },
  rewardsSegmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: BORDER_TINT,
  },
  rewardsSegmentText: {
    color: THEME.muted,
    fontWeight: '600',
    fontSize: 13,
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsSegmentTextActive: {
    color: THEME.ink,
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
  rewardsSectionTitle: {
    color: THEME.ink,
    fontSize: 19,
    lineHeight: 22,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.45,
    fontFamily: UI_FONT_FAMILY,
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
    marginBottom: 10,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
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
    backgroundColor: '#1F91E9',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(224,243,255,0.88)',
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
    borderRadius: 26,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
    backgroundColor: '#1F91E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(224,243,255,0.88)',
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
    borderRadius: 26,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
    borderRadius: 32,
    padding: 22,
    marginBottom: 14,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
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
    borderRadius: 24,
    padding: 18,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
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
    borderRadius: 26,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
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
    borderRadius: 30,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
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
    fontFamily: UI_FONT_FAMILY,
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
    borderRadius: 32,
    padding: 20,
    gap: 2,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    backgroundColor: SURFACE_PANEL,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: THEME.ink,
    marginBottom: 12,
    fontFamily: UI_FONT_FAMILY,
  },
  otpCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 24,
    backgroundColor: SURFACE_PANEL,
    padding: 16,
  },
  otpTitle: {
    color: THEME.ink,
    fontWeight: '800',
    marginBottom: 10,
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
    marginTop: 12,
    marginBottom: 4,
    lineHeight: 21,
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
    borderRadius: 24,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
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
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    marginTop: 12,
    backgroundColor: SURFACE_TINT,
    borderColor: BORDER_TINT,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#69CFF0',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
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
    marginTop: 16,
    backgroundColor: SURFACE_RAISED,
    borderWidth: 1,
    borderColor: BORDER_TINT,
    borderRadius: 22,
    padding: 14,
    shadowColor: '#3E7AC2',
    shadowOpacity: 0.08,
    shadowRadius: 14,
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
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: SURFACE_RAISED,
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#10223C',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  bottomBarGlow: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: -12,
    height: 42,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  bottomBarGloss: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 3,
    zIndex: 1,
    overflow: 'hidden',
  },
  bottomTabBtnCenter: {
    marginTop: -10,
    marginHorizontal: 4,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: THEME.accent,
    borderWidth: 1,
    borderColor: '#D9E8F6',
    shadowColor: '#174A7C',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bottomTabBtnActive: {
    backgroundColor: SURFACE_PANEL,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#10223C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bottomTabBtnCenterActive: {
    backgroundColor: '#216EA9',
    borderColor: '#D9E8F6',
  },
  bottomTabActiveGlow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 4,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(39,128,199,0.12)',
  },
  bottomTabActiveBeam: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
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
    fontSize: 11,
    fontFamily: UI_FONT_FAMILY,
  },
  bottomTabLabelCenter: {
    color: '#FFFFFF',
  },
  bottomTabLabelActive: {
    color: '#184E83',
    fontWeight: '800',
    fontFamily: UI_FONT_FAMILY,
  },
});
