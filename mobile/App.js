import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME = {
  background: '#F5F6FA',
  surface: '#FFFFFF',
  ink: '#1F2430',
  muted: '#7C8393',
  brand: '#EB6BA4',
  brandSoft: '#FBE6F1',
  accent: '#5CA3A8',
  good: '#1F8E52',
  border: '#E9ECF2',
  rewardsA: '#71BAC0',
  rewardsB: '#3F8F97',
};

const CLINIC = {
  name: 'Moser Milani Medical Spa',
  shortName: 'MOMI',
  address: 'Schottengasse 7, 1010 Wien',
  openingHours: 'Mo - Sa, 09:00 - 17:00',
  phone: '+43 1 236 13 36',
  city: 'Wien',
};

// White-label defaults for patient app (optional):
// If set, the app loads clinic bundle automatically on first launch.
const APP_DEFAULT_BACKEND_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
const APP_DEFAULT_CLINIC_NAME = process.env.EXPO_PUBLIC_DEFAULT_CLINIC_NAME || '';
const MOBILE_OTP_COOLDOWN_SECONDS_FALLBACK = 30;
const SHOW_TECHNICAL_SETUP = __DEV__;
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
  if (lower.startsWith('appointmentix://clinic/')) {
    return decodeURIComponent(raw.slice('appointmentix://clinic/'.length)).trim();
  }
  return raw;
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

async function fetchClinicBundle(baseUrl, clinicName) {
  const safeBaseUrl = normalizeUrl(baseUrl);
  const query = clinicName ? `?clinicName=${encodeURIComponent(clinicName.trim())}` : '';
  const response = await fetchWithRetry(`${safeBaseUrl}/api/mobile/clinic-bundle${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }, { timeoutMs: 9000, retries: 1, retryDelayMs: 450 });

  if (!response.ok) {
    const text = await response.text();
    let message = 'Klinikdaten konnten nicht geladen werden.';
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
    let message = 'Klinik-Suche fehlgeschlagen.';
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
  }, { timeoutMs: 25000, retries: 2, retryDelayMs: 800 });

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
  }, { timeoutMs: 25000, retries: 2, retryDelayMs: 800 });

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
  }, { timeoutMs: 25000, retries: 2, retryDelayMs: 800 });

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

function describeConnectionError(baseUrl, error) {
  const message = String(error?.message || error || '').trim();
  const normalized = normalizeUrl(baseUrl);
  if (normalized.includes(':4137')) {
    return [
      'Verbindung fehlgeschlagen.',
      `URL: ${normalized}`,
      'Port-Hinweis: Bitte 4173 statt 4137 verwenden.',
      'Bitte prüfen: gleiche WLAN-Verbindung und Server läuft auf dem Mac.',
    ].join('\n');
  }
  if (message.toLowerCase().includes('request timeout')) {
    return [
      'Backend hat nicht rechtzeitig geantwortet.',
      `URL: ${normalized || '(leer)'}`,
      'Bitte prüfen: gleiche WLAN-Verbindung, Mac-IP statt localhost, Port 4173 aktiv.',
    ].join('\n');
  }
  if (message.toLowerCase().includes('network request failed')) {
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
          style={styles.iconButtonWrap}
          onPress={onSearchPress}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color="#5E6676" />
        </Pressable>
        <Pressable
          style={styles.iconButtonWrap}
          onPress={onCartPress}
          hitSlop={8}
        >
          <Ionicons name="bag-handle-outline" size={21} color="#5E6676" />
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
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ShopTabButton({ label, active, onPress }) {
  return (
    <Pressable style={styles.shopTabBtn} onPress={onPress}>
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
      style={[styles.bottomTabBtn, active && styles.bottomTabBtnActive]}
      onPress={onPress}
    >
      <Ionicons
        name={active ? iconSpec.active : iconSpec.inactive}
        size={18}
        color={active ? THEME.brand : '#8B93A2'}
      />
      <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function TreatmentCard({ treatment, onPress }) {
  const imageUrl = preferredTreatmentImage(treatment);
  return (
    <Pressable style={styles.treatmentCard} onPress={() => onPress(treatment)}>
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
  const [clinicLookupName, setClinicLookupName] = useState(CLINIC.name);
  const [analyticsConnected, setAnalyticsConnected] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicSearchResults, setClinicSearchResults] = useState([]);
  const [clinicSearchLoading, setClinicSearchLoading] = useState(false);
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
  const [showTechnicalSetup, setShowTechnicalSetup] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [selectedCheckoutMethod, setSelectedCheckoutMethod] = useState('card');

  const [cartItems, setCartItems] = useState([]);
  const [cartSyncing, setCartSyncing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
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

  async function runWithBaseUrlFallback(baseUrlHint, runner) {
    const candidates = [];
    const preferred = normalizeUrl(baseUrlHint);
    if (preferred) {
      candidates.push(preferred);
    }
    if (expoBackendUrl && !candidates.includes(expoBackendUrl)) {
      candidates.push(expoBackendUrl);
    }
    if (candidates.length === 0) {
      throw new Error('Backend URL fehlt');
    }

    let lastError = null;
    for (let idx = 0; idx < candidates.length; idx += 1) {
      const candidate = candidates[idx];
      try {
        const value = await runner(candidate);
        if (candidate !== normalizeUrl(analyticsBaseUrl)) {
          setAnalyticsBaseUrl(candidate);
          setOnboardingBaseUrl(candidate);
          await writeSecureValue(STORAGE_KEYS.analyticsBaseUrl, candidate);
        }
        return { value, baseUrl: candidate, usedFallback: idx > 0 };
      } catch (error) {
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

  async function loadClinicBundle(nextBaseUrl = '', nextClinicName = '', nextEmail = '') {
    const normalized = normalizeUrl(nextBaseUrl || analyticsBaseUrl);
    if (!normalized) {
      setAnalyticsConnected(false);
      Alert.alert('Service nicht verfügbar', 'Klinikdaten konnten nicht geladen werden.');
      return;
    }

    const resolvedClinicName = String(nextClinicName || clinicLookupName || '').trim();
    const payload = await fetchClinicBundle(normalized, resolvedClinicName);
    const catalog = payload.catalog || {};
    const clinic = payload.clinic || {};

    if (Array.isArray(catalog.categories) && catalog.categories.length > 0) {
      setTreatmentCategories(catalog.categories);
      setCategoryId(catalog.categories[0].id || 'gesicht');
    }
    if (Array.isArray(catalog.treatments) && catalog.treatments.length > 0) {
      const normalizedTreatments = catalog.treatments.map((item) => ({
        ...item,
        imageUrl: absolutizeMediaUrl(normalized, item.imageUrl),
        galleryUrls: Array.isArray(item.galleryUrls)
          ? item.galleryUrls.map((entry) => absolutizeMediaUrl(normalized, entry)).filter(Boolean)
          : [],
      }));
      setTreatments(normalizedTreatments);
      setSelectedTreatment(null);
    }
    if (Array.isArray(catalog.memberships) && catalog.memberships.length > 0) {
      setMemberships(catalog.memberships);
      const fallbackMembership = catalog.memberships[0];
      const keepCurrent = catalog.memberships.some((item) => item.id === activeMembership);
      if (!keepCurrent && fallbackMembership) {
        setActiveMembership(fallbackMembership.id);
      }
    }
    if (Array.isArray(catalog.rewardActions) && catalog.rewardActions.length > 0) {
      setRewardActions(catalog.rewardActions);
    }
    if (Array.isArray(catalog.rewardRedeems) && catalog.rewardRedeems.length > 0) {
      setRewardRedeems(catalog.rewardRedeems);
    }
    if (Array.isArray(catalog.homeArticles) && catalog.homeArticles.length > 0) {
      setHomeArticles(catalog.homeArticles);
    }

    if (clinic && typeof clinic === 'object') {
      setClinicProfile((prev) => ({
        ...prev,
        ...clinic,
      }));
      if (clinic.name) {
        setClinicLookupName(clinic.name);
        setClinicSearchQuery(clinic.name);
      }
    }

    setAnalyticsBaseUrl(normalized);
    setOnboardingBaseUrl(normalized);
    setAnalyticsConnected(true);
    await syncMembershipStatus(normalized, clinic.name || resolvedClinicName || clinicLookupName, nextEmail || settingsEmail);
    track(`Klinikdaten geladen: ${clinic.name || clinicLookupName}`);
  }

  async function connectAnalytics(options = {}) {
    if (connectLoading) return;
    const sourceBaseUrl = showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl;
    const normalized = normalizeUrl(sourceBaseUrl);
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    const nextEmail = String(options.memberEmail ?? settingsEmail).trim().toLowerCase();
    const nextName = String(options.memberName ?? settingsName).trim();
    const completeOnboarding = options.completeOnboarding !== false;
    const silentFailure = options.silentFailure === true;
    if (!normalized) {
      setAnalyticsConnected(false);
      Alert.alert('Service nicht verfügbar', 'Klinik-Verbindung ist aktuell nicht verfügbar.');
      return;
    }
    if (!resolvedClinicName) {
      Alert.alert('Klinikname fehlt', 'Bitte suche und wähle zuerst eine Klinik.');
      return;
    }

    setConnectLoading(true);
    try {
      await loadClinicBundle(normalized, resolvedClinicName, nextEmail);
      await writeSecureValue(STORAGE_KEYS.analyticsBaseUrl, normalized);
      await writeSecureValue(STORAGE_KEYS.clinicName, resolvedClinicName);
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
      setBackendCheckMessage(`Verbindung OK: ${normalized}`);
      track('Klinik verbunden');
    } catch (error) {
      setAnalyticsConnected(false);
      const helpMessage = describeConnectionError(normalized, error);
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
    const normalized = normalizeUrl(sourceBaseUrl) || expoBackendUrl;
    if (!normalized) {
      Alert.alert('Backend URL fehlt', 'Bitte gib zuerst die Backend-URL ein.');
      return;
    }

    setBackendCheckLoading(true);
    try {
      const { value: payload, baseUrl } = await runWithBaseUrlFallback(normalized, (baseUrlCandidate) =>
        fetchBackendHealth(baseUrlCandidate)
      );
      if (payload?.status === 'ok') {
        const message = `Health-Check erfolgreich: ${baseUrl}`;
        setBackendCheckMessage(message);
        Alert.alert('Backend erreichbar', message);
      } else {
        throw new Error('Health-Check Antwort ungültig.');
      }
    } catch (error) {
      const helpMessage = describeConnectionError(normalized, error);
      setBackendCheckMessage(helpMessage);
      Alert.alert('Backend-Test fehlgeschlagen', helpMessage);
    } finally {
      setBackendCheckLoading(false);
    }
  }

  async function runClinicSearch() {
    const normalized = normalizeUrl(showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl) || expoBackendUrl;
    if (!normalized) {
      setBackendCheckMessage('Service aktuell nicht erreichbar. Bitte später erneut versuchen.');
      return;
    }

    setClinicSearchLoading(true);
    try {
      const { value: response, baseUrl } = await runWithBaseUrlFallback(normalized, (baseUrlCandidate) =>
        fetchClinicSearch(baseUrlCandidate, clinicSearchQuery, 12)
      );
      const clinics = Array.isArray(response.clinics) ? response.clinics : [];
      setClinicSearchResults(clinics);
      setBackendCheckMessage(`Klinik-Suche verbunden über: ${baseUrl}`);
      if (clinics.length > 0) {
        const exact = clinics.find(
          (entry) =>
            String(entry?.name || '').trim().toLowerCase() === String(clinicSearchQuery || '').trim().toLowerCase()
        );
        if (exact?.name) {
          setClinicLookupName(String(exact.name).trim());
        }
      }
      if (clinics.length === 0) {
        setBackendCheckMessage('Keine Klinik gefunden. Bitte Suchbegriff anpassen.');
      }
    } catch (error) {
      const helpMessage = describeConnectionError(normalized, error);
      setBackendCheckMessage(helpMessage);
    } finally {
      setClinicSearchLoading(false);
    }
  }

  function selectClinicFromSearch(clinic) {
    const name = String(clinic?.name || '').trim();
    if (!name) return;
    setClinicLookupName(name);
    setClinicSearchQuery(name);
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
    const selectedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    if (!selectedClinicName) {
      Alert.alert('Klinik fehlt', 'Bitte suche zuerst deine Klinik.');
      return;
    }
    resetOtpFlow();
    setOnboardingStep('access');
  }

  async function useQrOrReferralCode() {
    const normalized = normalizeUrl(showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl) || expoBackendUrl;
    if (!normalized) {
      setBackendCheckMessage('Service aktuell nicht erreichbar. Bitte später erneut versuchen.');
      return;
    }

    const rawCode = String(scanCodeValue || '').trim();
    if (!rawCode) {
      setBackendCheckMessage('Bitte gib einen Klinik- oder QR-Code ein.');
      return;
    }

    let parsedClinicName = resolveClinicNameFromQrOrCode(rawCode);
    try {
      const { value: resolved } = await runWithBaseUrlFallback(normalized, (baseUrlCandidate) =>
        resolveClinicByCode(baseUrlCandidate, { code: rawCode })
      );
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
    setScanCodeValue('');

    try {
      const response = await fetchClinicSearch(normalized, parsedClinicName, 8);
      const clinics = Array.isArray(response.clinics) ? response.clinics : [];
      setClinicSearchResults(clinics);
      if (clinics.length > 0) {
        selectClinicFromSearch(clinics[0]);
        resetOtpFlow();
        setOnboardingStep('access');
        return;
      }
    } catch {
      // Falls Suche fehlschlaegt, kann Nutzer trotzdem manuell weiter.
    }
    resetOtpFlow();
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

    const normalized = normalizeUrl(showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl);
    const effectiveBaseUrl = normalized || expoBackendUrl;
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    if (!effectiveBaseUrl) {
      setOtpFeedback('Backend nicht verbunden. Bitte später erneut versuchen.', 'warning');
      return;
    }
    if (!resolvedClinicName) {
      setOtpFeedback('Bitte wähle zuerst eine Klinik aus.', 'warning');
      return;
    }

    const shouldRequestOtp = forceRequest || !otpRequestId || otpRequestedPhone !== normalizedPhone;
    if (shouldRequestOtp) {
      setOtpLoading(true);
      setOtpFeedback('Code wird angefordert ...', 'info');
      try {
        const { value: response, baseUrl } = await runWithBaseUrlFallback(effectiveBaseUrl, (baseUrlCandidate) =>
          requestPhoneOtp(baseUrlCandidate, {
            clinicName: resolvedClinicName,
            phone: normalizedPhone,
          })
        );
        setBackendCheckMessage(`OTP-Service verbunden über: ${baseUrl}`);
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
      const { value: response } = await runWithBaseUrlFallback(effectiveBaseUrl, (baseUrlCandidate) =>
        verifyPhoneOtp(baseUrlCandidate, {
          clinicName: resolvedClinicName,
          phone: normalizedPhone,
          requestId: otpRequestId,
          code: safeOtpCode,
        })
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
      setOtpFeedback('Telefonnummer bestätigt. Verbinde Klinik ...', 'success');
      setOtpCooldownUntil(0);
      setOtpCountdown(0);
      setOtpCode('');

      await connectAnalytics({
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

    const normalized = normalizeUrl(showOnboarding ? onboardingBaseUrl || analyticsBaseUrl : analyticsBaseUrl);
    const effectiveBaseUrl = normalized || expoBackendUrl;
    const resolvedClinicName = String(clinicLookupName || clinicSearchQuery || '').trim();
    const normalizedPhone = normalizePhone(patientPhone);
    if (!effectiveBaseUrl) {
      setOtpFeedback('Backend nicht verbunden. Bitte später erneut versuchen.', 'warning');
      return;
    }
    if (!resolvedClinicName || !normalizedPhone) {
      setOtpFeedback('Klinik oder Telefonnummer fehlt.', 'warning');
      return;
    }

    setOtpResendLoading(true);
    setOtpFeedback('Code wird neu gesendet ...', 'info');
    try {
      const { value: response, baseUrl } = await runWithBaseUrlFallback(effectiveBaseUrl, (baseUrlCandidate) =>
        resendPhoneOtp(baseUrlCandidate, {
          clinicName: resolvedClinicName,
          phone: normalizedPhone,
        })
      );
      setBackendCheckMessage(`OTP-Service verbunden über: ${baseUrl}`);
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
    resetOtpFlow();
    setPatientGuestMode(true);
    setPatientPhone('');
    await writeSecureValue(STORAGE_KEYS.patientPhone, '');
    await writeSecureValue(STORAGE_KEYS.patientGuestMode, '1');
    await connectAnalytics({
      memberEmail: '',
      completeOnboarding: true,
      silentFailure: true,
    });
  }

  async function disconnectClinicSession() {
    setShowOnboarding(true);
    setOnboardingStep('clinic');
    setClinicSearchResults([]);
    setSelectedTreatment(null);
    setCartItems([]);
    setMembershipStatus(null);
    setAnalyticsConnected(false);
    setPatientPhone('');
    setPatientGuestMode(false);
    resetOtpFlow();
    await writeSecureValue(STORAGE_KEYS.clinicName, '');
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
        Alert.alert('Backend fehlt', 'Bitte zuerst Klinik verbinden oder als Offline-Demo fortfahren.');
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
        Alert.alert('Backend fehlt', 'Bitte zuerst Klinik verbinden oder als Offline-Demo fortfahren.');
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
      Alert.alert('Daten fehlen', 'Backend, Klinikname oder E-Mail fehlt.');
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
      const initialBaseUrl = storedBaseUrl || defaultBaseUrl || expoDetectedBaseUrl;
      const initialClinicName = storedClinicName || defaultClinicName;
      if (initialBaseUrl) {
        setAnalyticsBaseUrl(initialBaseUrl);
        setOnboardingBaseUrl(initialBaseUrl);
      }
      if (initialClinicName) {
        setClinicLookupName(initialClinicName);
        setClinicSearchQuery(initialClinicName);
      }

      if (initialBaseUrl && initialClinicName) {
        try {
          await loadClinicBundle(initialBaseUrl, initialClinicName);
          if (!isActive) return;
          if (storedOnboardingDone !== '1') {
            setShowOnboarding(true);
            setOnboardingStep('clinic');
          }
          setIsBootstrapping(false);
          return;
        } catch (error) {
          if (isActive) {
            setBackendCheckMessage(describeConnectionError(initialBaseUrl, error));
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
          <Text style={styles.bootTitle}>Appointmentix wird geladen ...</Text>
          <Text style={styles.bootBody}>Die App wird gestartet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingEyebrow}>APPOINTMENTIX</Text>
            <Text style={styles.onboardingTitle}>
              {onboardingStep === 'clinic' ? 'Finde deine Klinik' : 'Telefonnummer bestätigen'}
            </Text>
            <Text style={styles.onboardingBody}>
              {onboardingStep === 'clinic'
                ? 'Suche deine MedSpa-Klinik nach Name oder nutze einen QR-/Referral-Code.'
                : 'Melde dich mit Telefonnummer an oder fahre als Gast fort.'}
            </Text>

            {SHOW_TECHNICAL_SETUP && (
              <Pressable
                style={[styles.secondaryCta, styles.techToggleCta]}
                onPress={() => setShowTechnicalSetup((prev) => !prev)}
              >
                <Text style={styles.secondaryCtaText}>
                  {showTechnicalSetup ? 'Technik ausblenden' : 'Technik / Backend (optional)'}
                </Text>
              </Pressable>
            )}

            {SHOW_TECHNICAL_SETUP && showTechnicalSetup && (
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
                <Text style={styles.sectionSubTitle}>Klinik suchen</Text>
                <TextInput
                  style={styles.input}
                  value={clinicSearchQuery}
                  onChangeText={setClinicSearchQuery}
                  placeholder="MedSpa Name eingeben"
                  placeholderTextColor={THEME.muted}
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    void runClinicSearch();
                  }}
                />
                <Pressable
                  style={[styles.secondaryCta, clinicSearchLoading && styles.ctaDisabled]}
                  disabled={clinicSearchLoading}
                  onPress={() => {
                    void runClinicSearch();
                  }}
                >
                  <Text style={styles.secondaryCtaText}>
                    {clinicSearchLoading ? 'Suche läuft ...' : 'Klinik suchen'}
                  </Text>
                </Pressable>

                {clinicSearchResults.length > 0 && (
                  <View style={styles.searchResultsCard}>
                    {clinicSearchResults.map((clinic, index) => {
                      const clinicName = String(clinic?.name || '').trim();
                      const isSelected = clinicName && clinicName === String(clinicLookupName || '').trim();
                      const isLast = index === clinicSearchResults.length - 1;
                      return (
                        <Pressable
                          key={clinicName || `clinic-${index}`}
                          style={[styles.searchResultRow, isLast && styles.searchResultRowLast]}
                          onPress={() => selectClinicFromSearch(clinic)}
                        >
                          <View style={styles.searchResultMain}>
                            <Text style={styles.searchResultName}>{clinicName || 'Klinik'}</Text>
                            <Text style={styles.searchResultMeta}>
                              {[clinic?.city, clinic?.website].filter(Boolean).join(' • ') || 'Klinikprofil'}
                            </Text>
                          </View>
                          <Text style={styles.searchSelectLabel}>{isSelected ? 'Ausgewählt' : 'Wählen'}</Text>
                        </Pressable>
                      );
                    })}
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
                  Ausgewählte Klinik: {clinicLookupName || 'Noch nicht ausgewählt'}
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
                  <Text style={styles.secondaryCtaText}>Zurück zur Kliniksuche</Text>
                </Pressable>
              </View>
            )}

            {!!backendCheckMessage && <Text style={styles.diagnosticText}>{backendCheckMessage}</Text>}

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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
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
                <Text style={styles.financeTitle}>Heute behandeln. Später zahlen. Punkte sammeln.</Text>
                <Text style={styles.financeBody}>Flexible Monatsraten und Rewards für wiederkehrende Besuche.</Text>
              </View>

              <Text style={styles.sectionTitle}>Wissen & Tipps</Text>
              {homeArticles.map((article) => (
                <View key={article.id} style={styles.articleCard}>
                  <Text style={styles.articleTag}>{article.tag}</Text>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleBody}>{article.body}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Klinik</Text>
              <View style={styles.clinicCard}>
                <View style={styles.mapMock}>
                  <Text style={styles.mapMockLabel}>Map</Text>
                  <View style={styles.mapMockPinWrap}>
                    <Ionicons name="location" size={14} color="#FF8BBE" />
                    <Text style={styles.mapMockPinText}>{clinicProfile.city || 'Wien'}</Text>
                  </View>
                </View>
                <Text style={styles.clinicName}>{clinicProfile.name}</Text>
                <View style={styles.clinicMetaRow}>
                  <Ionicons name="location-outline" size={14} color="#8E95A1" />
                  <Text style={styles.clinicMeta}>{clinicProfile.address || clinicProfile.city || 'Standortdaten folgen'}</Text>
                </View>
                <View style={styles.clinicMetaRow}>
                  <Ionicons name="time-outline" size={14} color="#8E95A1" />
                  <Text style={styles.clinicMeta}>{clinicProfile.openingHours || 'Mo - Sa, 09:00 - 17:00'}</Text>
                </View>
                <Pressable
                  style={styles.callNowCta}
                  onPress={() => {
                    track(`Call now: ${clinicProfile.phone || '+43...'}`, 'clinic_call_click', {
                      metadata: { clinicName: clinicProfile.name || '' },
                    });
                  }}
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
                        <View
                          style={[
                            styles.categoryTileIconWrap,
                            categoryId === cat.id && styles.categoryTileIconWrapActive,
                          ]}
                        >
                          <Ionicons
                            name={categoryIconName(cat.id)}
                            size={20}
                            color={categoryId === cat.id ? '#EB6BA4' : '#7E8695'}
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
                      <Text style={styles.emptyBody}>Passe später den Klinik-Katalog im Backend an.</Text>
                    </View>
                  )}
                </View>
              )}

              {shopTab === 'browse' && selectedTreatment && (
                <View style={styles.detailCard}>
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
                        <View style={styles.shopMembershipHero}>
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
                <Text style={styles.scanTitle}>Check-in QR</Text>
                <Text style={styles.scanBody}>
                  Scanne beim Empfang deinen App-Code. So werden Besuche sauber erfasst und Rewards automatisch gutgeschrieben.
                </Text>
                <View style={styles.scanQrMock}>
                  <Text style={styles.scanQrText}>{clinicProfile.shortName || 'APP'}-{String(points).slice(0, 4)}</Text>
                </View>
                <Pressable style={styles.primaryCta} onPress={checkInViaScan}>
                  <Text style={styles.primaryCtaText}>Scan bestätigen (Demo)</Text>
                </Pressable>
              </View>

              <View style={styles.inlineInfoBox}>
                <Text style={styles.inlineInfoTitle}>So funktioniert es live</Text>
                <Text style={styles.inlineInfoText}>• Empfang scannt den QR aus der App</Text>
                <Text style={styles.inlineInfoText}>• Besuch wird in der Klinik-Historie verbucht</Text>
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
                <View style={styles.rewardsBalanceGlow} />
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
                      <View style={styles.rewardsActionLeft}>
                        <View style={styles.rewardsActionIconWrap}>
                          <Ionicons name={rewardActionIcon(action.id)} size={17} color="#D45C94" />
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

                  <Text style={styles.sectionSubTitle}>Klinik-App Verbindung</Text>
                  <Text style={styles.analyticsStatus}>Klinik: {clinicProfile.name || 'Nicht gesetzt'}</Text>
                  <Pressable
                    style={styles.secondaryCta}
                    onPress={async () => {
                      try {
                        await loadClinicBundle();
                      } catch (error) {
                        Alert.alert('Klinikdaten konnten nicht geladen werden', String(error?.message || error));
                      }
                    }}
                  >
                    <Text style={styles.secondaryCtaText}>Klinikdaten neu laden</Text>
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
                      ? 'Klinikdaten sind verbunden.'
                      : 'Klinikdaten sind aktuell nicht verbunden.'}
                  </Text>
                  <Text style={styles.analyticsStatus}>
                    Klinik-Metriken und Kampagnen werden ausschließlich im Web-Dashboard verwaltet.
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
                    <Text style={styles.secondaryCtaText}>Von Klinik abmelden</Text>
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
              <View style={styles.searchOverlayHeader}>
                <Text style={styles.searchOverlayTitle}>Suchen</Text>
                <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderSearch}>
                  <Ionicons name="close" size={20} color="#5E6676" />
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
                        <Ionicons name={searchResultIcon(item.type)} size={16} color={THEME.brand} />
                      </View>
                      <View style={styles.searchOverlayMain}>
                        <Text style={styles.searchOverlayRowTitle}>{item.title}</Text>
                        <Text style={styles.searchOverlayRowMeta}>{item.subtitle}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#8C93A2" />
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
              <View style={styles.searchOverlayHeader}>
                <Text style={styles.searchOverlayTitle}>Warenkorb</Text>
                <Pressable style={styles.overlayCloseBtn} onPress={closeHeaderCart}>
                  <Ionicons name="close" size={20} color="#5E6676" />
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
                            <Ionicons name="trash-outline" size={14} color="#8A4C21" />
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
    backgroundColor: THEME.background,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  bootWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bootTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: THEME.ink,
  },
  bootBody: {
    marginTop: 6,
    color: THEME.muted,
    textAlign: 'center',
  },
  onboardingCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  onboardingEyebrow: {
    color: THEME.muted,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  onboardingTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
  },
  onboardingBody: {
    color: THEME.muted,
    lineHeight: 20,
    marginBottom: 10,
  },
  mainAnimatedPanel: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 128,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#F8D9EA',
    borderWidth: 1,
    borderColor: '#F3C6DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#B54982',
    fontWeight: '800',
    fontSize: 13,
  },
  headerClinic: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: THEME.muted,
    marginTop: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 36,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButtonWrap: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECF2',
    borderWidth: 1,
    width: 43,
    height: 43,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: THEME.brand,
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
    backgroundColor: 'rgba(31,36,48,0.30)',
  },
  searchOverlayCard: {
    marginTop: 72,
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECF2',
    borderRadius: 16,
    padding: 12,
    maxHeight: 430,
  },
  cartOverlayCard: {
    marginTop: 72,
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECF2',
    borderRadius: 16,
    padding: 12,
    maxHeight: 500,
  },
  searchOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  searchOverlayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
  },
  overlayCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchOverlayInput: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: THEME.ink,
    marginBottom: 6,
  },
  searchOverlayHint: {
    color: THEME.muted,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 20,
  },
  searchOverlayResults: {
    maxHeight: 280,
  },
  searchOverlayResultsContent: {
    paddingTop: 4,
    paddingBottom: 6,
    gap: 6,
  },
  searchOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  searchOverlayIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.brandSoft,
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
  },
  searchOverlayRowMeta: {
    color: THEME.muted,
    fontSize: 12,
  },
  cartOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  cartOverlayMain: {
    flex: 1,
    marginRight: 10,
  },
  cartOverlayName: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 1,
  },
  cartOverlayMeta: {
    color: THEME.muted,
    fontSize: 12,
  },
  cartOverlayPrice: {
    color: THEME.ink,
    fontWeight: '700',
  },
  cartOverlayControlsRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cartOverlayStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
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
    paddingHorizontal: 8,
    minHeight: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D8C7',
    backgroundColor: '#FFF6EE',
  },
  cartOverlayRemoveText: {
    color: '#8A4C21',
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
    marginBottom: 6,
  },
  checkoutMethodRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  checkoutMethodChip: {
    minHeight: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutMethodChipActive: {
    borderColor: '#E8C9A7',
    backgroundColor: '#FFF3E3',
  },
  checkoutMethodChipText: {
    color: THEME.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  checkoutMethodChipTextActive: {
    color: THEME.brand,
  },
  cartOverlayFooter: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 10,
  },
  cartOverlayTotalLabel: {
    color: THEME.muted,
    fontWeight: '700',
  },
  cartOverlayTotalValue: {
    color: THEME.ink,
    fontWeight: '800',
    fontSize: 18,
  },
  heroCard: {
    backgroundColor: '#FFF2F8',
    borderWidth: 1,
    borderColor: '#F6CEE3',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 1,
    color: THEME.muted,
    marginBottom: 5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
  },
  heroBody: {
    color: THEME.muted,
    lineHeight: 21,
    marginBottom: 12,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.brand,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroCtaText: {
    color: '#fff',
    fontWeight: '700',
  },
  financeBanner: {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  financeTitle: {
    color: THEME.ink,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  financeBody: {
    color: THEME.muted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionSubTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 10,
    marginBottom: 8,
  },
  articleCard: {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
  },
  articleTag: {
    color: THEME.brand,
    fontWeight: '700',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  articleBody: {
    color: THEME.muted,
    lineHeight: 20,
  },
  clinicCard: {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },
  mapMock: {
    height: 152,
    borderRadius: 12,
    backgroundColor: '#1A3954',
    marginBottom: 10,
    justifyContent: 'flex-end',
    padding: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D4D6A',
  },
  mapMockLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '700',
    fontSize: 12,
    position: 'absolute',
    left: 10,
    top: 10,
  },
  mapMockPinWrap: {
    alignSelf: 'center',
    backgroundColor: 'rgba(21, 25, 35, 0.68)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapMockPinText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  clinicMeta: {
    color: THEME.muted,
    marginBottom: 2,
    flex: 1,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  callNowCta: {
    marginTop: 10,
    backgroundColor: THEME.brand,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  callNowCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  segmentRow: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#EEDCCA',
  },
  segmentText: {
    color: THEME.muted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: THEME.ink,
    fontWeight: '700',
  },
  shopTabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF2',
    marginBottom: 14,
  },
  shopTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 0,
  },
  shopTabText: {
    color: '#7D8595',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 9,
  },
  shopTabTextActive: {
    color: THEME.ink,
    fontWeight: '700',
  },
  shopTabUnderline: {
    height: 3,
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  shopTabUnderlineActive: {
    backgroundColor: '#EB6BA4',
  },
  shopPinkHeroCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#EE76AC',
    borderWidth: 1,
    borderColor: '#F4A4C8',
    marginBottom: 16,
  },
  shopPinkHeroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  shopPinkHeroBody: {
    color: '#FFEAF4',
    textAlign: 'center',
    marginBottom: 12,
  },
  shopPinkHeroCta: {
    alignSelf: 'center',
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#F5CFE1',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  shopPinkHeroCtaText: {
    color: '#D45C94',
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 14,
  },
  categoryTile: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
  },
  categoryTileActive: {
    borderColor: '#EB6BA4',
    backgroundColor: '#FFF8FC',
  },
  categoryTileIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E7DC',
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileIconWrapActive: {
    borderColor: '#F6C0DC',
    backgroundColor: '#FFF5FA',
  },
  categoryTileText: {
    color: '#635547',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
  },
  categoryTileTextActive: {
    color: THEME.ink,
    fontWeight: '700',
  },
  shopListTitle: {
    color: THEME.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 2,
  },
  shopListSubtitle: {
    color: THEME.muted,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  treatmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  treatmentCard: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  treatmentImageMock: {
    height: 116,
    backgroundColor: '#D8C5AE',
  },
  treatmentImageReal: {
    height: 116,
    width: '100%',
    backgroundColor: '#D8C5AE',
  },
  treatmentCardBody: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
  },
  treatmentName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  treatmentDescription: {
    color: THEME.muted,
    lineHeight: 17,
    minHeight: 40,
    fontSize: 12,
    marginBottom: 6,
  },
  treatmentPrice: {
    color: THEME.brand,
    fontWeight: '700',
    fontSize: 15,
  },
  detailCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 13,
  },
  detailImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#D8C5AE',
  },
  detailImageMock: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#D8C5AE',
  },
  detailGalleryRow: {
    gap: 8,
    paddingBottom: 8,
    marginBottom: 4,
  },
  detailThumbImage: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#D8C5AE',
  },
  backLink: {
    color: THEME.brand,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.ink,
    lineHeight: 38,
    marginBottom: 8,
  },
  detailBody: {
    color: THEME.muted,
    lineHeight: 21,
    marginBottom: 8,
  },
  detailMeta: {
    color: THEME.ink,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailQuoteCard: {
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1D8E4',
    backgroundColor: '#FFF4FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailQuoteText: {
    color: '#5F4A57',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  unitsBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEDCCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitsBtnText: {
    fontSize: 24,
    color: THEME.ink,
    marginTop: -2,
  },
  unitsValueWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  unitsValue: {
    color: THEME.ink,
    fontWeight: '600',
  },
  detailPlanSummaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  detailPlanSummaryMain: {
    color: THEME.ink,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  detailPlanSummaryDivider: {
    color: '#C7B7A4',
    fontSize: 18,
    fontWeight: '700',
  },
  detailPlanSummaryMember: {
    color: '#D45C94',
    fontWeight: '700',
  },
  priceLine: {
    color: THEME.muted,
    marginBottom: 4,
  },
  priceHint: {
    color: THEME.brand,
    fontSize: 13,
    marginBottom: 6,
  },
  primaryCta: {
    marginTop: 8,
    backgroundColor: THEME.brand,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryCta: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E3D5C8',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#FFF6EF',
  },
  secondaryCtaActive: {
    backgroundColor: THEME.brand,
    borderColor: THEME.brand,
  },
  secondaryCtaText: {
    color: THEME.brand,
    fontWeight: '700',
  },
  secondaryCtaTextActive: {
    color: '#fff',
  },
  membershipCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  membershipCardActive: {
    backgroundColor: '#F4E3CF',
    borderColor: '#D3B693',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  membershipName: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 3,
  },
  membershipPrice: {
    color: THEME.brand,
    fontWeight: '700',
    marginBottom: 6,
  },
  membershipPerk: {
    color: THEME.muted,
    marginBottom: 2,
    lineHeight: 20,
  },
  shopMembershipBlock: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },
  shopMembershipBlockActive: {
    borderColor: '#EB6BA4',
    shadowColor: '#EB6BA4',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  shopMembershipHero: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#EE76AC',
    borderWidth: 1,
    borderColor: '#F4A4C8',
    marginBottom: 12,
  },
  shopMembershipHeroEyebrow: {
    color: '#FFE9F3',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  shopMembershipHeroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 5,
  },
  shopMembershipHeroBody: {
    color: '#FFE7F2',
    lineHeight: 19,
    marginBottom: 10,
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
    fontSize: 17,
  },
  shopMembershipHeroBadge: {
    color: '#D45C94',
    backgroundColor: '#FFF7FB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
    overflow: 'hidden',
  },
  shopMembershipBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 10,
  },
  shopMembershipBenefitCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  shopMembershipBenefitCardAlt: {
    opacity: 0.92,
  },
  shopMembershipBenefitText: {
    color: '#4D3F31',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1D5E2',
    backgroundColor: '#FFEFF7',
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 17,
  },
  shopMembershipIncludedTitle: {
    color: THEME.ink,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  shopMembershipIncludedEmpty: {
    color: THEME.muted,
    marginBottom: 10,
  },
  shopMembershipIncludedCard: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
    marginBottom: 9,
  },
  shopMembershipIncludedImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#D8C5AE',
  },
  shopMembershipIncludedImageMock: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#D8C5AE',
  },
  shopMembershipIncludedBody: {
    flex: 1,
    justifyContent: 'center',
  },
  shopMembershipIncludedName: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  shopMembershipIncludedMeta: {
    color: THEME.muted,
    marginBottom: 4,
  },
  shopMembershipIncludedLink: {
    color: '#D45C94',
    fontWeight: '700',
    fontSize: 12,
  },
  shopMembershipResultsWrap: {
    marginTop: 4,
    marginBottom: 10,
  },
  shopMembershipResultsTitle: {
    color: THEME.ink,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  shopMembershipResultsRow: {
    gap: 10,
    paddingRight: 4,
  },
  shopMembershipResultImage: {
    width: 124,
    height: 124,
    borderRadius: 12,
    backgroundColor: '#D8C5AE',
  },
  treatmentListCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  treatmentListTitle: {
    color: THEME.ink,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  treatmentListBody: {
    color: THEME.muted,
    lineHeight: 19,
    marginBottom: 4,
  },
  treatmentListMeta: {
    color: THEME.brand,
    fontWeight: '700',
  },
  cartBox: {
    marginTop: 14,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 13,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 6,
  },
  cartItem: {
    color: THEME.muted,
    marginBottom: 2,
  },
  cartTotal: {
    color: THEME.ink,
    fontWeight: '800',
    marginTop: 6,
  },
  rewardsBalanceCard: {
    position: 'relative',
    borderRadius: 16,
    padding: 15,
    backgroundColor: THEME.rewardsB,
    borderWidth: 1,
    borderColor: '#4D8F8B',
    marginBottom: 14,
    overflow: 'hidden',
  },
  rewardsBalanceGlow: {
    position: 'absolute',
    right: -42,
    top: -42,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  rewardsBalanceLogo: {
    color: '#ECFFFB',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 2,
  },
  rewardsBalanceLabel: {
    color: '#D4EEEB',
    marginBottom: 18,
  },
  rewardsCardStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rewardsCardStatItem: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  rewardsCardStatValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 2,
  },
  rewardsCardStatLabel: {
    color: '#D9F0EC',
    fontSize: 11,
    fontWeight: '600',
  },
  rewardsBalanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rewardsBalanceMember: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rewardsBalanceJoined: {
    color: '#CCE5E2',
    marginTop: 2,
    fontSize: 12,
  },
  rewardsBalanceRight: {
    alignItems: 'flex-end',
  },
  rewardsBalanceWallet: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: '700',
  },
  rewardsBalanceCash: {
    color: '#E5FAF7',
    marginTop: 4,
    fontSize: 12,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  rewardsHeaderTitle: {
    color: THEME.ink,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
  },
  rewardsHeaderLink: {
    color: '#D45C94',
    fontWeight: '700',
  },
  rewardsSegmentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
    marginBottom: 10,
  },
  rewardsSegmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  rewardsSegmentBtnActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#EB6BA4',
  },
  rewardsSegmentText: {
    color: '#7A6B5B',
    fontWeight: '500',
  },
  rewardsSegmentTextActive: {
    color: THEME.ink,
    fontWeight: '700',
  },
  rewardsSectionTitle: {
    color: THEME.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  rewardsActionRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rewardsActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    paddingRight: 8,
  },
  rewardsActionIconWrap: {
    width: 33,
    height: 33,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F3D2E1',
    backgroundColor: '#FFF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsActionLabel: {
    color: THEME.ink,
    fontWeight: '600',
    flex: 1,
  },
  rewardsActionBtn: {
    backgroundColor: '#EB6BA4',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardsActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  rewardsRedeemRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rewardsRedeemLabel: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardsRedeemHint: {
    color: THEME.muted,
  },
  rewardsRedeemBtn: {
    backgroundColor: THEME.brand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rewardsRedeemBtnDisabled: {
    opacity: 0.38,
  },
  rewardsRedeemBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  rewardsPastList: {
    marginTop: 4,
  },
  rewardsPastEmpty: {
    color: THEME.muted,
    lineHeight: 21,
  },
  rewardsPastItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  rewardsPastTitle: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardsPastMeta: {
    color: THEME.muted,
    marginBottom: 1,
  },
  scanCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  scanTitle: {
    color: THEME.ink,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  scanBody: {
    color: THEME.muted,
    lineHeight: 20,
  },
  scanQrMock: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7C0A3',
    borderStyle: 'dashed',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF2E7',
  },
  scanQrText: {
    color: THEME.brand,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
  },
  emptyTitle: {
    color: THEME.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyBody: {
    color: THEME.muted,
  },
  historyItem: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    padding: 11,
    marginBottom: 10,
  },
  historyTitle: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyMeta: {
    color: THEME.muted,
    marginBottom: 1,
  },
  profileEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  profileGhostList: {
    marginBottom: 16,
    gap: 10,
  },
  profileGhostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileGhostAvatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ECE4DA',
    backgroundColor: '#F8F6F1',
  },
  profileGhostLineWrap: {
    flex: 1,
    gap: 6,
  },
  profileGhostLine: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#ECE4DA',
    width: '72%',
  },
  profileGhostLineWide: {
    width: '88%',
  },
  profileEmptyTitle: {
    color: THEME.muted,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  profileEmptyCta: {
    alignSelf: 'center',
    minWidth: 160,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: THEME.brand,
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
    marginBottom: 12,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: THEME.ink,
    marginBottom: 8,
  },
  otpCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0C8AB',
    borderRadius: 12,
    backgroundColor: '#FBF2E7',
    padding: 10,
  },
  otpTitle: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 6,
  },
  otpHint: {
    color: THEME.muted,
    marginTop: -2,
    marginBottom: 6,
    fontSize: 12,
  },
  otpUiMessage: {
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 19,
    fontWeight: '600',
    color: THEME.muted,
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
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 18,
  },
  diagnosticText: {
    color: THEME.brand,
    marginTop: 8,
    marginBottom: 2,
    lineHeight: 19,
    fontWeight: '600',
  },
  searchResultsCard: {
    backgroundColor: '#FDF5E9',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    marginBottom: 6,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFDFCB',
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
    fontWeight: '700',
    marginBottom: 2,
  },
  searchResultMeta: {
    color: THEME.muted,
    fontSize: 12,
  },
  searchSelectLabel: {
    color: THEME.brand,
    fontWeight: '700',
    fontSize: 12,
  },
  inlineInfoBox: {
    marginTop: 8,
    backgroundColor: '#F9EEDC',
    borderColor: '#E7CFB2',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  inlineInfoTitle: {
    color: THEME.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  techToggleCta: {
    marginTop: 8,
  },
  inlineInfoText: {
    color: THEME.muted,
    marginBottom: 2,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  lastActionBox: {
    marginTop: 8,
    backgroundColor: '#EFE2D0',
    borderWidth: 1,
    borderColor: '#E1C8AA',
    borderRadius: 10,
    padding: 10,
  },
  lastActionText: {
    color: '#6B4E2F',
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#657287',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  bottomTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    gap: 3,
  },
  bottomTabBtnActive: {
    backgroundColor: '#FFF4FA',
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
  },
  bottomTabLabelActive: {
    color: THEME.brand,
    fontWeight: '800',
  },
});
