const API_BASE = "/api";

const state = {
  user: null,
  isOwner: false,
  activeTab: "login",
  toastTimer: null,
  metricsDays: "30",
  metricsCompareMode: "none",
  metricsFromDate: "",
  metricsToDate: "",
  campaigns: [],
  auditLogs: [],
  members: [],
  analytics: {
    summary: {},
    timeseries: [],
    topTreatments: [],
    comparison: {},
    revenueSources: [],
    topTeam: [],
    exportData: {},
    window: {},
    period: {},
  },
  patientMemberships: [],
  membershipSummary: {},
  transactions: [],
  transactionSummary: {},
  transactionFilter: "all",
  transactionSearch: "",
  appointments: [],
  appointmentSummary: {},
  appointmentFilter: "upcoming",
  calendarView: "month",
  calendarDate: null,
  editingApptId: null,
  customerNotesEmail: "",
  settingsSnapshot: null,
  themeDraft: null,
  themeSavedDraft: null,
  themePublished: null,
  themeDefault: null,
  themeDirty: false,
  themeHasDraftChanges: false,
  themeLoading: false,
  memberPhotoObjectUrl: "",
  memberDrawerMode: "create",
  editingMemberId: null,
  pendingMemberAction: null,
  catalog: {
    categories: [],
    treatments: [],
    memberships: [],
    rewardActions: [],
    rewardRedeems: [],
    homeArticles: [],
  },
};

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const sessionLabel = document.getElementById("sessionLabel");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");
const railUserName = document.getElementById("railUserName");
const railClinicName = document.getElementById("railClinicName");
const railAvatar = document.getElementById("railAvatar");
const subscriptionChip = document.getElementById("subscriptionChip");
const refreshDashboardBtn = document.getElementById("refreshDashboardBtn");
const onboardRingValue = document.getElementById("onboardRingValue");
const patientStats = document.getElementById("patientStats");
const patientsBody = document.getElementById("patientsBody");
const patientSearch = document.getElementById("patientSearch");
const txnStats = document.getElementById("txnStats");
const txnBody = document.getElementById("txnBody");
const txnSearch = document.getElementById("txnSearch");
const txnFilters = document.getElementById("txnFilters");
const txnExportBtn = document.getElementById("txnExportBtn");
const txnDrawer = document.getElementById("txnDrawer");
const txnDrawerTitle = document.getElementById("txnDrawerTitle");
const txnDrawerKind = document.getElementById("txnDrawerKind");
const txnDrawerBody = document.getElementById("txnDrawerBody");
const appointmentStats = document.getElementById("appointmentStats");
const appointmentsBody = document.getElementById("appointmentsBody");
const appointmentSearch = document.getElementById("appointmentSearch");
const appointmentFilter = document.getElementById("appointmentFilter");
const calTitle = document.getElementById("calTitle");
const calBody = document.getElementById("calBody");
const calViewSwitch = document.getElementById("calViewSwitch");
const apptDrawer = document.getElementById("apptDrawer");
const apptForm = document.getElementById("apptForm");
const apptFormError = document.getElementById("apptFormError");
const apptDrawerTitle = document.getElementById("apptDrawerTitle");
const apptDrawerMode = document.getElementById("apptDrawerMode");
const apptCancelAppt = document.getElementById("apptCancelAppt");
const apptTreatmentList = document.getElementById("apptTreatmentList");
const viewEyebrow = document.getElementById("viewEyebrow");
const onboardingCard = document.getElementById("onboardingCard");
const onboardSteps = document.getElementById("onboardSteps");
const onboardProgressLabel = document.getElementById("onboardProgressLabel");
const kpiRevenue = document.getElementById("kpiRevenue");
const kpiMrr = document.getElementById("kpiMrr");
const kpiMembers = document.getElementById("kpiMembers");
const kpiAppUsers = document.getElementById("kpiAppUsers");
const kpiRevenueDelta = document.getElementById("kpiRevenueDelta");
const kpiMrrDelta = document.getElementById("kpiMrrDelta");
const kpiAppUsersDelta = document.getElementById("kpiAppUsersDelta");
const analyseStats = document.getElementById("analyseStats");
const railNavItems = Array.from(document.querySelectorAll(".rail-nav-item[data-view]"));
const viewPanels = Array.from(document.querySelectorAll(".view-panel[data-view-panel]"));
const VIEW_META = {
  overview: { eyebrow: "Performance Center" },
  patienten: { eyebrow: "Patienten" },
  termine: { eyebrow: "Termine" },
  checkin: { eyebrow: "Check-in" },
  analyse: { eyebrow: "Analyse" },
  zahlungen: { eyebrow: "Zahlungen" },
  katalog: { eyebrow: "Katalog & App" },
  branding: { eyebrow: "App-Design" },
  kampagnen: { eyebrow: "Kampagnen" },
  team: { eyebrow: "Team" },
  einstellungen: { eyebrow: "Einstellungen" },
  abo: { eyebrow: "Abo & Rechnungen" },
};

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

const settingsForm = document.getElementById("settingsForm");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const chartColorPicker = document.getElementById("chartColorPicker");
const chartColorControl = document.getElementById("chartColorControl");
const chartColorText = document.getElementById("chartColorText");
const appearanceForm = document.getElementById("appearanceForm");
const appearanceStatus = document.getElementById("appearanceStatus");
const appearanceWarnings = document.getElementById("appearanceWarnings");
const appearancePreview = document.getElementById("appearancePreview");
const appearanceDirtyBadge = document.getElementById("appearanceDirtyBadge");
const previewClinicName = document.getElementById("previewClinicName");
const saveThemeDraftBtn = document.getElementById("saveThemeDraftBtn");
const publishThemeBtn = document.getElementById("publishThemeBtn");
const resetAppearanceBtn = document.getElementById("resetAppearanceBtn");
const resetDefaultAppearanceBtn = document.getElementById("resetDefaultAppearanceBtn");
const membersBody = document.getElementById("membersBody");
const memberForm = document.getElementById("memberForm");
const addMemberBtn = document.getElementById("addMemberBtn");
const memberDrawer = document.getElementById("memberDrawer");
const memberDrawerTitle = document.getElementById("memberDrawerTitle");
const memberDrawerIntro = document.getElementById("memberDrawerIntro");
const memberFormError = document.getElementById("memberFormError");
const memberSaveBtn = document.getElementById("memberSaveBtn");
const memberEmailLabel = document.getElementById("memberEmailLabel");
const memberPasswordLabel = document.getElementById("memberPasswordLabel");
const memberPhotoInput = document.getElementById("memberPhotoInput");
const memberPhotoBtn = document.getElementById("memberPhotoBtn");
const memberPhotoClearBtn = document.getElementById("memberPhotoClearBtn");
const memberPhotoPreview = document.getElementById("memberPhotoPreview");
const memberPhotoName = document.getElementById("memberPhotoName");
const memberConfirm = document.getElementById("memberConfirm");
const memberConfirmTitle = document.getElementById("memberConfirmTitle");
const memberConfirmText = document.getElementById("memberConfirmText");
const memberConfirmAction = document.getElementById("memberConfirmAction");
const billingStatus = document.getElementById("billingStatus");
const historyBody = document.getElementById("historyBody");
const startCheckoutBtn = document.getElementById("startCheckoutBtn");
const metricsDaysSelect = document.getElementById("metricsDaysSelect");
const metricsCompareSelect = document.getElementById("metricsCompareSelect");
const refreshMetricsBtn = document.getElementById("refreshMetricsBtn");
const metricsChipRow = document.getElementById("metricsChipRow");
const metricsFromDateInput = document.getElementById("metricsFromDate");
const metricsToDateInput = document.getElementById("metricsToDate");
const metricsApplyRangeBtn = document.getElementById("metricsApplyRangeBtn");
const metricsDateRangeLabel = document.getElementById("metricsDateRangeLabel");
const dashboardGreeting = document.getElementById("dashboardGreeting");
const metricDailyProcessingValue = document.getElementById("metricDailyProcessingValue");
const metricDailyProcessingDelta = document.getElementById("metricDailyProcessingDelta");
const metricNetRevenueValue = document.getElementById("metricNetRevenueValue");
const metricNetRevenueDelta = document.getElementById("metricNetRevenueDelta");
const metricMRRValue = document.getElementById("metricMRRValue");
const metricMRRDelta = document.getElementById("metricMRRDelta");
const metricAppUserLTVValue = document.getElementById("metricAppUserLTVValue");
const metricAppUserLTVDelta = document.getElementById("metricAppUserLTVDelta");
const metricClientLTVValue = document.getElementById("metricClientLTVValue");
const metricClientLTVDelta = document.getElementById("metricClientLTVDelta");
const metricAppUsersValue = document.getElementById("metricAppUsersValue");
const metricAppUsersDelta = document.getElementById("metricAppUsersDelta");
const metricReferralsValue = document.getElementById("metricReferralsValue");
const metricReferralsDelta = document.getElementById("metricReferralsDelta");
const metricVisitsValue = document.getElementById("metricVisitsValue");
const metricVisitsDelta = document.getElementById("metricVisitsDelta");
const metricReviewsValue = document.getElementById("metricReviewsValue");
const liveActivityBody = document.getElementById("liveActivityBody");
const revenueSourcesBar = document.getElementById("revenueSourcesBar");
const revenueSourcesBody = document.getElementById("revenueSourcesBody");
const topClientsBody = document.getElementById("topClientsBody");
const topTeamBody = document.getElementById("topTeamBody");
const chartDailyProcessing = document.getElementById("chartDailyProcessing");
const chartNetRevenue = document.getElementById("chartNetRevenue");
const chartMRR = document.getElementById("chartMRR");
const chartAppUserLTV = document.getElementById("chartAppUserLTV");
const chartClientLTV = document.getElementById("chartClientLTV");
const chartAppUsers = document.getElementById("chartAppUsers");
const chartReferrals = document.getElementById("chartReferrals");
const chartVisits = document.getElementById("chartVisits");
const chartReviews = document.getElementById("chartReviews");
const chartHoverState = new WeakMap();
const saveCatalogBtn = document.getElementById("saveCatalogBtn");
const categoriesBody = document.getElementById("categoriesBody");
const treatmentsBody = document.getElementById("treatmentsBody");
const membershipsBody = document.getElementById("membershipsBody");
const rewardActionsBody = document.getElementById("rewardActionsBody");
const rewardRedeemsBody = document.getElementById("rewardRedeemsBody");
const homeArticlesBody = document.getElementById("homeArticlesBody");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const addTreatmentBtn = document.getElementById("addTreatmentBtn");
const addMembershipBtn = document.getElementById("addMembershipBtn");
const addRewardActionBtn = document.getElementById("addRewardActionBtn");
const addRewardRedeemBtn = document.getElementById("addRewardRedeemBtn");
const addHomeArticleBtn = document.getElementById("addHomeArticleBtn");
const catalogForm = document.getElementById("catalogForm");
const exportCatalogBtn = document.getElementById("exportCatalogBtn");
const importCatalogBtn = document.getElementById("importCatalogBtn");
const importCatalogInput = document.getElementById("importCatalogInput");
const campaignsBody = document.getElementById("campaignsBody");
const campaignForm = document.getElementById("campaignForm");
const createCampaignBtn = document.getElementById("createCampaignBtn");
const refreshCampaignsBtn = document.getElementById("refreshCampaignsBtn");
const runDueCampaignsBtn = document.getElementById("runDueCampaignsBtn");
const auditLogsBody = document.getElementById("auditLogsBody");
const refreshAuditBtn = document.getElementById("refreshAuditBtn");
let metricsResizeTimer = null;
let metricsResizeFrame = null;
let pendingTxnFilter = "";
const CATEGORY_ID_UI_ALIASES = {
  koerper: "korper",
};
const CATEGORY_ID_STORAGE_ALIASES = {
  korper: "koerper",
};
const BODY_ZONE_OPTIONS = [
  { id: "face", label: "Gesicht" },
  { id: "neck", label: "Hals" },
  { id: "chest", label: "Brust" },
  { id: "underarms", label: "Achseln" },
  { id: "upper_arms", label: "Oberarme" },
  { id: "forearms", label: "Unterarme" },
  { id: "hands", label: "Hände" },
  { id: "belly", label: "Bauch" },
  { id: "bikini", label: "Bikini" },
  { id: "intimate", label: "Intimbereich" },
  { id: "upper_legs", label: "Oberschenkel" },
  { id: "knees", label: "Knie" },
  { id: "lower_legs", label: "Unterschenkel" },
  { id: "feet", label: "Füße" },
];
const BODY_ZONE_LABEL_BY_ID = Object.fromEntries(BODY_ZONE_OPTIONS.map((item) => [item.id, item.label]));
const BODY_ZONE_ALIAS_BY_TOKEN = {
  face: "face",
  gesicht: "face",
  neck: "neck",
  hals: "neck",
  chest: "chest",
  brust: "chest",
  underarms: "underarms",
  achseln: "underarms",
  "upper arms": "upper_arms",
  upper_arms: "upper_arms",
  oberarme: "upper_arms",
  forearms: "forearms",
  unterarme: "forearms",
  hands: "hands",
  haende: "hands",
  hande: "hands",
  belly: "belly",
  bauch: "belly",
  bikini: "bikini",
  intimate: "intimate",
  intimbereich: "intimate",
  "upper legs": "upper_legs",
  upper_legs: "upper_legs",
  oberschenkel: "upper_legs",
  knees: "knees",
  knie: "knees",
  "lower legs": "lower_legs",
  lower_legs: "lower_legs",
  unterschenkel: "lower_legs",
  feet: "feet",
  fuesse: "feet",
  fusse: "feet",
};
const THEME_FIELD_PATHS = [
  "colors.primary",
  "colors.secondary",
  "colors.background",
  "colors.surface",
  "colors.textPrimary",
  "colors.textSecondary",
  "colors.accent",
  "typography.headingFont",
  "typography.bodyFont",
  "radius.button",
  "radius.card",
  "radius.input",
  "membershipCard.preset",
  "membershipCard.backgroundColor",
  "membershipCard.textColor",
  "membershipCard.accentColor",
  "membershipCard.borderRadius",
  "membershipCard.gradientStrength",
  "membershipCard.textureOpacity",
  "membershipCard.cornerDecoration",
];
const THEME_PERCENT_FIELDS = new Set([
  "membershipCard.gradientStrength",
  "membershipCard.textureOpacity",
]);

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function downloadCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(";"));
  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function formatDateOnly(rawDate) {
  if (!rawDate) return "-";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(parsed);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  haptics("success");
  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }
  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
    state.toastTimer = null;
  }, 2600);
}

function ensureLazyFrameSource(frame) {
  if (!(frame instanceof HTMLIFrameElement)) return;
  const source = frame.getAttribute("data-src");
  if (!source) return;

  let expectedUrl;
  try {
    expectedUrl = new URL(source, window.location.href);
  } catch {
    return;
  }

  let currentUrl = null;
  const currentSource = frame.getAttribute("src");
  if (currentSource) {
    try {
      currentUrl = new URL(currentSource, window.location.href);
    } catch {
      currentUrl = null;
    }
  }

  if (!currentUrl || currentUrl.href !== expectedUrl.href) {
    frame.setAttribute("src", source);
  }
}

/* ---- Interaction layer: haptics, ripple, count-up (reduced-motion aware) ---- */
const reduceMotionQuery =
  typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

function prefersReducedMotion() {
  return Boolean(reduceMotionQuery.matches);
}

const HAPTIC_PATTERNS = { light: 8, medium: 16, success: [6, 30, 10], warn: [14, 40, 14] };

function haptics(kind = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (navigator.userActivation && !navigator.userActivation.isActive) return;
  try {
    navigator.vibrate(HAPTIC_PATTERNS[kind] || HAPTIC_PATTERNS.light);
  } catch {
    /* vibration not permitted — ignore */
  }
}

function createRipple(event, host) {
  if (prefersReducedMotion() || !(host instanceof HTMLElement)) return;
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${(event.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2}px`;
  ripple.style.top = `${(event.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2}px`;
  host.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
  window.setTimeout(() => ripple.remove(), 700);
}

function animateCount(element, toValue, formatter) {
  if (!element) return;
  const format = typeof formatter === "function" ? formatter : (value) => String(Math.round(value));
  const target = Number(toValue) || 0;
  const previous = Number(element.dataset.countValue);
  element.dataset.countValue = String(target);
  if (prefersReducedMotion() || !Number.isFinite(previous) || previous === target) {
    element.textContent = format(target);
    return;
  }
  const duration = 620;
  const start = performance.now();
  const from = previous;
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = format(from + (target - from) * eased);
    if (progress < 1) window.requestAnimationFrame(step);
    else element.textContent = format(target);
  };
  window.requestAnimationFrame(step);
}

function humanizeImportError(message) {
  const normalized = String(message || "").trim();
  if (!normalized) return "Serveranfrage fehlgeschlagen";
  if (normalized.includes("HTTP 403")) {
    return "Die Website blockiert den Direktzugriff per Cloudflare/403.";
  }
  return normalized;
}

function formatWebsiteImportSuccess(websiteSync) {
  const importedTreatments = Number(websiteSync?.importedTreatments || 0);
  const suffix = websiteSync?.importMode === "reader_fallback"
    ? " · per Fallback übernommen"
    : "";
  return `${importedTreatments} Treatments übernommen${suffix}`;
}

function normalizeHexColorForUi(value, fallback = "#8A5A2F") {
  const candidate = String(value || "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(candidate) ? candidate : fallback;
}

function displayCategoryId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return CATEGORY_ID_UI_ALIASES[normalized] || normalized;
}

function storeCategoryId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return CATEGORY_ID_STORAGE_ALIASES[normalized] || normalized;
}

function normalizeBodyZoneToken(value) {
  let normalized = String(value || "").trim().toLowerCase();
  normalized = normalized
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

function normalizeBodyZoneId(value) {
  const token = normalizeBodyZoneToken(value);
  if (!token) return "";
  if (BODY_ZONE_ALIAS_BY_TOKEN[token]) return BODY_ZONE_ALIAS_BY_TOKEN[token];
  const compact = token.replace(/ /g, "_");
  if (BODY_ZONE_LABEL_BY_ID[compact]) return compact;
  return "";
}

function normalizeBodyZones(value) {
  const raw = Array.isArray(value) ? value : [];
  const seen = new Set();
  const normalized = [];
  raw.forEach((entry) => {
    const zoneId = normalizeBodyZoneId(entry);
    if (!zoneId || seen.has(zoneId)) return;
    seen.add(zoneId);
    normalized.push(zoneId);
  });
  return BODY_ZONE_OPTIONS.map((item) => item.id).filter((zoneId) => seen.has(zoneId));
}

function bodyZoneLabel(zoneId) {
  return BODY_ZONE_LABEL_BY_ID[String(zoneId || "").trim()] || String(zoneId || "");
}

function renderBodyZoneChips(selected = []) {
  const selectedSet = new Set(normalizeBodyZones(selected));
  return BODY_ZONE_OPTIONS
    .map(
      (item) => `
        <label class="body-zone-chip ${selectedSet.has(item.id) ? "active" : ""}">
          <input type="checkbox" data-body-zone-option value="${escapeAttr(item.id)}" ${selectedSet.has(item.id) ? "checked" : ""}>
          <span>${escapeAttr(item.label)}</span>
        </label>
      `
    )
    .join("");
}

function buildSettingsPayload(extra = {}) {
  const payload = parseAuthForm(settingsForm);
  return { ...payload, ...extra };
}

function themeTools() {
  return window.CuraboTheme;
}

function normalizeTheme(theme) {
  return themeTools().normalizeTheme(theme);
}

function cloneTheme(theme) {
  return themeTools().clone(theme);
}

function readThemePath(source, path) {
  return String(path)
    .split(".")
    .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), source);
}

function writeThemePath(target, path, value) {
  const parts = String(path).split(".");
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
}

function appearanceElement(path) {
  if (!appearanceForm) return null;
  return appearanceForm.elements.namedItem(path);
}

function updateAppearanceRangeLabels(theme) {
  if (!appearanceForm) return;
  appearanceForm.querySelectorAll("[data-range-value]").forEach((node) => {
    const path = node.getAttribute("data-range-value");
    const value = Number(readThemePath(theme, path) || 0);
    node.textContent = `${value}${THEME_PERCENT_FIELDS.has(path) ? "%" : "px"}`;
  });
}

function setAppearanceColorPickerValue(textInput) {
  if (!(textInput instanceof HTMLInputElement)) return;
  const picker = document.querySelector(`[data-color-picker-for="${textInput.id}"]`);
  if (!(picker instanceof HTMLInputElement)) return;
  picker.value = themeTools().normalizeHex(textInput.value, picker.value || "#000000");
}

function getInvalidAppearanceColorFields() {
  if (!appearanceForm) return [];
  return Array.from(appearanceForm.querySelectorAll('.color-field input[type="text"]'))
    .filter((input) => input instanceof HTMLInputElement)
    .map((input) => {
      const label = input.closest("label");
      const labelText = label?.querySelector("span")?.textContent || input.name || input.id;
      const value = String(input.value || "").trim();
      const invalid = !/^#[0-9a-fA-F]{6}$/.test(value);
      input.setAttribute("aria-invalid", String(invalid));
      return invalid ? labelText : "";
    })
    .filter(Boolean);
}

function collectAppearanceThemeFromForm() {
  const draft = {};
  if (!appearanceForm) return normalizeTheme(draft);
  THEME_FIELD_PATHS.forEach((path) => {
    const element = appearanceElement(path);
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) return;
    let value;
    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      value = element.checked;
    } else if (element instanceof HTMLInputElement && element.type === "range") {
      value = Number(element.value);
    } else {
      value = element.value;
    }
    writeThemePath(draft, path, value);
  });
  return normalizeTheme(draft);
}

function updateAppearanceWorkflowState() {
  if (!appearanceForm) return;
  const tools = themeTools();
  const current = state.themeDraft ? normalizeTheme(state.themeDraft) : normalizeTheme({});
  const savedDraft = state.themeSavedDraft ? normalizeTheme(state.themeSavedDraft) : current;
  const published = state.themePublished ? normalizeTheme(state.themePublished) : normalizeTheme({});
  const hasInvalidColors = getInvalidAppearanceColorFields().length > 0;
  state.themeDirty = !tools.isThemeEqual(current, savedDraft);
  state.themeHasDraftChanges = !tools.isThemeEqual(current, published);

  if (appearanceDirtyBadge) {
    appearanceDirtyBadge.classList.toggle("hidden", !state.themeDirty);
  }
  if (appearanceStatus) {
    const draftLabel = state.themeDirty
      ? "Lokale Änderungen"
      : state.themeHasDraftChanges
        ? "Entwurf gespeichert"
        : "Live";
    if (state.themePublishedAt) {
      const liveSince = `seit ${formatDate(state.themePublishedAt)}`;
      appearanceStatus.textContent = draftLabel === "Live" ? `Live ${liveSince}` : `${draftLabel} • live ${liveSince}`;
    } else {
      appearanceStatus.textContent = `${draftLabel} • noch nicht veröffentlicht`;
    }
  }

  const disabled = !state.isOwner || state.themeLoading || hasInvalidColors;
  if (saveThemeDraftBtn) saveThemeDraftBtn.disabled = disabled || !state.themeDirty;
  if (publishThemeBtn) publishThemeBtn.disabled = disabled || !state.themeHasDraftChanges;
  if (resetAppearanceBtn) resetAppearanceBtn.disabled = !state.isOwner || state.themeLoading || (!state.themeDirty && !state.themeHasDraftChanges);
  if (resetDefaultAppearanceBtn) resetDefaultAppearanceBtn.disabled = !state.isOwner || state.themeLoading;
}

function renderAppearanceWarnings(theme) {
  if (!appearanceWarnings) return;
  const warnings = themeTools().contrastWarnings(theme);
  const invalidFields = getInvalidAppearanceColorFields();
  appearanceWarnings.classList.toggle("hidden", warnings.length === 0 && invalidFields.length === 0);
  const invalidHtml = invalidFields
    .map((label) => `<p><strong>${escapeAttr(label)}</strong>: Bitte einen gültigen HEX-Wert im Format #AABBCC eintragen.</p>`)
    .join("");
  const contrastHtml = warnings
    .map(
      (warning) => `
        <p>
          <strong>${escapeAttr(warning.label)}</strong>: Kontrast ${escapeAttr(warning.ratio)}:1.
          Vorschlag: ${escapeAttr(warning.suggestion)}.
        </p>
      `
    )
    .join("");
  appearanceWarnings.innerHTML = `${invalidHtml}${contrastHtml}`;
}

function applyAppearancePreview(themeInput) {
  if (!appearancePreview) return;
  const theme = normalizeTheme(themeInput);
  const card = theme.membershipCard;
  const setVar = (name, value) => appearancePreview.style.setProperty(name, value);
  setVar("--preview-bg", theme.colors.background);
  setVar("--preview-surface", theme.colors.surface);
  setVar("--preview-primary", theme.colors.primary);
  setVar("--preview-secondary", theme.colors.secondary);
  setVar("--preview-accent", theme.colors.accent);
  setVar("--preview-text", theme.colors.textPrimary);
  setVar("--preview-muted", theme.colors.textSecondary);
  setVar("--preview-button-radius", `${theme.radius.button}px`);
  setVar("--preview-card-radius", `${theme.radius.card}px`);
  setVar("--preview-input-radius", `${theme.radius.input}px`);
  setVar("--preview-heading-font", theme.typography.headingFont);
  setVar("--preview-body-font", theme.typography.bodyFont);
  setVar("--membership-bg", card.backgroundColor);
  setVar("--membership-text", card.textColor);
  setVar("--membership-accent", card.accentColor);
  setVar("--membership-radius", `${card.borderRadius}px`);
  setVar("--membership-gradient-opacity", String(card.gradientStrength / 100));
  setVar("--membership-texture-opacity", String(card.textureOpacity / 100));

  const membershipPreview = appearancePreview.querySelector("[data-membership-preview]");
  if (membershipPreview instanceof HTMLElement) {
    membershipPreview.dataset.preset = card.preset;
    membershipPreview.dataset.cornerDecoration = String(Boolean(card.cornerDecoration));
  }
  appearancePreview.querySelectorAll(".preview-primary-btn").forEach((button) => {
    if (!(button instanceof HTMLElement)) return;
    const isInverted = card.preset === "dark-premium";
    button.style.backgroundColor = isInverted ? "#FFFFFF" : theme.colors.primary;
    button.style.color = isInverted ? "#111318" : "#FFFFFF";
  });
  const scanButton = appearancePreview.querySelector(".preview-scan-btn");
  if (scanButton instanceof HTMLElement) {
    scanButton.style.backgroundColor = theme.colors.primary;
  }
  if (previewClinicName) {
    previewClinicName.textContent = state.settingsSnapshot?.clinicName || state.user?.clinicName || "Demo Aesthetics";
  }
  renderAppearanceWarnings(theme);
}

function fillAppearanceForm(themeInput) {
  if (!appearanceForm) return;
  const theme = normalizeTheme(themeInput);
  THEME_FIELD_PATHS.forEach((path) => {
    const element = appearanceElement(path);
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) return;
    const value = readThemePath(theme, path);
    if (element instanceof HTMLInputElement && element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = String(value);
    }
    if (element instanceof HTMLInputElement && element.type === "text") {
      setAppearanceColorPickerValue(element);
    }
  });
  updateAppearanceRangeLabels(theme);
  state.themeDraft = cloneTheme(theme);
  applyAppearancePreview(theme);
  updateAppearanceWorkflowState();
}

function setAppearanceDisabled(disabled) {
  if (!appearanceForm) return;
  Array.from(appearanceForm.elements).forEach((element) => {
    element.disabled = disabled;
  });
  [saveThemeDraftBtn, publishThemeBtn, resetAppearanceBtn, resetDefaultAppearanceBtn].forEach((button) => {
    if (button) button.disabled = disabled;
  });
}

function applyThemeStatePayload(payload) {
  const draftTheme = normalizeTheme(payload?.draftTheme || {});
  const publishedTheme = normalizeTheme(payload?.publishedTheme || {});
  state.themeDefault = normalizeTheme(payload?.defaultTheme || {});
  state.themePublished = cloneTheme(publishedTheme);
  state.themeSavedDraft = cloneTheme(draftTheme);
  state.themePublishedAt = payload?.publishedAt || "";
  state.themeUpdatedAt = payload?.updatedAt || "";
  state.themeDirty = false;
  state.themeHasDraftChanges = Boolean(payload?.hasDraftChanges);
  fillAppearanceForm(draftTheme);
}

async function loadClinicTheme() {
  if (!appearanceForm) return;
  const response = await apiRequest("/clinic/theme");
  applyThemeStatePayload(response);
  setAppearanceDisabled(!state.isOwner);
  updateAppearanceWorkflowState();
}

async function saveThemeDraft() {
  if (!state.isOwner || state.themeLoading) return;
  const theme = collectAppearanceThemeFromForm();
  state.themeLoading = true;
  updateAppearanceWorkflowState();
  try {
    const response = await apiRequest("/clinic/theme/draft", { method: "PUT", body: { theme } });
    applyThemeStatePayload(response);
    showToast("Theme-Entwurf gespeichert");
    await loadAuditLogs();
  } catch (error) {
    showToast(error.message);
  } finally {
    state.themeLoading = false;
    updateAppearanceWorkflowState();
  }
}

async function publishThemeDraft() {
  if (!state.isOwner || state.themeLoading) return;
  const theme = collectAppearanceThemeFromForm();
  state.themeLoading = true;
  updateAppearanceWorkflowState();
  try {
    const response = await apiRequest("/clinic/theme/publish", { method: "POST", body: { theme } });
    applyThemeStatePayload(response);
    showToast("Theme veröffentlicht");
    await loadAuditLogs();
  } catch (error) {
    showToast(error.message);
  } finally {
    state.themeLoading = false;
    updateAppearanceWorkflowState();
  }
}

async function resetThemeDraftToPublished() {
  if (!state.isOwner || state.themeLoading) return;
  state.themeLoading = true;
  updateAppearanceWorkflowState();
  try {
    const response = await apiRequest("/clinic/theme/reset-draft", { method: "POST", body: {} });
    applyThemeStatePayload(response);
    showToast("Theme auf Live-Stand zurückgesetzt");
    await loadAuditLogs();
  } catch (error) {
    showToast(error.message);
  } finally {
    state.themeLoading = false;
    updateAppearanceWorkflowState();
  }
}

function resetThemeToDefault() {
  if (!state.isOwner || state.themeLoading) return;
  const fallback = state.themeDefault || themeTools().DEFAULT_THEME;
  fillAppearanceForm(fallback);
  state.themeDraft = normalizeTheme(fallback);
  updateAppearanceWorkflowState();
}

function setAuthMessage(text, success = false) {
  authMessage.textContent = text;
  authMessage.classList.toggle("success", success);
}

function passwordEyeIcon(isVisible = false) {
  return isVisible
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.2 5.3A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a16.9 16.9 0 0 1-3 3.9"/><path d="M6.2 6.5C3.8 8.2 2.5 12 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 4.1-.9"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function setPasswordFieldVisible(field, isVisible = false) {
  const input = field?.querySelector("input");
  const toggle = field?.querySelector("[data-password-toggle]");
  if (!(input instanceof HTMLInputElement) || !(toggle instanceof HTMLButtonElement)) return;
  input.type = isVisible ? "text" : "password";
  toggle.innerHTML = passwordEyeIcon(isVisible);
  toggle.setAttribute("aria-pressed", isVisible ? "true" : "false");
  toggle.setAttribute("aria-label", isVisible ? "Passwort ausblenden" : "Passwort anzeigen");
  toggle.title = isVisible ? "Passwort ausblenden" : "Passwort anzeigen";
}

function resetPasswordVisibility(scope = document) {
  scope.querySelectorAll(".password-field").forEach((field) => setPasswordFieldVisible(field, false));
}

function handlePasswordToggleClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const toggle = target.closest("[data-password-toggle]");
  if (!(toggle instanceof HTMLButtonElement)) return;
  const field = toggle.closest(".password-field");
  const input = field?.querySelector("input");
  if (!(field instanceof Element) || !(input instanceof HTMLInputElement)) return;
  const nextVisible = input.type === "password";
  setPasswordFieldVisible(field, nextVisible);
  input.focus({ preventScroll: true });
}

function setTab(nextTab) {
  state.activeTab = nextTab;
  tabLogin.classList.toggle("active", nextTab === "login");
  tabRegister.classList.toggle("active", nextTab === "register");
  loginForm.classList.toggle("hidden", nextTab !== "login");
  registerForm.classList.toggle("hidden", nextTab !== "register");
  resetPasswordVisibility(authSection);
  setAuthMessage("");
}

function setSession(user) {
  state.user = user;
  state.isOwner = Boolean(user && user.role === "owner");

  if (!user) {
    sessionLabel.textContent = "Nicht angemeldet";
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    if (importCatalogBtn) importCatalogBtn.disabled = true;
    if (createCampaignBtn) createCampaignBtn.disabled = true;
    if (runDueCampaignsBtn) runDueCampaignsBtn.disabled = true;
    if (addMemberBtn) addMemberBtn.classList.add("hidden");
    if (onboardingCard) onboardingCard.classList.add("hidden");
    setCatalogDisabled(true);
    setAppearanceDisabled(true);
    return;
  }

  sessionLabel.textContent = `${user.fullName} • ${user.clinicName} • ${user.role}`;
  if (railUserName) railUserName.textContent = user.fullName || "—";
  if (railClinicName) railClinicName.textContent = user.clinicName || "—";
  if (railAvatar) {
    const source = String(user.clinicName || user.fullName || "C").trim();
    railAvatar.textContent = (source[0] || "C").toUpperCase();
  }
  setSubscriptionChip(user.subscriptionStatus);
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  showView(viewFromHash(), false);

  saveSettingsBtn.disabled = !state.isOwner;
  if (saveCatalogBtn) saveCatalogBtn.disabled = !state.isOwner;
  if (importCatalogBtn) importCatalogBtn.disabled = !state.isOwner;
  memberForm.classList.toggle("hidden", !state.isOwner);
  if (addMemberBtn) addMemberBtn.classList.toggle("hidden", !state.isOwner);
  startCheckoutBtn.classList.toggle("hidden", !state.isOwner);
  if (createCampaignBtn) createCampaignBtn.disabled = !state.isOwner;
  if (runDueCampaignsBtn) runDueCampaignsBtn.disabled = !state.isOwner;
  if (campaignForm) campaignForm.classList.toggle("hidden", !state.isOwner);
  setCatalogDisabled(!state.isOwner);
  setAppearanceDisabled(!state.isOwner);
  updateAppearanceWorkflowState();
}

function setCatalogDisabled(disabled) {
  if (!catalogForm) return;
  const controls = catalogForm.querySelectorAll("input, textarea, select, button.row-remove");
  controls.forEach((control) => {
    control.disabled = disabled;
  });
  [
    addCategoryBtn,
    addTreatmentBtn,
    addMembershipBtn,
    addRewardActionBtn,
    addRewardRedeemBtn,
    addHomeArticleBtn,
  ].forEach((button) => {
    if (button) {
      button.disabled = disabled;
      button.classList.toggle("hidden", disabled);
    }
  });
}

async function apiRequest(path, options = {}) {
  const requestOptions = {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: {},
  };

  if (Object.prototype.hasOwnProperty.call(options, "body")) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, requestOptions);
  const text = await response.text();

  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    throw new Error(payload.error || "Serveranfrage fehlgeschlagen");
  }

  return payload;
}

function fillSettingsForm(settings) {
  state.settingsSnapshot = { ...(settings || {}) };
  settingsForm.elements.clinicName.value = settings.clinicName || "";
  settingsForm.elements.website.value = settings.website || "";
  settingsForm.elements.logoUrl.value = settings.logoUrl || "";
  if (settingsForm.elements.designPreset) {
    settingsForm.elements.designPreset.value = settings.designPreset || "clean";
  }
  settingsForm.elements.calendlyUrl.value = settings.calendlyUrl || "";
  if (settingsForm.elements.notifyEmail) {
    settingsForm.elements.notifyEmail.value = settings.notifyEmail || "";
  }
  if (settingsForm.elements.slackWebhookUrl) {
    settingsForm.elements.slackWebhookUrl.value = settings.slackWebhookUrl || "";
  }
  if (settingsForm.elements.instagramUrl) {
    settingsForm.elements.instagramUrl.value = settings.instagramUrl || "";
  }
  if (settingsForm.elements.facebookUrl) {
    settingsForm.elements.facebookUrl.value = settings.facebookUrl || "";
  }
  if (settingsForm.elements.tiktokUrl) {
    settingsForm.elements.tiktokUrl.value = settings.tiktokUrl || "";
  }
  const calendarFeedField = document.getElementById("calendarFeedUrl");
  if (calendarFeedField) {
    calendarFeedField.value = settings.calendarFeedUrl || "";
  }
  chartColor = normalizeChartColorForUi(settings.chartColor);
  if (chartColorPicker instanceof HTMLInputElement) {
    chartColorPicker.value = chartColor;
    chartColorPicker.disabled = !state.isOwner;
  }
  updateChartColorControl(chartColor);
  scheduleMetricsRender();
  if (previewClinicName) {
    previewClinicName.textContent = settings.clinicName || state.user?.clinicName || "Demo Aesthetics";
  }

  const disabled = !state.isOwner;
  Array.from(settingsForm.elements).forEach((element) => {
    if (element.tagName === "BUTTON") return;
    element.disabled = disabled;
  });
}

function formatEuro(amountCents, currency = "eur") {
  const value = Number(amountCents || 0) / 100;
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: String(currency || "eur").toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} EUR`;
  }
}

function formatDate(rawDate) {
  if (!rawDate) return "-";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function formatPercent(value) {
  const numeric = Number(value || 0);
  return `${numeric.toFixed(1)}%`;
}

function setDeltaBadge(element, payload, compareMode = "none") {
  if (!element) return;
  if (!payload || compareMode === "none") {
    element.classList.add("hidden");
    return;
  }

  const deltaPercent = Number(payload.deltaPercent || 0);
  element.classList.remove("hidden");
  element.textContent = `${deltaPercent >= 0 ? "+" : ""}${deltaPercent.toFixed(1)}%`;
  element.style.color = deltaPercent >= 0 ? "#027a48" : "#b42318";
  element.style.background = deltaPercent >= 0 ? "#ecfdf3" : "#fef3f2";
  element.style.borderColor = deltaPercent >= 0 ? "#abefc6" : "#fee4e2";
}

function isValidDateInput(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function hasCustomMetricsRange() {
  return isValidDateInput(state.metricsFromDate) && isValidDateInput(state.metricsToDate);
}

function syncMetricsDateInputs() {
  if (metricsFromDateInput) metricsFromDateInput.value = state.metricsFromDate || "";
  if (metricsToDateInput) metricsToDateInput.value = state.metricsToDate || "";
}

function syncMetricsChipUi() {
  if (!metricsChipRow) return;
  const customRangeActive = hasCustomMetricsRange();
  const buttons = Array.from(metricsChipRow.querySelectorAll("button[data-days]"));
  buttons.forEach((button) => {
    const value = String(button.getAttribute("data-days") || "");
    button.classList.toggle("active", !customRangeActive && value === String(state.metricsDays));
  });
}

function updateCompareAvailability() {
  if (!metricsCompareSelect) return;
  const isAllTime = String(state.metricsDays) === "all" && !hasCustomMetricsRange();
  metricsCompareSelect.disabled = isAllTime;
  if (isAllTime) {
    metricsCompareSelect.value = "none";
    state.metricsCompareMode = "none";
  }
}

function setMetricsDays(nextValue) {
  const normalized = String(nextValue || "30").toLowerCase();
  if (!["7", "30", "90", "all"].includes(normalized)) {
    state.metricsDays = "30";
  } else {
    state.metricsDays = normalized;
  }
  state.metricsFromDate = "";
  state.metricsToDate = "";
  syncMetricsDateInputs();
  if (metricsDaysSelect) {
    metricsDaysSelect.value = state.metricsDays;
  }
  syncMetricsChipUi();
  updateCompareAvailability();
}

function applyCustomMetricsRange(fromDate, toDate) {
  state.metricsFromDate = String(fromDate || "").trim();
  state.metricsToDate = String(toDate || "").trim();
  syncMetricsDateInputs();
  syncMetricsChipUi();
  updateCompareAvailability();
}

function exportDashboardCard(kind) {
  const exportData = state.analytics.exportData || {};
  const payload = exportData[kind];
  if (!payload || !Array.isArray(payload.rows) || !payload.rows.length) {
    showToast("Für diese Kachel sind noch keine Daten verfügbar.");
    return;
  }
  const clinicSlug = String(state.user?.clinicName || "appointmentix")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "appointmentix";
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${clinicSlug}-${kind}-${date}.csv`;
  downloadCsv(filename, payload.headers || [], payload.rows);
  showToast(`CSV exportiert: ${filename}`);
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitCommaList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCommaList(values) {
  if (!Array.isArray(values)) return "";
  return values.join(", ");
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeSeries(values, fallbackLength = 12) {
  const normalized = Array.isArray(values)
    ? values.map((value) => Number(value || 0)).filter((value) => Number.isFinite(value))
    : [];
  if (normalized.length) return normalized;
  return Array.from({ length: fallbackLength }, () => 0);
}

function cumulativeSeries(values) {
  let running = 0;
  return values.map((value) => {
    running += Number(value || 0);
    return running;
  });
}

function getCanvasContext(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return context;
}

const LOGO_CYAN = "#35B2D8";
const LOGO_PINK = "#F56B8A";
const LOGO_BLUE = "#2F5D9B";
const LEGACY_CHART_BRAND = "#b56f80";
const CHART_BRAND = LOGO_PINK;
// User-selectable analytics chart color (persisted per clinic via /clinic/chart-color).
let chartColor = CHART_BRAND;

function normalizeChartColorForUi(value) {
  const normalized = normalizeHexColorForUi(value, CHART_BRAND);
  return normalized.toLowerCase() === LEGACY_CHART_BRAND ? CHART_BRAND : normalized;
}

function updateChartColorControl(color) {
  const normalized = normalizeChartColorForUi(color);
  if (chartColorControl) chartColorControl.style.setProperty("--chart-color", normalized);
  if (chartColorText) chartColorText.textContent = normalized.toUpperCase();
}

function hexToRgba(hex, alpha) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(245, 107, 138, ${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Trace a smooth (Catmull-Rom → bezier) curve through points; caller sets start.
function traceSmoothPath(context, pts) {
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    context.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
      p2[0],
      p2[1]
    );
  }
}

function chartNiceMax(value) {
  if (!(value > 0)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

const chartDayFmt = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });
const CHART_DAY_MS = 86400000;

function parseChartDate(iso) {
  if (!iso) return null;
  const dateOnly = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function chartDateLabel(iso) {
  const d = parseChartDate(iso);
  return d ? chartDayFmt.format(d) : "";
}

function chartIsoDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function chartDateAtDayStart(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function chartRangeDateKeys(windowInfo = {}, periodInfo = {}, sourceTimeseries = []) {
  const fromRaw = periodInfo.isCustomRange && periodInfo.from ? periodInfo.from : windowInfo.from;
  const toRaw = periodInfo.isCustomRange && periodInfo.to ? periodInfo.to : windowInfo.to;
  let start = chartDateAtDayStart(parseChartDate(fromRaw));
  let end = chartDateAtDayStart(parseChartDate(toRaw));

  if ((!start || !end) && Array.isArray(sourceTimeseries) && sourceTimeseries.length) {
    const sourceDates = sourceTimeseries
      .map((point) => chartDateAtDayStart(parseChartDate(point?.date)))
      .filter(Boolean)
      .sort((first, second) => first.getTime() - second.getTime());
    start = start || sourceDates[0] || null;
    end = end || sourceDates[sourceDates.length - 1] || null;
  }

  if (!start || !end || start > end) return [];
  const totalDays = Math.min(Math.floor((end.getTime() - start.getTime()) / CHART_DAY_MS) + 1, 3651);
  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return chartIsoDateKey(date);
  });
}

function normalizeMetricPoint(date, point = {}) {
  return {
    date,
    appOpen: Number(point.appOpen || 0),
    offerView: Number(point.offerView || 0),
    addToCart: Number(point.addToCart || 0),
    purchaseSuccess: Number(point.purchaseSuccess || 0),
    revenueCents: Number(point.revenueCents || 0),
    rewardClaim: Number(point.rewardClaim || 0),
    rewardRedeem: Number(point.rewardRedeem || 0),
  };
}

function buildMetricsTimeline(timeseries = [], windowInfo = {}, periodInfo = {}) {
  const source = Array.isArray(timeseries) ? timeseries : [];
  const byDate = new Map(
    source
      .filter((point) => point && point.date)
      .map((point) => [String(point.date), point])
  );
  const dates = chartRangeDateKeys(windowInfo, periodInfo, source);
  if (!dates.length) {
    return source.map((point) => normalizeMetricPoint(String(point.date || ""), point));
  }
  return dates.map((date) => normalizeMetricPoint(date, byDate.get(date) || {}));
}

function compactEuroAxis(cents) {
  const e = (Number(cents) || 0) / 100;
  if (e >= 1000) return `${(e / 1000).toFixed(e >= 10000 ? 0 : 1).replace(".", ",")}k €`;
  return `${Math.round(e)} €`;
}

function roundedEuroTooltip(cents) {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format((Number(cents) || 0) / 100);
  } catch {
    return `${Math.round((Number(cents) || 0) / 100)} EUR`;
  }
}

function compactNumAxis(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(".", ",")}k`;
  return String(Math.round(v));
}

function chartSectionCount(dates, seriesLength) {
  const parsedDates = (Array.isArray(dates) ? dates : []).map(parseChartDate).filter(Boolean);
  if (parsedDates.length >= 2) {
    const start = parsedDates[0].getTime();
    const end = parsedDates[parsedDates.length - 1].getTime();
    const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
    if (days <= 10) return days;
    if (days <= 35) return Math.ceil(days / 3);
    if (days <= 110) return Math.ceil(days / 7);
    return Math.min(Math.ceil(days / 30), 12);
  }
  const count = Number(seriesLength || 0);
  if (count <= 2) return 0;
  if (count <= 10) return count;
  if (count <= 35) return Math.ceil(count / 3);
  if (count <= 110) return Math.ceil(count / 7);
  return 12;
}

function drawChartSections(context, geometry, dates, seriesLength) {
  const sectionCount = chartSectionCount(dates, seriesLength);
  if (sectionCount <= 1) return;
  const sectionWidth = geometry.chartWidth / sectionCount;
  context.save();
  for (let index = 0; index < sectionCount; index += 1) {
    if (index % 2 !== 0) continue;
    context.fillStyle = "rgba(23, 21, 26, 0.026)";
    context.fillRect(
      geometry.paddingLeft + index * sectionWidth,
      geometry.paddingTop,
      Math.ceil(sectionWidth),
      geometry.chartHeight
    );
  }
  context.strokeStyle = "rgba(23, 21, 26, 0.035)";
  context.lineWidth = 1;
  for (let index = 1; index < sectionCount; index += 1) {
    const x = geometry.paddingLeft + index * sectionWidth;
    context.beginPath();
    context.moveTo(x + 0.5, geometry.paddingTop);
    context.lineTo(x + 0.5, geometry.paddingTop + geometry.chartHeight);
    context.stroke();
  }
  context.restore();
}

function drawChartXAxisLabels(context, geometry, dates) {
  if (!Array.isArray(dates) || !dates.length) return;
  context.save();
  context.fillStyle = "rgba(108,104,115,0.75)";
  context.font = "500 10px Inter, sans-serif";
  context.textBaseline = "alphabetic";
  const yX = geometry.baselineY + 14;
  const lastIdx = dates.length - 1;
  const midIdx = Math.floor(lastIdx / 2);
  const start = chartDateLabel(dates[0]);
  const mid = chartDateLabel(dates[midIdx]);
  const end = chartDateLabel(dates[lastIdx]);
  if (start) {
    context.textAlign = "left";
    context.fillText(start, geometry.paddingLeft, yX);
  }
  if (mid && lastIdx > 1) {
    context.textAlign = "center";
    context.fillText(mid, geometry.paddingLeft + geometry.chartWidth / 2, yX);
  }
  if (end) {
    context.textAlign = "right";
    context.fillText(end, geometry.paddingLeft + geometry.chartWidth, yX);
  }
  context.restore();
}

function drawRoundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function handleChartPointerMove(event) {
  const canvas = event.currentTarget;
  const entry = chartHoverState.get(canvas);
  if (!entry || !entry.hitbox || !entry.values?.length) return;
  const rect = canvas.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const ratio = clamp((pointerX - entry.hitbox.paddingLeft) / entry.hitbox.chartWidth, 0, 1);
  const nextIndex = Math.round(ratio * Math.max(entry.values.length - 1, 0));
  if (entry.activeIndex === nextIndex) return;
  entry.activeIndex = nextIndex;
  drawLineChart(canvas, entry.values, entry.options);
}

function handleChartPointerLeave(event) {
  const canvas = event.currentTarget;
  const entry = chartHoverState.get(canvas);
  if (!entry || entry.activeIndex === null) return;
  entry.activeIndex = null;
  drawLineChart(canvas, entry.values, entry.options);
}

function ensureChartHover(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const entry = chartHoverState.get(canvas) || {};
  if (entry.bound) return;
  canvas.addEventListener("pointermove", handleChartPointerMove);
  canvas.addEventListener("pointerdown", handleChartPointerMove);
  canvas.addEventListener("pointerleave", handleChartPointerLeave);
  chartHoverState.set(canvas, { ...entry, bound: true, activeIndex: null, values: [], options: {}, hitbox: null });
}

function drawChartHover(context, points, series, dates, options, geometry, activeIndex) {
  if (!Number.isInteger(activeIndex) || activeIndex < 0 || activeIndex >= points.length) return;
  const point = points[activeIndex];
  const value = series[activeIndex] || 0;
  const lineColor = options.lineColor || CHART_BRAND;
  const tooltipFormat = typeof options.tooltipFormat === "function"
    ? options.tooltipFormat
    : typeof options.valueFormat === "function"
      ? options.valueFormat
      : (v) => String(Math.round(v));
  const title = chartDateLabel(dates[activeIndex]) || `Tag ${activeIndex + 1}`;
  const metricLabel = options.tooltipLabel ? `${options.tooltipLabel}: ` : "";
  const valueText = `${metricLabel}${tooltipFormat(value)}`;

  context.save();
  context.strokeStyle = hexToRgba(lineColor, 0.26);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(point[0], geometry.paddingTop);
  context.lineTo(point[0], geometry.baselineY);
  context.stroke();

  context.fillStyle = "#fff";
  context.strokeStyle = lineColor;
  context.lineWidth = 2.2;
  context.beginPath();
  context.arc(point[0], point[1], 5, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.font = "600 12px Inter, sans-serif";
  const titleWidth = context.measureText(title).width;
  context.font = "800 13px Inter, sans-serif";
  const valueWidth = context.measureText(valueText).width;
  const tooltipWidth = Math.min(Math.ceil(Math.max(titleWidth, valueWidth) + 24), Math.max(geometry.width - 8, 92));
  const tooltipHeight = 46;
  const tooltipX = clamp(point[0] - tooltipWidth / 2, 4, geometry.width - tooltipWidth - 4);
  let tooltipY = point[1] - tooltipHeight - 12;
  if (tooltipY < 4) tooltipY = point[1] + 12;
  tooltipY = clamp(tooltipY, 4, geometry.height - tooltipHeight - 4);

  context.shadowColor = "rgba(20, 18, 28, 0.16)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 8;
  context.fillStyle = "rgba(255, 255, 255, 0.97)";
  drawRoundRect(context, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 11);
  context.fill();
  context.shadowColor = "transparent";
  context.strokeStyle = "rgba(228, 225, 232, 0.95)";
  context.lineWidth = 1;
  context.stroke();

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "rgba(108,104,115,0.88)";
  context.font = "600 12px Inter, sans-serif";
  context.fillText(title, tooltipX + 12, tooltipY + 18);
  context.fillStyle = "rgba(23,21,26,0.96)";
  context.font = "800 13px Inter, sans-serif";
  context.fillText(valueText, tooltipX + 12, tooltipY + 36);
  context.restore();
}

function drawLineChart(canvas, values, options = {}) {
  ensureChartHover(canvas);
  const context = getCanvasContext(canvas);
  if (!context) return;
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  const series = safeSeries(values, 2);
  const lineColor = options.lineColor || CHART_BRAND;
  const valueFormat = typeof options.valueFormat === "function" ? options.valueFormat : (v) => String(Math.round(v));
  const dates = Array.isArray(options.dates) ? options.dates : [];
  const hasData = Math.max(...series) > 0;
  const niceMax = chartNiceMax(Math.max(...series, 0));
  const yTicks = 4;

  context.clearRect(0, 0, width, height);
  context.font = "500 10px Inter, sans-serif";
  let maxLabelW = 0;
  for (let i = 0; i <= yTicks; i += 1) {
    maxLabelW = Math.max(maxLabelW, context.measureText(valueFormat((niceMax * i) / yTicks)).width);
  }
  const paddingTop = 12;
  const paddingRight = 12;
  const paddingBottom = dates.length ? 22 : 12;
  const paddingLeft = Math.min(Math.max(maxLabelW + 12, 30), 74);
  const chartWidth = Math.max(width - paddingLeft - paddingRight, 1);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 1);
  const baselineY = paddingTop + chartHeight;
  const previous = chartHoverState.get(canvas) || {};
  const activeIndex = Number.isInteger(previous.activeIndex)
    ? clamp(previous.activeIndex, 0, Math.max(series.length - 1, 0))
    : null;
  chartHoverState.set(canvas, {
    ...previous,
    bound: true,
    activeIndex,
    values,
    options,
    hitbox: { paddingLeft, chartWidth },
  });
  const geometry = { width, height, paddingTop, paddingLeft, chartWidth, chartHeight, baselineY };
  drawChartSections(context, geometry, dates, series.length);

  // gridlines + Y value labels
  context.textBaseline = "middle";
  for (let i = 0; i <= yTicks; i += 1) {
    const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
    context.beginPath();
    context.strokeStyle = i === 0 ? "rgba(23,21,26,0.14)" : "rgba(23,21,26,0.06)";
    context.lineWidth = 1;
    context.moveTo(paddingLeft, y + 0.5);
    context.lineTo(paddingLeft + chartWidth, y + 0.5);
    context.stroke();
    context.fillStyle = "rgba(108,104,115,0.75)";
    context.textAlign = "right";
    context.fillText(valueFormat((niceMax * i) / yTicks), paddingLeft - 7, y);
  }
  drawChartXAxisLabels(context, geometry, dates);

  if (!hasData) {
    context.fillStyle = "rgba(108,104,115,0.5)";
    context.font = "600 12px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText(options.emptyText || "Noch keine Daten", paddingLeft + chartWidth / 2, paddingTop + chartHeight / 2);
    return;
  }

  const points = series.map((value, index) => {
    const x = paddingLeft + (index / Math.max(series.length - 1, 1)) * chartWidth;
    const ratio = (Number(value || 0)) / niceMax;
    return [x, paddingTop + chartHeight - ratio * chartHeight];
  });

  // area fill (smooth)
  const gradient = context.createLinearGradient(0, paddingTop, 0, baselineY);
  gradient.addColorStop(0, hexToRgba(lineColor, 0.22));
  gradient.addColorStop(1, hexToRgba(lineColor, 0));
  context.beginPath();
  context.moveTo(points[0][0], baselineY);
  context.lineTo(points[0][0], points[0][1]);
  traceSmoothPath(context, points);
  context.lineTo(points[points.length - 1][0], baselineY);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  // primary line (smooth)
  context.beginPath();
  context.strokeStyle = lineColor;
  context.lineWidth = 2.25;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.moveTo(points[0][0], points[0][1]);
  traceSmoothPath(context, points);
  context.stroke();

  // end-point marker
  const last = points[points.length - 1];
  context.beginPath();
  context.fillStyle = "#ffffff";
  context.arc(last[0], last[1], 3.6, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.fillStyle = lineColor;
  context.arc(last[0], last[1], 2.4, 0, Math.PI * 2);
  context.fill();

  drawChartHover(
    context,
    points,
    series,
    dates,
    options,
    geometry,
    activeIndex
  );
}

const ACTION_LABELS = {
  "campaign.run": "Kampagne ausgeführt",
  "campaign.created": "Kampagne erstellt",
  "campaign.updated": "Kampagne geändert",
  "clinic.settings_updated": "Klinikdaten aktualisiert",
  "clinic.theme_draft_saved": "Theme-Entwurf gespeichert",
  "clinic.theme_published": "Theme veröffentlicht",
  "clinic.theme_draft_reset": "Theme-Entwurf zurückgesetzt",
  "catalog.updated": "Katalog gespeichert",
  "catalog.imported": "Katalog importiert",
  "catalog.imported_from_website": "Katalog von Website übernommen",
  "catalog.auto_gallery": "Galerie automatisch erstellt",
  "media.uploaded": "Bild hochgeladen",
  "media.deleted": "Bild gelöscht",
  "member.created": "Teammitglied hinzugefügt",
  "membership.activated": "Mitgliedschaft aktiviert",
  "membership.canceled": "Mitgliedschaft gekündigt",
  "membership.marked_past_due": "Zahlung überfällig markiert",
  "billing.checkout_started": "Checkout gestartet",
  "billing.checkout_completed": "Zahlung abgeschlossen",
  "billing.subscription_updated": "Abo aktualisiert",
  "billing.invoice_status_updated": "Rechnungsstatus aktualisiert",
  "mobile.checkout_session_created": "Kauf gestartet (App)",
  "mobile.checkout_completed": "Kauf abgeschlossen (App)",
  "mobile.checkout_failed": "Kauf fehlgeschlagen (App)",
  "mobile.appointment_canceled": "Termin storniert (App)",
  "mobile.appointment_rescheduled": "Termin umgebucht (App)",
  "mobile.appointment_reschedule_requested": "Umbuchung angefragt (App)",
};

function actionToFeedText(action) {
  const key = String(action || "");
  if (ACTION_LABELS[key]) return ACTION_LABELS[key];
  if (!key) return "Aktivität";
  // Fallback: turn "catalog.some_action" into "Some action" so unmapped
  // codes still read like prose instead of raw machine strings.
  const tail = key.includes(".") ? key.slice(key.indexOf(".") + 1) : key;
  const words = tail.replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Aktivität";
}

const ACTIVITY_COLORS = {
  campaign: LOGO_BLUE,
  catalog: LOGO_CYAN,
  clinic: "#6c8ab6",
  billing: "#d98a2b",
  appointment: LOGO_PINK,
  default: LOGO_PINK,
};
function activityColor(action) {
  const key = String(action || "").split(".")[0];
  return ACTIVITY_COLORS[key] || ACTIVITY_COLORS.default;
}

function renderLiveFeed(rows = []) {
  if (!liveActivityBody) return;
  const items = rows.slice(0, 8);
  if (!items.length) {
    liveActivityBody.innerHTML = "<li class='activity-empty'>Noch keine Aktivitäten.</li>";
    return;
  }

  liveActivityBody.innerHTML = items
    .map((row) => {
      const actorRaw = String(row.actorName || row.actorEmail || "System").trim();
      const actor = escapeHtml(actorRaw || "System");
      const action = escapeHtml(actionToFeedText(row.action));
      const when = escapeHtml(formatDate(row.createdAt));
      const initial = escapeHtml((actorRaw[0] || "•").toUpperCase());
      const color = activityColor(row.action);
      return `<li class="activity-item">
        <span class="activity-avatar" style="background:${color}">${initial}</span>
        <span class="activity-body">
          <span class="activity-title"><strong>${actor}</strong> · ${action}</span>
          <span class="activity-meta">${when}</span>
        </span>
      </li>`;
    })
    .join("");
}

// Trend over the loaded window: sum of the later half vs the earlier half.
function seriesTrendPercent(series) {
  const arr = (series || []).map((n) => Number(n) || 0);
  if (arr.length < 4) return null;
  const half = Math.floor(arr.length / 2);
  const earlier = arr.slice(0, half).reduce((s, x) => s + x, 0);
  const later = arr.slice(half).reduce((s, x) => s + x, 0);
  if (earlier <= 0) return null;
  return ((later - earlier) / earlier) * 100;
}
function setKpiDelta(element, percent) {
  if (!element) return;
  if (percent === null || !Number.isFinite(percent) || Math.abs(percent) < 0.05) {
    element.classList.add("hidden");
    return;
  }
  const up = percent >= 0;
  element.classList.remove("hidden");
  element.classList.toggle("up", up);
  element.classList.toggle("down", !up);
  element.textContent = `${up ? "+" : "−"}${Math.abs(percent).toFixed(1)} %`;
}

function renderRevenueSources(summary = {}, memberships = {}, backendSources = []) {
  if (!revenueSourcesBar || !revenueSourcesBody) return;
  let rows = [];
  if (Array.isArray(backendSources) && backendSources.length) {
    rows = backendSources.map((row) => ({
      label: String(row.label || "-"),
      value: Math.max(0, Number(row.valueCents || 0)),
      color: row.color || "#667085",
    }));
  } else {
    const mrr = Number(summary.membershipsMrrCents || memberships.mrrCents || 0);
    const revenue = Number(summary.revenueCents || 0);
    const rewardsCash = Math.max(0, Number(summary.rewardRedeem || 0) * 1500);
    const notificationOffers = Math.max(0, Math.round(revenue * 0.58));
    const customPlans = Math.max(0, Math.round(revenue * 0.07));
    const shop = Math.max(0, revenue - notificationOffers - customPlans);
    rows = [
      { label: "Mitgliedschaften", value: mrr, color: LOGO_PINK },
      { label: "Rewards & Guthaben", value: rewardsCash, color: LOGO_CYAN },
      { label: "Angebotskampagnen", value: notificationOffers, color: LOGO_BLUE },
      { label: "Sonderpläne", value: customPlans, color: "#8b97a6" },
      { label: "Shop", value: shop, color: "#6b7280" },
    ];
  }

  // Harmonized brand palette — logo accents plus neutral support colors.
  const SOURCE_PALETTE = [LOGO_PINK, LOGO_CYAN, LOGO_BLUE, "#8b97a6", "#6b7280", "#9aa3af"];
  rows = rows.map((row, index) => ({ ...row, color: SOURCE_PALETTE[index % SOURCE_PALETTE.length] }));

  const total = Math.max(rows.reduce((sum, row) => sum + row.value, 0), 1);

  revenueSourcesBar.innerHTML = rows
    .map(
      (row) =>
        `<span class=\"revenue-segment\" style=\"width:${((row.value / total) * 100).toFixed(2)}%;background:${row.color}\"></span>`
    )
    .join("");

  revenueSourcesBody.innerHTML = rows
    .map((row) => {
      const percent = (row.value / total) * 100;
      return `<div class=\"source-item\">
        <span class=\"source-dot\" style=\"background:${row.color}\"></span>
        <span class=\"source-label\">${escapeHtml(row.label)}</span>
        <span class=\"source-value\">${escapeHtml(formatEuro(row.value))} (${percent.toFixed(1)}%)</span>
      </div>`;
    })
    .join("");

  return rows.map((row) => ({
    ...row,
    percent: total > 0 ? (row.value / total) * 100 : 0,
  }));
}

function renderTopClients(rows = []) {
  if (!topClientsBody) return;
  if (!rows.length) {
    topClientsBody.innerHTML = "<tr><td colspan='2'>Noch keine Kundendaten.</td></tr>";
    return [];
  }

  const sorted = [...rows]
    .sort((first, second) => Number(second.monthlyAmountCents || 0) - Number(first.monthlyAmountCents || 0))
    .slice(0, 6);

  topClientsBody.innerHTML = sorted
    .map((row) => {
      const name = row.patientName || row.patientEmail || "Unbekannt";
      return `<tr>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(formatEuro(row.monthlyAmountCents || 0, row.currency || "eur"))}</td>
      </tr>`;
    })
    .join("");
  return sorted.map((row) => ({
    name: row.patientName || row.patientEmail || "Unbekannt",
    monthlyAmountCents: Number(row.monthlyAmountCents || 0),
    currency: row.currency || "eur",
  }));
}

function renderTopTeam(rows = [], summary = {}, auditRows = [], backendTopTeam = []) {
  if (!topTeamBody) return;
  if (Array.isArray(backendTopTeam) && backendTopTeam.length) {
    topTeamBody.innerHTML = backendTopTeam
      .slice(0, 6)
      .map(
        (entry) =>
          `<tr><td>${escapeHtml(entry.name || entry.email || "Team")}</td><td>${escapeHtml(formatEuro(entry.salesCents || 0))}</td></tr>`
      )
      .join("");
    return backendTopTeam.slice(0, 6).map((entry) => ({
      name: entry.name || entry.email || "Team",
      salesCents: Number(entry.salesCents || 0),
    }));
  }

  if (!rows.length) {
    topTeamBody.innerHTML = "<tr><td colspan='2'>Noch kein Team.</td></tr>";
    return [];
  }

  const activityByEmail = {};
  auditRows.forEach((row) => {
    const key = String(row.actorEmail || "").toLowerCase();
    if (!key) return;
    activityByEmail[key] = (activityByEmail[key] || 0) + 1;
  });

  const totalActivity = Math.max(
    rows.reduce((sum, member) => sum + (activityByEmail[String(member.email || "").toLowerCase()] || 1), 0),
    1
  );
  const totalRevenue = Number(summary.revenueCents || 0);

  const prepared = rows
    .map((member) => {
      const activity = activityByEmail[String(member.email || "").toLowerCase()] || 1;
      const allocated = Math.round((activity / totalActivity) * totalRevenue);
      return {
        name: member.fullName || member.email || "Team",
        salesCents: allocated,
      };
    })
    .sort((first, second) => second.salesCents - first.salesCents)
    .slice(0, 6);

  topTeamBody.innerHTML = prepared
    .map(
      (member) =>
        `<tr><td>${escapeHtml(member.name)}</td><td>${escapeHtml(formatEuro(member.salesCents))}</td></tr>`
    )
    .join("");
  return prepared.map((entry) => ({
    name: entry.name,
    salesCents: Number(entry.salesCents || 0),
  }));
}

function renderMetricsDashboard() {
  const summary = state.analytics.summary || {};
  const rawTimeseries = Array.isArray(state.analytics.timeseries) ? state.analytics.timeseries : [];
  const windowInfo = state.analytics.window || {};
  const memberships = state.membershipSummary || {};
  const members = state.members || [];
  const auditRows = state.auditLogs || [];
  const comparison = state.analytics.comparison || {};
  const periodInfo = state.analytics.period || {};
  const timeseries = buildMetricsTimeline(rawTimeseries, windowInfo, periodInfo);
  const compareMode = comparison.enabled ? String(comparison.mode || "none") : "none";
  const deltas = comparison.deltas || {};

  if (dashboardGreeting && state.user) {
    const firstName = String(state.user.fullName || "").split(" ")[0] || "Team";
    dashboardGreeting.textContent = `Guten Morgen ${firstName} 👋`;
  }
  if (metricsDateRangeLabel) {
    const fromText = periodInfo.isCustomRange && periodInfo.from ? formatDateOnly(periodInfo.from) : formatDateOnly(windowInfo.from);
    const toText = periodInfo.isCustomRange && periodInfo.to ? formatDateOnly(periodInfo.to) : formatDateOnly(windowInfo.to);
    metricsDateRangeLabel.textContent = `Zeitraum: ${fromText} – ${toText}`;
  }

  const revenueByDay = timeseries.map((point) => Number(point.revenueCents || 0));
  const purchasesByDay = timeseries.map((point) => Number(point.purchaseSuccess || 0));
  const viewsByDay = timeseries.map((point) => Number(point.offerView || 0));
  const appOpenByDay = timeseries.map((point) => Number(point.appOpen || 0));
  const referralByDay = timeseries.map((point) => Number(point.rewardClaim || 0));
  const reviewByDay = referralByDay.map((value, index) => Math.round(value * 0.4 + (purchasesByDay[index] || 0) * 0.1));
  const mrrBase = Number(summary.membershipsMrrCents || 0);
  const mrrSeries = purchasesByDay.map((value, index) => Math.max(0, mrrBase - (purchasesByDay.length - index) * 150 + value * 120));

  const activeUsers = Number(summary.activeUsers || 0);
  const activeMemberships = Math.max(Number(summary.activeMemberships || 0), 1);
  const revenueTotal = Number(summary.revenueCents || 0);
  const appUserLtvCents = Number(summary.appUserLtvCents || (activeUsers > 0 ? Math.round(revenueTotal / activeUsers) : 0));
  const clientLtvCents = Number(summary.clientLtvCents || Math.round(revenueTotal / activeMemberships));
  const appUserLtvSeries = cumulativeSeries(revenueByDay).map((value, index) => {
    const divisor = Math.max(index + 1, 1);
    return Math.round(value / divisor);
  });
  const clientLtvSeries = cumulativeSeries(revenueByDay).map((value, index) => {
    const divisor = Math.max(Math.round((index + 1) / 2), 1);
    return Math.round(value / divisor);
  });

  // The final bucket is "today", which is usually still 0 early in the day.
  // Fall back to the most recent day that actually has revenue so the headline
  // stays meaningful instead of flashing 0,00 € on every morning login.
  let latestIdx = revenueByDay.length - 1;
  while (latestIdx > 0 && !(revenueByDay[latestIdx] > 0)) latestIdx -= 1;
  const latestRevenue = Number(summary.dailyProcessingCents || revenueByDay[latestIdx] || 0);
  const previousRevenue = revenueByDay[latestIdx - 1] || 0;
  const dailyDelta = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  if (metricDailyProcessingValue) animateCount(metricDailyProcessingValue, latestRevenue, formatEuro);
  if (metricDailyProcessingDelta && compareMode !== "none" && deltas.dailyProcessingCents) {
    setDeltaBadge(metricDailyProcessingDelta, deltas.dailyProcessingCents, compareMode);
  } else if (metricDailyProcessingDelta && latestRevenue <= 0 && previousRevenue <= 0) {
    metricDailyProcessingDelta.classList.add("hidden");
  } else if (metricDailyProcessingDelta) {
    metricDailyProcessingDelta.classList.remove("hidden");
    metricDailyProcessingDelta.textContent = `${dailyDelta >= 0 ? "+" : ""}${dailyDelta.toFixed(1)}%`;
    metricDailyProcessingDelta.style.color = dailyDelta >= 0 ? "#027a48" : "#b42318";
    metricDailyProcessingDelta.style.background = dailyDelta >= 0 ? "#ecfdf3" : "#fef3f2";
    metricDailyProcessingDelta.style.borderColor = dailyDelta >= 0 ? "#abefc6" : "#fee4e2";
  }

  if (metricNetRevenueValue) metricNetRevenueValue.textContent = formatEuro(revenueTotal);
  if (metricMRRValue) metricMRRValue.textContent = formatEuro(mrrBase);
  if (kpiRevenue) animateCount(kpiRevenue, revenueTotal, formatEuro);
  if (kpiMrr) animateCount(kpiMrr, mrrBase, formatEuro);
  if (kpiMembers) animateCount(kpiMembers, Number(summary.activeMemberships || 0));
  if (kpiAppUsers) animateCount(kpiAppUsers, activeUsers);
  setKpiDelta(kpiRevenueDelta, seriesTrendPercent(revenueByDay));
  setKpiDelta(kpiMrrDelta, seriesTrendPercent(mrrSeries));
  setKpiDelta(kpiAppUsersDelta, seriesTrendPercent(appOpenByDay));

  if (analyseStats) {
    const purchases = purchasesByDay.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const views = viewsByDay.reduce((sum, v) => sum + (Number(v) || 0), 0);
    const aps = state.appointmentSummary || {};
    const apTotal = Number(aps.total || 0);
    const ms = state.membershipSummary || {};
    const mTotal = Number(ms.total || 0);
    const pct = (v) => (v === null ? "—" : `${v.toFixed(1)} %`);
    const conversion = views > 0 ? (purchases / views) * 100 : null;
    const cancelRate = apTotal > 0 ? (Number(aps.canceled || 0) / apTotal) * 100 : null;
    const churn = mTotal > 0 ? (Number(ms.canceled || 0) / mTotal) * 100 : null;
    const chips = [
      { label: "Ø Behandlungswert", value: purchases > 0 ? formatEuro(Math.round(revenueTotal / purchases)) : "—", cls: "brand" },
      { label: "Conversion", value: pct(conversion), cls: "ok" },
      { label: "Stornoquote", value: pct(cancelRate), cls: "warn" },
      { label: "Mitglieder-Churn", value: pct(churn), cls: "danger" },
    ];
    analyseStats.innerHTML = chips
      .map((c) => `<div class="pstat ${c.cls}"><span class="pstat-value">${escapeHtml(c.value)}</span><span class="pstat-label">${escapeHtml(c.label)}</span></div>`)
      .join("");
  }
  if (metricAppUserLTVValue) metricAppUserLTVValue.textContent = formatEuro(appUserLtvCents);
  if (metricClientLTVValue) metricClientLTVValue.textContent = formatEuro(clientLtvCents);
  if (metricAppUsersValue) metricAppUsersValue.textContent = String(activeUsers);
  if (metricReferralsValue) metricReferralsValue.textContent = String(summary.rewardClaim || 0);
  if (metricVisitsValue) metricVisitsValue.textContent = String(summary.appOpen || 0);
  if (metricReviewsValue) metricReviewsValue.textContent = String(reviewByDay.reduce((sum, value) => sum + value, 0));

  setDeltaBadge(metricNetRevenueDelta, deltas.revenueCents, compareMode);
  setDeltaBadge(metricMRRDelta, deltas.membershipsMrrCents, compareMode);
  setDeltaBadge(metricAppUserLTVDelta, deltas.appUserLtvCents, compareMode);
  setDeltaBadge(metricClientLTVDelta, deltas.clientLtvCents, compareMode);
  setDeltaBadge(metricAppUsersDelta, deltas.activeUsers, compareMode);
  setDeltaBadge(metricReferralsDelta, deltas.rewardClaim, compareMode);
  setDeltaBadge(metricVisitsDelta, deltas.appOpen, compareMode);

  const chartDates = timeseries.map((point) => point.date || "");
  drawLineChart(chartDailyProcessing, revenueByDay, {
    lineColor: chartColor,
    valueFormat: compactEuroAxis,
    tooltipFormat: roundedEuroTooltip,
    tooltipLabel: "Tagesumsatz",
    dates: chartDates,
  });
  drawLineChart(chartNetRevenue, revenueByDay, {
    lineColor: chartColor,
    valueFormat: compactEuroAxis,
    tooltipFormat: roundedEuroTooltip,
    tooltipLabel: "Nettoumsatz",
    dates: chartDates,
  });
  drawLineChart(chartMRR, mrrSeries, {
    lineColor: chartColor,
    valueFormat: compactEuroAxis,
    tooltipFormat: roundedEuroTooltip,
    tooltipLabel: "MRR",
    dates: chartDates,
  });
  drawLineChart(chartAppUserLTV, appUserLtvSeries, {
    lineColor: chartColor,
    valueFormat: compactEuroAxis,
    tooltipFormat: roundedEuroTooltip,
    tooltipLabel: "LTV",
    dates: chartDates,
  });
  drawLineChart(chartClientLTV, clientLtvSeries, {
    lineColor: chartColor,
    valueFormat: compactEuroAxis,
    tooltipFormat: roundedEuroTooltip,
    tooltipLabel: "Kunden-LTV",
    dates: chartDates,
  });
  drawLineChart(chartAppUsers, cumulativeSeries(appOpenByDay), {
    lineColor: chartColor,
    valueFormat: compactNumAxis,
    tooltipLabel: "App-Nutzer",
    dates: chartDates,
  });
  drawLineChart(chartReferrals, cumulativeSeries(referralByDay), {
    lineColor: chartColor,
    valueFormat: compactNumAxis,
    tooltipLabel: "Empfehlungen",
    dates: chartDates,
  });
  drawLineChart(chartVisits, appOpenByDay, {
    lineColor: chartColor,
    valueFormat: compactNumAxis,
    tooltipLabel: "Besuche",
    dates: chartDates,
  });
  drawLineChart(chartReviews, cumulativeSeries(reviewByDay), {
    lineColor: chartColor,
    valueFormat: compactNumAxis,
    tooltipLabel: "Bewertungen",
    dates: chartDates,
  });

  renderLiveFeed(auditRows);
  const sourceRows = renderRevenueSources(summary, memberships, state.analytics.revenueSources || []);
  const topClientRows = renderTopClients(state.patientMemberships || []);
  const topTeamRows = renderTopTeam(members, summary, auditRows, state.analytics.topTeam || []);

  const appUsersSeries = cumulativeSeries(appOpenByDay);
  const referralsSeries = cumulativeSeries(referralByDay);
  const reviewsSeries = cumulativeSeries(reviewByDay);
  const timelineRows = timeseries.map((point, index) => ({
    date: point.date || "",
    revenueCents: Number(point.revenueCents || 0),
    mrrCents: Number(mrrSeries[index] || 0),
    appUsers: Number(appUsersSeries[index] || 0),
    referrals: Number(referralsSeries[index] || 0),
    visits: Number(point.appOpen || 0),
    reviews: Number(reviewsSeries[index] || 0),
    appUserLtvCents: Number(appUserLtvSeries[index] || 0),
    clientLtvCents: Number(clientLtvSeries[index] || 0),
  }));

  state.analytics.exportData = {
    dailyProcessing: {
      headers: ["Datum", "Tagesumsatz (Cent)", "Tagesumsatz (EUR)", "Käufe", "Offer Views"],
      rows: timeseries.map((point) => [
        point.date || "",
        Number(point.revenueCents || 0),
        (Number(point.revenueCents || 0) / 100).toFixed(2),
        Number(point.purchaseSuccess || 0),
        Number(point.offerView || 0),
      ]),
    },
    netRevenue: {
      headers: ["Datum", "Nettoumsatz (Cent)", "Nettoumsatz (EUR)"],
      rows: timelineRows.map((row) => [row.date, row.revenueCents, (row.revenueCents / 100).toFixed(2)]),
    },
    mrr: {
      headers: ["Datum", "MRR (Cent)", "MRR (EUR)"],
      rows: timelineRows.map((row) => [row.date, row.mrrCents, (row.mrrCents / 100).toFixed(2)]),
    },
    appUserLtv: {
      headers: ["Datum", "LTV pro App-Nutzer (Cent)", "LTV pro App-Nutzer (EUR)"],
      rows: timelineRows.map((row) => [row.date, row.appUserLtvCents, (row.appUserLtvCents / 100).toFixed(2)]),
    },
    clientLtv: {
      headers: ["Datum", "Kunden-LTV (Cent)", "Kunden-LTV (EUR)"],
      rows: timelineRows.map((row) => [row.date, row.clientLtvCents, (row.clientLtvCents / 100).toFixed(2)]),
    },
    appUsers: {
      headers: ["Datum", "App-Nutzer (kumuliert)"],
      rows: timelineRows.map((row) => [row.date, row.appUsers]),
    },
    referrals: {
      headers: ["Datum", "Empfehlungen (kumuliert)"],
      rows: timelineRows.map((row) => [row.date, row.referrals]),
    },
    visits: {
      headers: ["Datum", "Besuche"],
      rows: timelineRows.map((row) => [row.date, row.visits]),
    },
    reviews: {
      headers: ["Datum", "Google-Bewertungen (Proxy)"],
      rows: timelineRows.map((row) => [row.date, row.reviews]),
    },
    revenueSources: {
      headers: ["Quelle", "Wert (Cent)", "Wert (EUR)", "Anteil %"],
      rows: sourceRows.map((row) => [row.label, Number(row.value || 0), (Number(row.value || 0) / 100).toFixed(2), row.percent.toFixed(2)]),
    },
    topClients: {
      headers: ["Name", "Monatlicher Umsatz (Cent)", "Monatlicher Umsatz (EUR)"],
      rows: topClientRows.map((row) => [row.name, row.monthlyAmountCents, (row.monthlyAmountCents / 100).toFixed(2)]),
    },
    topTeam: {
      headers: ["Name", "Umsatz (Cent)", "Umsatz (EUR)"],
      rows: topTeamRows.map((row) => [row.name, row.salesCents, (row.salesCents / 100).toFixed(2)]),
    },
  };
}

function scheduleMetricsRender() {
  if (metricsResizeTimer) {
    window.clearTimeout(metricsResizeTimer);
  }
  metricsResizeTimer = window.setTimeout(() => {
    if (metricsResizeFrame) {
      window.cancelAnimationFrame(metricsResizeFrame);
    }
    metricsResizeFrame = window.requestAnimationFrame(() => {
      renderMetricsDashboard();
      metricsResizeFrame = null;
    });
  }, 120);
}

// Hard guard for the embedded catalog editor: it must always show /catalog and may
// never drift to another page (e.g. a nested dashboard from a stale cache). If it
// ever points elsewhere, reset it to the editor with a cache-busting timestamp.
const catalogFrame = document.querySelector(".catalog-embed");
function ensureCatalogFrame(force = false) {
  if (!catalogFrame) return;
  let path = "";
  try { path = catalogFrame.contentWindow.location.pathname; } catch (_) { path = ""; }
  if (force || (path && path !== "/catalog")) {
    catalogFrame.src = `/catalog?embed=1&t=${Date.now()}`;
  }
}
if (catalogFrame) {
  catalogFrame.addEventListener("load", () => {
    let path = "";
    try { path = catalogFrame.contentWindow.location.pathname; } catch (_) { return; }
    if (path && path !== "/catalog") {
      catalogFrame.src = `/catalog?embed=1&t=${Date.now()}`;
    }
  });
}

function showView(viewName, updateHash = true) {
  const target = VIEW_META[viewName] ? viewName : "overview";
  railNavItems.forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-view") === target);
  });
  viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.getAttribute("data-view-panel") === target);
  });
  if (viewEyebrow && VIEW_META[target]) {
    viewEyebrow.textContent = VIEW_META[target].eyebrow;
  }
  if (target === "analyse") {
    scheduleMetricsRender();
  }
  if (target === "checkin") {
    onEnterCheckin();
  } else {
    leaveCheckin();
  }
  if (target === "katalog") {
    ensureCatalogFrame();
  }
  if (target === "zahlungen") {
    const pf = pendingTxnFilter;
    pendingTxnFilter = "";
    loadTransactions()
      .then(() => {
        if (pf) setTxnFilter(pf);
      })
      .catch((error) => showToast(error.message || "Zahlungen konnten nicht geladen werden."));
  }
  if (updateHash && state.user) {
    const nextHash = `#${target}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function viewFromHash() {
  const raw = String(window.location.hash || "").replace(/^#/, "").trim();
  const [viewName, query = ""] = raw.split("?");
  if (viewName === "zahlungen" && query) {
    const params = new URLSearchParams(query);
    pendingTxnFilter = normalizeTxnFilter(params.get("filter") || "all");
  }
  return VIEW_META[viewName] ? viewName : "overview";
}

function setSubscriptionChip(status) {
  if (!subscriptionChip) return;
  const normalized = String(status || "inactive").toLowerCase();
  const map = {
    active: { label: "Abo aktiv", cls: "ok" },
    trialing: { label: "Testphase", cls: "ok" },
    past_due: { label: "Zahlung offen", cls: "warn" },
    canceled: { label: "Abo gekündigt", cls: "warn" },
    inactive: { label: "Abo inaktiv", cls: "muted" },
  };
  const info = map[normalized] || map.inactive;
  subscriptionChip.textContent = info.label;
  subscriptionChip.className = `sub-chip ${info.cls}`;
}

function renderOnboarding() {
  if (!onboardingCard || !onboardSteps) return;
  if (!state.user) {
    onboardingCard.classList.add("hidden");
    return;
  }
  const status = String(state.user.subscriptionStatus || "inactive").toLowerCase();
  const settings = state.settingsSnapshot || {};
  const hasTreatments = Boolean(treatmentsBody && treatmentsBody.querySelector("tr"));
  const hasTeam = Boolean(membersBody && membersBody.querySelectorAll("tr").length > 1);
  const hasProfile = Boolean(String(settings.website || "").trim() || String(settings.logoUrl || "").trim());

  const steps = [
    {
      done: ["active", "trialing"].includes(status),
      title: "Abo aktivieren",
      hint: "Schalte App, Shop und Mitgliedschaften frei.",
      view: "abo",
    },
    {
      done: hasTreatments,
      title: "Behandlungen anlegen",
      hint: "Lege deinen Katalog an, damit Patienten buchen können.",
      view: "katalog",
    },
    {
      done: hasProfile,
      title: "Klinik-Profil vervollständigen",
      hint: "Website, Logo und Branding für deine Patienten-App.",
      view: "einstellungen",
    },
    {
      done: hasTeam,
      title: "Team einladen",
      hint: "Lege Staff-Accounts für dein Team an.",
      view: "team",
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  if (onboardProgressLabel) onboardProgressLabel.textContent = `${doneCount}/${steps.length}`;
  if (onboardRingValue) {
    const circumference = 157.08;
    const ratio = steps.length ? doneCount / steps.length : 0;
    onboardRingValue.style.strokeDashoffset = String(circumference * (1 - ratio));
  }

  if (doneCount >= steps.length) {
    onboardingCard.classList.add("hidden");
    return;
  }
  onboardingCard.classList.remove("hidden");

  onboardSteps.innerHTML = "";
  steps.forEach((step) => {
    const li = document.createElement("li");
    li.className = `onboard-step${step.done ? " done" : ""}`;
    const mark = document.createElement("span");
    mark.className = "onboard-mark";
    mark.textContent = step.done ? "✓" : "";
    const copy = document.createElement("div");
    copy.className = "onboard-copy";
    const title = document.createElement("p");
    title.className = "onboard-title";
    title.textContent = step.title;
    const hint = document.createElement("p");
    hint.className = "onboard-hint";
    hint.textContent = step.hint;
    copy.append(title, hint);
    li.append(mark, copy);
    if (!step.done) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "btn ghost btn-sm";
      action.textContent = "Los geht's";
      action.addEventListener("click", () => showView(step.view));
      li.append(action);
    }
    onboardSteps.append(li);
  });
}

function defaultCatalog() {
  return {
    categories: [],
    treatments: [],
    memberships: [],
    rewardActions: [],
    rewardRedeems: [],
    homeArticles: [],
  };
}

function normalizeCatalogPayload(payload = {}) {
  const base = defaultCatalog();
  return {
    categories: Array.isArray(payload.categories) ? payload.categories : base.categories,
    treatments: Array.isArray(payload.treatments)
      ? payload.treatments.map((item) => ({
          ...item,
          bodyZones: normalizeBodyZones(item?.bodyZones),
        }))
      : base.treatments,
    memberships: Array.isArray(payload.memberships) ? payload.memberships : base.memberships,
    rewardActions: Array.isArray(payload.rewardActions) ? payload.rewardActions : base.rewardActions,
    rewardRedeems: Array.isArray(payload.rewardRedeems) ? payload.rewardRedeems : base.rewardRedeems,
    homeArticles: Array.isArray(payload.homeArticles) ? payload.homeArticles : base.homeArticles,
  };
}

function centsToEuroInput(cents) {
  const value = Number(cents || 0) / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function euroInputToCents(value) {
  const numeric = parseFloat(String(value ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric * 100)) : 0;
}

function renderCategoryOptions(selectedId, categories) {
  const selected = storeCategoryId(selectedId || "");
  const options = [`<option value=""${selected ? "" : " selected"} disabled>Kategorie wählen…</option>`];
  let matched = false;
  (categories || []).forEach((category) => {
    const stored = storeCategoryId(category.id);
    if (!stored) return;
    const isSelected = stored === selected;
    if (isSelected) matched = true;
    options.push(
      `<option value="${escapeAttr(displayCategoryId(stored))}"${isSelected ? " selected" : ""}>${escapeHtml(category.label || displayCategoryId(stored))}</option>`
    );
  });
  if (selected && !matched) {
    options.push(`<option value="${escapeAttr(displayCategoryId(selected))}" selected>${escapeHtml(displayCategoryId(selected))}</option>`);
  }
  return options.join("");
}

function catalogRemoveButton(listName, index) {
  return `<button class="row-remove cat-remove" type="button" data-remove-list="${listName}" data-index="${index}" aria-label="Entfernen" title="Entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
}

function catalogEmptyState(message) {
  return `<div class="cat-empty">${escapeHtml(message)}</div>`;
}

function renderCatalog() {
  const catalog = normalizeCatalogPayload(state.catalog);
  state.catalog = catalog;

  // Schnell-Editor DOM was removed; keep state.catalog populated (used by the
  // appointment drawer treatment picker) but skip rendering the old form.
  if (!categoriesBody) return;

  categoriesBody.innerHTML = catalog.categories.length
    ? catalog.categories
        .map(
          (item, index) =>
            `<div class="cat-item cat-item-compact" data-list="categories">
              <div class="cat-fields">
                <label class="cat-field cat-field-grow">Bezeichnung<input data-field="label" value="${escapeAttr(item.label)}" placeholder="Gesicht"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(displayCategoryId(item.id))}" placeholder="gesicht" spellcheck="false"></label>
              </div>
              ${catalogRemoveButton("categories", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Kategorien. Lege z. B. Gesicht oder Körper an.");

  treatmentsBody.innerHTML = catalog.treatments.length
    ? catalog.treatments
        .map(
          (item, index) =>
            `<div class="cat-item" data-list="treatments">
              <div class="cat-fields">
                <label class="cat-field span-2">Name<input data-field="name" value="${escapeAttr(item.name)}" placeholder="Basic Glow"></label>
                <label class="cat-field">Kategorie<select data-field="category">${renderCategoryOptions(item.category, catalog.categories)}</select></label>
                <label class="cat-field">Dauer (Min)<input data-field="durationMinutes" type="number" min="0" step="5" inputmode="numeric" value="${escapeAttr(item.durationMinutes)}" placeholder="60"></label>
                <label class="cat-field">Preis (€)<input data-field="priceCents" data-unit="euro" type="number" min="0" step="1" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.priceCents))}" placeholder="110"></label>
                <label class="cat-field">Mitgliedspreis (€)<input data-field="memberPriceCents" data-unit="euro" type="number" min="0" step="1" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.memberPriceCents))}" placeholder="99"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(item.id)}" placeholder="basic-glow" spellcheck="false"></label>
                <label class="cat-field span-full">Beschreibung<input data-field="description" value="${escapeAttr(item.description)}" placeholder="Kurze Beschreibung für die App"></label>
                <div class="cat-field span-full">Body-Zonen<div class="body-zone-picker" data-body-zone-picker>${renderBodyZoneChips(item.bodyZones)}</div></div>
              </div>
              ${catalogRemoveButton("treatments", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Behandlungen. Lege deine erste Behandlung an.");

  membershipsBody.innerHTML = catalog.memberships.length
    ? catalog.memberships
        .map(
          (item, index) =>
            `<div class="cat-item" data-list="memberships">
              <div class="cat-fields">
                <label class="cat-field span-2">Name<input data-field="name" value="${escapeAttr(item.name)}" placeholder="Silber"></label>
                <label class="cat-field">Preis (€ / Monat)<input data-field="priceCents" data-unit="euro" type="number" min="0" step="1" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.priceCents))}" placeholder="79"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(item.id)}" placeholder="silber" spellcheck="false"></label>
                <label class="cat-field span-full">Inkludierte Behandlungen<input data-field="includedTreatmentIds" value="${escapeAttr(joinCommaList(item.includedTreatmentIds))}" placeholder="basic-glow, med-peeling"><span class="cat-mini-hint">Kürzel der Behandlungen, mit Komma getrennt</span></label>
                <label class="cat-field span-full">Vorteile<input data-field="perks" value="${escapeAttr(joinCommaList(item.perks))}" placeholder="1 Gratis-Behandlung, 10 % Rabatt"><span class="cat-mini-hint">Mit Komma getrennt</span></label>
              </div>
              ${catalogRemoveButton("memberships", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Mitgliedschaften.");

  rewardActionsBody.innerHTML = catalog.rewardActions.length
    ? catalog.rewardActions
        .map(
          (item, index) =>
            `<div class="cat-item cat-item-compact" data-list="rewardActions">
              <div class="cat-fields">
                <label class="cat-field cat-field-grow">Aktion<input data-field="label" value="${escapeAttr(item.label)}" placeholder="Freund:in werben"></label>
                <label class="cat-field cat-field-num">Punkte<input data-field="points" type="number" min="0" step="1" inputmode="numeric" value="${escapeAttr(item.points)}" placeholder="150"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(item.id)}" placeholder="referral" spellcheck="false"></label>
              </div>
              ${catalogRemoveButton("rewardActions", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Reward-Aktionen.");

  rewardRedeemsBody.innerHTML = catalog.rewardRedeems.length
    ? catalog.rewardRedeems
        .map(
          (item, index) =>
            `<div class="cat-item cat-item-compact" data-list="rewardRedeems">
              <div class="cat-fields">
                <label class="cat-field cat-field-grow">Bezeichnung<input data-field="label" value="${escapeAttr(item.label)}" placeholder="15 € Guthaben"></label>
                <label class="cat-field cat-field-num">Benötigte Punkte<input data-field="requiredPoints" type="number" min="0" step="1" inputmode="numeric" value="${escapeAttr(item.requiredPoints)}" placeholder="250"></label>
                <label class="cat-field cat-field-num">Wert (€)<input data-field="valueCents" data-unit="euro" type="number" min="0" step="1" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.valueCents))}" placeholder="15"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(item.id)}" placeholder="r15" spellcheck="false"></label>
              </div>
              ${catalogRemoveButton("rewardRedeems", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Reward-Einlösungen.");

  homeArticlesBody.innerHTML = catalog.homeArticles.length
    ? catalog.homeArticles
        .map(
          (item, index) =>
            `<div class="cat-item" data-list="homeArticles">
              <div class="cat-fields">
                <label class="cat-field span-2">Titel<input data-field="title" value="${escapeAttr(item.title)}" placeholder="Tipps nach der Behandlung"></label>
                <label class="cat-field">Tag<input data-field="tag" value="${escapeAttr(item.tag)}" placeholder="Education"></label>
                <label class="cat-field cat-field-code">Kürzel<input data-field="id" value="${escapeAttr(item.id)}" placeholder="art-1" spellcheck="false"></label>
                <label class="cat-field span-full">Text<textarea data-field="body" rows="2" placeholder="Kurztext für die App">${escapeHtml(item.body || "")}</textarea></label>
              </div>
              ${catalogRemoveButton("homeArticles", index)}
            </div>`
        )
        .join("")
    : catalogEmptyState("Noch keine Home-Artikel.");

  setCatalogDisabled(!state.isOwner);
}

function syncCatalogStateFromDom() {
  const readVal = (row, field) => row.querySelector(`[data-field="${field}"]`)?.value.trim() || "";
  const readEuroCents = (row, field) => euroInputToCents(row.querySelector(`[data-field="${field}"]`)?.value);
  const readInt = (row, field) => toInt(row.querySelector(`[data-field="${field}"]`)?.value, 0);

  const categories = Array.from(categoriesBody.querySelectorAll(".cat-item"))
    .map((row) => ({ id: storeCategoryId(readVal(row, "id")), label: readVal(row, "label") }))
    .filter((item) => item.id && item.label);

  const treatments = Array.from(treatmentsBody.querySelectorAll(".cat-item"))
    .map((row) => ({
      id: readVal(row, "id"),
      name: readVal(row, "name"),
      category: storeCategoryId(readVal(row, "category")),
      priceCents: readEuroCents(row, "priceCents"),
      memberPriceCents: readEuroCents(row, "memberPriceCents"),
      durationMinutes: readInt(row, "durationMinutes"),
      description: readVal(row, "description"),
      bodyZones: Array.from(row.querySelectorAll("input[data-body-zone-option]:checked"))
        .map((input) => normalizeBodyZoneId(input.value))
        .filter(Boolean),
    }))
    .filter((item) => item.id && item.name && item.category);

  const memberships = Array.from(membershipsBody.querySelectorAll(".cat-item"))
    .map((row) => ({
      id: readVal(row, "id"),
      name: readVal(row, "name"),
      priceCents: readEuroCents(row, "priceCents"),
      includedTreatmentIds: splitCommaList(row.querySelector('[data-field="includedTreatmentIds"]')?.value),
      perks: splitCommaList(row.querySelector('[data-field="perks"]')?.value),
    }))
    .filter((item) => item.id && item.name);

  const rewardActions = Array.from(rewardActionsBody.querySelectorAll(".cat-item"))
    .map((row) => ({ id: readVal(row, "id"), label: readVal(row, "label"), points: readInt(row, "points") }))
    .filter((item) => item.id && item.label);

  const rewardRedeems = Array.from(rewardRedeemsBody.querySelectorAll(".cat-item"))
    .map((row) => ({
      id: readVal(row, "id"),
      label: readVal(row, "label"),
      requiredPoints: readInt(row, "requiredPoints"),
      valueCents: readEuroCents(row, "valueCents"),
    }))
    .filter((item) => item.id && item.label);

  const homeArticles = Array.from(homeArticlesBody.querySelectorAll(".cat-item"))
    .map((row) => ({
      id: readVal(row, "id"),
      tag: readVal(row, "tag"),
      title: readVal(row, "title"),
      body: readVal(row, "body"),
    }))
    .filter((item) => item.id && item.title);

  state.catalog = { categories, treatments, memberships, rewardActions, rewardRedeems, homeArticles };
}

const MEMBER_ROLE_META = {
  owner: { label: "Inhaber", cls: "ok" },
  staff: { label: "Mitarbeiter", cls: "muted" },
};

function memberInitials(member) {
  const source = String(member?.fullName || member?.email || "Team").trim();
  const parts = source.includes("@")
    ? [source.split("@")[0]]
    : source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return (initials || "T").toUpperCase();
}

function memberAvatarHtml(member) {
  const imageUrl = String(member?.profileImageUrl || "").trim();
  if (imageUrl) {
    return `<span class="team-member-avatar has-photo" aria-hidden="true"><img src="${escapeAttr(imageUrl)}" alt=""></span>`;
  }
  return `<span class="team-member-avatar" aria-hidden="true">${escapeHtml(memberInitials(member))}</span>`;
}

function memberEditIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
}

function memberTrashIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>';
}

function memberRestoreIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/></svg>';
}

function renderMembers(members) {
  state.members = Array.isArray(members) ? members : [];
  if (!membersBody) {
    renderMetricsDashboard();
    return;
  }
  membersBody.innerHTML = "";
  if (!members.length) {
    membersBody.innerHTML = '<div class="team-empty" role="listitem">Noch keine Team-Mitglieder.</div>';
    renderMetricsDashboard();
    return;
  }

  const rows = members
    .map((member) => {
      const roleKey = String(member.role || "").toLowerCase();
      const role = MEMBER_ROLE_META[roleKey] || {
        label: member.role || "—",
        cls: "muted",
      };
      const isActive = member.active !== false;
      const isStaff = roleKey === "staff";
      const isOwner = roleKey === "owner";
      const jobTitle = String(member.jobTitle || "").trim();
      const rolePill = `<span class="status-pill ${role.cls}">${escapeHtml(role.label)}</span>`;
      const statusPill = isActive
        ? '<span class="status-pill ok">Aktiv</span>'
        : '<span class="status-pill danger">Deaktiviert</span>';
      let action = "";
      if (state.isOwner && isStaff) {
        const next = isActive ? "false" : "true";
        const label = isActive ? "Deaktivieren" : "Reaktivieren";
        const memberLabel = escapeAttr(member.fullName || member.email || "Mitglied");
        const btnCls = isActive ? "member-action-btn member-action-delete" : "member-action-btn member-action-activate";
        const actionIcon = isActive ? memberTrashIcon() : memberRestoreIcon();
        action = `<button type="button" class="member-edit-btn" data-member-edit data-member-id="${member.id}" aria-label="Profil von ${memberLabel} bearbeiten" title="Profil bearbeiten">${memberEditIcon()}</button><button type="button" class="${btnCls}" data-member-action data-member-id="${member.id}" data-next-active="${next}" aria-label="${label}: ${memberLabel}" title="${label}">${actionIcon}</button>`;
      } else if (isOwner) {
        action = '<span class="team-owner-lock">Geschützt</span>';
      }
      return `<div class="team-member-row${isActive ? "" : " is-inactive"}${isOwner ? " is-owner" : ""}" role="listitem">
        ${memberAvatarHtml(member)}
        <span class="team-member-main">
          <span class="team-member-primary">
            <strong>${escapeHtml(member.fullName || "—")}</strong>
            <span class="team-member-pills">${rolePill}${statusPill}</span>
          </span>
          <span class="team-member-meta">
            ${jobTitle ? `<span>${escapeHtml(jobTitle)}</span>` : ""}
            <span>${escapeHtml(member.email || "—")}</span>
          </span>
        </span>
        <span class="team-member-actions">${action}</span>
      </div>`;
    })
    .join("");
  membersBody.innerHTML = rows;
  renderMetricsDashboard();
}

function closeMemberConfirm() {
  if (!memberConfirm) return;
  memberConfirm.classList.remove("open");
  memberConfirm.setAttribute("aria-hidden", "true");
  state.pendingMemberAction = null;
  window.setTimeout(() => memberConfirm.classList.add("hidden"), 180);
}

function openMemberDeactivateConfirm(member) {
  if (!memberConfirm || !member?.id) return;
  const displayName = String(member.fullName || member.email || "dieses Teammitglied").trim();
  state.pendingMemberAction = { memberId: member.id, nextActive: false };
  if (memberConfirmTitle) memberConfirmTitle.textContent = "Mitglied deaktivieren?";
  if (memberConfirmText) {
    memberConfirmText.textContent = `Möchtest du ${displayName} wirklich deaktivieren? Der Dashboard-Zugriff wird gesperrt, das Profil bleibt für eine spätere Reaktivierung erhalten.`;
  }
  if (memberConfirmAction) {
    memberConfirmAction.disabled = false;
    memberConfirmAction.textContent = "Ja, bitte deaktivieren";
  }
  memberConfirm.classList.remove("hidden");
  memberConfirm.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => memberConfirm.classList.add("open"));
  window.setTimeout(() => memberConfirmAction?.focus(), 80);
}

async function performMemberActiveUpdate(memberId, nextActive, control = null) {
  if (!memberId) return;
  if (control) {
    control.disabled = true;
    control.setAttribute("aria-busy", "true");
  }
  try {
    await apiRequest(`/clinic/members/${memberId}`, { method: "PATCH", body: { active: nextActive } });
    await Promise.all([loadMembers(), loadAuditLogs()]);
    showToast(nextActive ? "Mitglied aktiviert" : "Mitglied deaktiviert");
  } catch (error) {
    showToast(error.message || "Aktion fehlgeschlagen.");
    throw error;
  } finally {
    if (control) {
      control.disabled = false;
      control.removeAttribute("aria-busy");
    }
  }
}

async function confirmPendingMemberAction() {
  const pending = state.pendingMemberAction;
  if (!pending) return;
  if (memberConfirmAction) {
    memberConfirmAction.disabled = true;
    memberConfirmAction.textContent = pending.nextActive ? "Aktiviere ..." : "Deaktiviere ...";
  }
  try {
    await performMemberActiveUpdate(pending.memberId, pending.nextActive);
    closeMemberConfirm();
  } catch {
    if (memberConfirmAction) {
      memberConfirmAction.disabled = false;
      memberConfirmAction.textContent = pending.nextActive ? "Ja, bitte aktivieren" : "Ja, bitte deaktivieren";
    }
  }
}

async function handleMemberAction(target) {
  const editButton = target.closest("[data-member-edit]");
  if (editButton) {
    const memberId = Number(editButton.getAttribute("data-member-id") || 0);
    const member = state.members.find((item) => Number(item.id) === memberId);
    if (member) openMemberDrawer(member);
    return;
  }
  const button = target.closest("[data-member-action]");
  if (!button) return;
  const memberId = button.getAttribute("data-member-id");
  const nextActive = button.getAttribute("data-next-active") === "true";
  if (!memberId) return;
  if (!nextActive) {
    const member = state.members.find((item) => Number(item.id) === Number(memberId));
    openMemberDeactivateConfirm(member || { id: memberId, fullName: "dieses Teammitglied" });
    return;
  }
  await performMemberActiveUpdate(memberId, nextActive, button);
}

// ---------- Check-in (QR-Scan + Code) ----------
const checkinVideo = document.getElementById("checkinVideo");
const checkinScanner = document.getElementById("checkinScanner");
const checkinScanHint = document.getElementById("checkinScanHint");
const checkinCamBtn = document.getElementById("checkinCamBtn");
const checkinCodeInput = document.getElementById("checkinCodeInput");
const checkinCodeBtn = document.getElementById("checkinCodeBtn");
const checkinFeedback = document.getElementById("checkinFeedback");
const checkinTodayBody = document.getElementById("checkinTodayBody");
const checkinTodayCount = document.getElementById("checkinTodayCount");
const checkinRefreshBtn = document.getElementById("checkinRefreshBtn");

const checkin = { stream: null, detector: null, scanTimer: null, pollTimer: null, busy: false, lastValue: "", lastValueAt: 0 };

function setCheckinFeedback(message, kind = "") {
  if (!checkinFeedback) return;
  checkinFeedback.textContent = message || "";
  checkinFeedback.className = `checkin-feedback${kind ? " " + kind : ""}`;
}

function formatCheckinTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(d);
}

function renderCheckinToday(visits) {
  if (!checkinTodayBody) return;
  const list = Array.isArray(visits) ? visits : [];
  if (checkinTodayCount) checkinTodayCount.textContent = `${list.length} heute`;
  if (!list.length) {
    checkinTodayBody.innerHTML = '<tr><td colspan="3" class="checkin-empty">Noch niemand eingecheckt.</td></tr>';
    return;
  }
  checkinTodayBody.innerHTML = list
    .map((v) => `<tr>
      <td>${escapeHtml(v.patientName || "Gast")}</td>
      <td>${escapeHtml(v.patientPhone || "—")}</td>
      <td>${escapeHtml(formatCheckinTime(v.checkedInAt))}</td>
    </tr>`)
    .join("");
}

async function loadCheckinToday() {
  try {
    const res = await apiRequest("/clinic/checkin/today");
    renderCheckinToday(res.visits || []);
  } catch (_) {
    // keep the last list on transient errors
  }
}

async function redeemCheckin(payload, { fromCamera = false } = {}) {
  if (checkin.busy) return;
  checkin.busy = true;
  try {
    const res = await apiRequest("/clinic/checkin/redeem", { method: "POST", body: payload });
    const name = (res.visit && res.visit.patientName) || "Gast";
    setCheckinFeedback(`✓ ${name} eingecheckt`, "ok");
    try { if (navigator.vibrate) navigator.vibrate(14); } catch (_) {}
    await loadCheckinToday();
  } catch (error) {
    setCheckinFeedback(error.message || "Check-in fehlgeschlagen.", "err");
  } finally {
    // cooldown so a QR lingering in view doesn't fire repeatedly
    window.setTimeout(() => { checkin.busy = false; }, fromCamera ? 2500 : 600);
  }
}

function submitCheckinCode() {
  const code = String(checkinCodeInput ? checkinCodeInput.value : "").replace(/\D/g, "").slice(0, 6);
  if (code.length !== 6) {
    setCheckinFeedback("Bitte einen 6-stelligen Code eingeben.", "err");
    return;
  }
  redeemCheckin({ code }).then(() => { if (checkinCodeInput) checkinCodeInput.value = ""; });
}

async function scanCheckinFrame() {
  if (!checkin.detector || !checkinVideo || checkin.busy) return;
  try {
    const codes = await checkin.detector.detect(checkinVideo);
    if (codes && codes.length) {
      const value = String(codes[0].rawValue || "").trim();
      const now = Date.now();
      if (value && !(value === checkin.lastValue && now - checkin.lastValueAt < 3000)) {
        checkin.lastValue = value;
        checkin.lastValueAt = now;
        redeemCheckin({ token: value }, { fromCamera: true });
      }
    }
  } catch (_) {
    // detect() can throw transiently between frames; ignore
  }
}

async function startCheckinCamera() {
  if (checkin.stream) { stopCheckinCamera(); return; }
  if (!("BarcodeDetector" in window)) {
    setCheckinFeedback("QR-Scan wird von diesem Browser nicht unterstützt — bitte den Code eingeben.", "err");
    return;
  }
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    setCheckinFeedback("Kein Kamerazugriff möglich — bitte den Code eingeben.", "err");
    return;
  }
  try {
    checkin.detector = checkin.detector || new window.BarcodeDetector({ formats: ["qr_code"] });
    checkin.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (checkinVideo) {
      checkinVideo.srcObject = checkin.stream;
      await checkinVideo.play().catch(() => {});
    }
    if (checkinScanner) checkinScanner.classList.add("is-live");
    if (checkinScanHint) checkinScanHint.textContent = "QR-Code in den Rahmen halten …";
    if (checkinCamBtn) checkinCamBtn.textContent = "Kamera stoppen";
    setCheckinFeedback("");
    checkin.scanTimer = window.setInterval(scanCheckinFrame, 350);
  } catch (_) {
    setCheckinFeedback("Kamerazugriff verweigert — bitte den Code eingeben.", "err");
    stopCheckinCamera();
  }
}

function stopCheckinCamera() {
  if (checkin.scanTimer) { window.clearInterval(checkin.scanTimer); checkin.scanTimer = null; }
  if (checkin.stream) {
    checkin.stream.getTracks().forEach((t) => t.stop());
    checkin.stream = null;
  }
  if (checkinVideo) checkinVideo.srcObject = null;
  if (checkinScanner) checkinScanner.classList.remove("is-live");
  if (checkinCamBtn) checkinCamBtn.textContent = "Kamera starten";
  if (checkinScanHint) checkinScanHint.textContent = "Tippe auf „Kamera starten\", um den QR-Code zu scannen.";
}

function onEnterCheckin() {
  loadCheckinToday();
  if (checkin.pollTimer) window.clearInterval(checkin.pollTimer);
  checkin.pollTimer = window.setInterval(loadCheckinToday, 12000);
}

function leaveCheckin() {
  stopCheckinCamera();
  if (checkin.pollTimer) { window.clearInterval(checkin.pollTimer); checkin.pollTimer = null; }
}

const SUBSCRIPTION_STATUS_LABELS = {
  active: "Aktiv",
  trialing: "Testphase",
  past_due: "Überfällig",
  canceled: "Gekündigt",
  cancelled: "Gekündigt",
  unpaid: "Unbezahlt",
  incomplete: "Unvollständig",
  incomplete_expired: "Abgelaufen",
  paused: "Pausiert",
  inactive: "Inaktiv",
};

function subscriptionStatusLabel(status) {
  const key = String(status || "").toLowerCase();
  if (SUBSCRIPTION_STATUS_LABELS[key]) return SUBSCRIPTION_STATUS_LABELS[key];
  if (!key) return "—";
  const words = key.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function renderBillingStatus(subscription, canUsePlatform) {
  billingStatus.innerHTML = [
    ["Plan", escapeHtml(subscription.planName || "-")],
    ["Status", escapeHtml(subscriptionStatusLabel(subscription.status))],
    ["Monatlicher Betrag", escapeHtml(formatEuro(subscription.amountCents, subscription.currency))],
    ["Nächstes Periodenende", escapeHtml(formatDate(subscription.currentPeriodEnd))],
    ["Stripe Subscription ID", escapeHtml(subscription.stripeSubscriptionId || "-")],
  ]
    .map(
      ([key, value]) =>
        `<div class="kv-item"><span>${key}</span><strong>${value}</strong></div>`
    )
    .join("");
}

function renderHistory(rows) {
  historyBody.innerHTML = "";
  if (!rows.length) {
    historyBody.innerHTML = '<tr><td colspan="4">Noch keine Einträge vorhanden.</td></tr>';
    return;
  }

  historyBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${escapeHtml(row.planName || "-")}</td>
          <td>${escapeHtml(subscriptionStatusLabel(row.status))}</td>
          <td>${escapeHtml(formatEuro(row.amountCents, row.currency))}</td>
          <td>${escapeHtml(formatDate(row.updatedAt || row.createdAt))}</td>
        </tr>`
    )
    .join("");
}

function renderMetricsCards(summary = {}) {
  state.analytics.summary = summary || {};
  renderMetricsDashboard();
}

function renderTopTreatments(rows = []) {
  state.analytics.topTreatments = Array.isArray(rows) ? rows : [];
  renderMetricsDashboard();
}

const CAMPAIGN_TRIGGER_LABELS = {
  broadcast: "Rundnachricht (an alle)",
  inactive_30d: "Inaktiv seit 30 Tagen",
  abandoned_cart_24h: "Warenkorb abgebrochen (24 h)",
  membership_past_due: "Mitgliedschaft überfällig",
  membership_canceled_winback: "Gekündigt – Rückgewinnung",
};
const CAMPAIGN_CHANNEL_LABELS = { in_app: "In-App", push: "Push", email: "E-Mail", sms: "SMS" };
const CAMPAIGN_STATUS_META = {
  draft: { label: "Entwurf", cls: "muted" },
  active: { label: "Aktiv", cls: "ok" },
  paused: { label: "Pausiert", cls: "warn" },
};

function renderCampaigns(rows = []) {
  campaignsBody.innerHTML = "";
  if (!rows.length) {
    campaignsBody.innerHTML = '<tr><td colspan="6">Noch keine Kampagnen vorhanden.</td></tr>';
    return;
  }

  campaignsBody.innerHTML = rows
    .map((row) => {
      const trigger = CAMPAIGN_TRIGGER_LABELS[row.triggerType] || row.triggerType || "—";
      const status = CAMPAIGN_STATUS_META[row.status] || { label: row.status || "—", cls: "muted" };
      return `<tr>
          <td><strong>${escapeHtml(row.name || "—")}</strong></td>
          <td>${escapeHtml(trigger)}</td>
          <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
          <td>${row.totalRuns || 0}</td>
          <td>${row.totalAudience || 0}</td>
          <td class="campaign-actions">${
            state.isOwner
              ? `
                <button class="btn ghost btn-sm" type="button" data-run-campaign="${row.id}">Ausführen</button>
                <button class="btn ghost btn-sm" type="button" data-toggle-campaign="${row.id}" data-next-status="${row.status === "paused" ? "active" : "paused"}">
                  ${row.status === "paused" ? "Aktivieren" : "Pausieren"}
                </button>
              `
              : "-"
          }</td>
        </tr>`;
    })
    .join("");
}

function renderAuditLogs(rows = []) {
  state.auditLogs = Array.isArray(rows) ? rows : [];
  if (!auditLogsBody) {
    renderMetricsDashboard();
    return;
  }
  auditLogsBody.innerHTML = "";
  if (!rows.length) {
    auditLogsBody.innerHTML = '<tr><td colspan="4">Noch keine Audit-Einträge vorhanden.</td></tr>';
    renderMetricsDashboard();
    return;
  }

  auditLogsBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${escapeHtml(formatDate(row.createdAt))}</td>
          <td>${escapeHtml(actionToFeedText(row.action))}</td>
          <td>${escapeHtml(row.entityType || "-")}${row.entityId ? ` • ${escapeHtml(String(row.entityId))}` : ""}</td>
          <td>${escapeHtml(row.actorName || row.actorEmail || "System")}</td>
        </tr>`
    )
    .join("");
  renderMetricsDashboard();
}

async function loadSettings() {
  const response = await apiRequest("/clinic/settings");
  fillSettingsForm(response.settings || {});
}

async function loadMembers() {
  const response = await apiRequest("/clinic/members");
  renderMembers(response.members || []);
}

async function loadBillingStatus() {
  const response = await apiRequest("/billing/status");
  renderBillingStatus(response.subscription || {}, response.canUsePlatform);
}

async function loadBillingHistory() {
  if (!state.isOwner) {
    renderHistory([]);
    return;
  }

  try {
    const response = await apiRequest("/billing/history");
    renderHistory(response.subscriptions || []);
  } catch (error) {
    renderHistory([]);
    showToast(error.message);
  }
}

async function loadAnalyticsSummary() {
  const params = new URLSearchParams();
  if (hasCustomMetricsRange()) {
    params.set("from", state.metricsFromDate);
    params.set("to", state.metricsToDate);
  } else {
    params.set("days", state.metricsDays);
  }
  params.set("compare", state.metricsCompareMode);

  const response = await apiRequest(`/analytics/summary?${params.toString()}`);
  state.analytics.summary = response.summary || {};
  state.analytics.timeseries = Array.isArray(response.timeseries) ? response.timeseries : [];
  state.analytics.topTreatments = Array.isArray(response.topTreatments) ? response.topTreatments : [];
  state.analytics.revenueSources = Array.isArray(response.revenueSources) ? response.revenueSources : [];
  state.analytics.topTeam = Array.isArray(response.topTeam) ? response.topTeam : [];
  state.analytics.comparison = response.comparison && typeof response.comparison === "object" ? response.comparison : {};
  state.analytics.window = response.window && typeof response.window === "object" ? response.window : {};
  state.analytics.period = response.period && typeof response.period === "object" ? response.period : {};
  if (state.analytics.period.isCustomRange) {
    if (isValidDateInput(state.analytics.period.from)) {
      state.metricsFromDate = state.analytics.period.from;
    }
    if (isValidDateInput(state.analytics.period.to)) {
      state.metricsToDate = state.analytics.period.to;
    }
    syncMetricsDateInputs();
  }
  state.membershipSummary = response.memberships || {};
  renderMetricsDashboard();
}

const PATIENT_STATUS = {
  active: { label: "Aktiv", cls: "ok" },
  trialing: { label: "Test", cls: "ok" },
  past_due: { label: "Zahlung offen", cls: "warn" },
  paused: { label: "Pausiert", cls: "muted" },
  canceled: { label: "Gekündigt", cls: "danger" },
  inactive: { label: "Inaktiv", cls: "muted" },
};

function renderPatientStats() {
  if (!patientStats) return;
  const summary = state.membershipSummary || {};
  const chips = [
    { label: "Gesamt", value: String(Number(summary.total || 0)) },
    { label: "Aktiv", value: String(Number(summary.active || 0)), cls: "ok" },
    { label: "Zahlung offen", value: String(Number(summary.pastDue || 0)), cls: "warn" },
    { label: "Pausiert", value: String(Number(summary.paused || 0)), cls: "muted" },
    { label: "Gekündigt", value: String(Number(summary.canceled || 0)), cls: "danger" },
    { label: "MRR", value: formatEuro(Number(summary.mrrCents || 0)), cls: "brand" },
  ];
  patientStats.innerHTML = chips
    .map(
      (chip) =>
        `<div class="pstat ${chip.cls || ""}"><span class="pstat-value">${escapeHtml(chip.value)}</span><span class="pstat-label">${escapeHtml(chip.label)}</span></div>`
    )
    .join("");
}

function renderPatients() {
  renderPatientStats();
  if (!patientsBody) return;
  const term = String(patientSearch?.value || "").trim().toLowerCase();
  const rows = (state.patientMemberships || []).filter((row) => {
    if (!term) return true;
    return [row.patientName, row.patientEmail, row.membershipName].some((value) =>
      String(value || "").toLowerCase().includes(term)
    );
  });

  if (!rows.length) {
    patientsBody.innerHTML = `<tr><td colspan="5">${term ? "Keine Treffer." : "Noch keine Patienten."}</td></tr>`;
    return;
  }

  patientsBody.innerHTML = rows
    .map((row) => {
      const status = PATIENT_STATUS[String(row.status || "inactive").toLowerCase()] || PATIENT_STATUS.inactive;
      const name = row.patientName || "—";
      const email = row.patientEmail || "";
      const plan = row.membershipName || "—";
      const amount = formatEuro(Number(row.monthlyAmountCents || 0));
      const next = row.nextChargeAt ? formatDateOnly(row.nextChargeAt) : "—";
      return `<tr>
        <td><strong>${escapeHtml(name)}</strong>${email ? `<small>${escapeHtml(email)}</small>` : ""}</td>
        <td>${escapeHtml(plan)}</td>
        <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
        <td>${escapeHtml(amount)}</td>
        <td>${escapeHtml(next)}</td>
      </tr>`;
    })
    .join("");
}

async function loadPatientMemberships() {
  const response = await apiRequest("/clinic/patient-memberships?limit=200");
  state.patientMemberships = Array.isArray(response.memberships) ? response.memberships : [];
  if (response.summary && typeof response.summary === "object") {
    state.membershipSummary = response.summary;
  }
  renderMetricsDashboard();
  renderPatients();
}

const TXN_STATUS = {
  paid: { label: "Bezahlt", cls: "ok" },
  open: { label: "Offen", cls: "warn" },
  failed: { label: "Fehlgeschlagen", cls: "danger" },
  refunded: { label: "Erstattet", cls: "muted" },
  canceled: { label: "Storniert", cls: "muted" },
};

const TXN_FILTERS = new Set(["all", "paid", "open", "failed", "refunded", "canceled", "mitgliedschaft", "produkt", "billing", "zahlung"]);

function normalizeTxnFilter(value) {
  const key = String(value || "all").trim().toLowerCase();
  return TXN_FILTERS.has(key) ? key : "all";
}

function txnStatusMeta(status) {
  return TXN_STATUS[String(status || "").toLowerCase()] || TXN_STATUS.open;
}

function txnPaymentMethodLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  const labels = {
    card: "Karte",
    cash: "Bar",
    stripe: "Stripe",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    klarna: "Klarna",
    sepa_debit: "SEPA",
  };
  return labels[key] || String(value || "—");
}

function txnInitials(txn) {
  const source = String(txn?.customerName || txn?.customerEmail || "Kunde").trim();
  const parts = source.includes("@")
    ? [source.split("@")[0]]
    : source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join("");
  return (initials || "K").toUpperCase();
}

function txnMatchesFilter(txn, filter) {
  const key = normalizeTxnFilter(filter);
  if (key === "all") return true;
  if (["paid", "open", "failed", "refunded", "canceled"].includes(key)) {
    return String(txn.status || "").toLowerCase() === key;
  }
  return String(txn.type || "").toLowerCase() === key;
}

function txnSearchText(txn) {
  const items = Array.isArray(txn.items) ? txn.items.join(" ") : "";
  return [
    txn.customerName,
    txn.customerEmail,
    txn.typeLabel,
    txn.label,
    txn.source,
    txn.paymentMethod,
    txn.reference,
    items,
  ].join(" ").toLowerCase();
}

function visibleTransactions() {
  const term = String(state.transactionSearch || "").trim().toLowerCase();
  return (state.transactions || []).filter((txn) => {
    if (!txnMatchesFilter(txn, state.transactionFilter)) return false;
    if (!term) return true;
    return txnSearchText(txn).includes(term);
  });
}

function renderTxnStats() {
  if (!txnStats) return;
  const rows = state.transactions || [];
  const summary = state.transactionSummary || {};
  const countByType = (type) => rows.filter((txn) => String(txn.type || "") === type).length;
  const stats = [
    { label: "Transaktionen", value: String(Number(summary.total || rows.length)), filter: "all" },
    { label: "Bezahlt", value: formatEuro(Number(summary.paidCents || 0)), cls: "ok", filter: "paid" },
    { label: `Offen · ${Number(summary.openCount || 0)}`, value: formatEuro(Number(summary.openCents || 0)), cls: "warn", filter: "open" },
    { label: `Fehlgeschlagen · ${Number(summary.failedCount || 0)}`, value: formatEuro(Number(summary.failedCents || 0)), cls: "danger", filter: "failed" },
    { label: "App-Käufe", value: String(Number(summary.appCount || countByType("produkt"))), cls: "brand", filter: "produkt" },
    { label: "Memberships", value: String(Number(summary.membershipCount || countByType("mitgliedschaft"))), filter: "mitgliedschaft" },
  ];
  txnStats.innerHTML = stats
    .map(
      (chip) =>
        `<button class="pstat ${chip.cls || ""} is-clickable" type="button" data-route-view="zahlungen" data-route-filter="${escapeAttr(chip.filter)}"><span class="pstat-value">${escapeHtml(chip.value)}</span><span class="pstat-label">${escapeHtml(chip.label)}</span></button>`
    )
    .join("");
}

function renderTxnFilterState() {
  if (!txnFilters) return;
  txnFilters.querySelectorAll("button[data-txn-filter]").forEach((button) => {
    button.classList.toggle("active", normalizeTxnFilter(button.getAttribute("data-txn-filter")) === state.transactionFilter);
  });
}

function renderTransactions() {
  renderTxnStats();
  renderTxnFilterState();
  if (!txnBody) return;

  const rows = visibleTransactions();
  if (!rows.length) {
    const empty = state.transactions.length ? "Keine Treffer für diesen Filter." : "Noch keine Transaktionen.";
    txnBody.innerHTML = `<tr><td colspan="7" class="txn-empty">${escapeHtml(empty)}</td></tr>`;
    return;
  }

  txnBody.innerHTML = rows
    .map((txn) => {
      const status = txnStatusMeta(txn.status);
      const currency = txn.currency || "eur";
      const customerName = txn.customerName || "Gast";
      const email = txn.customerEmail || "";
      const reference = txn.reference ? `Ref. ${txn.reference}` : "";
      const source = txn.source || "—";
      const method = txnPaymentMethodLabel(txn.paymentMethod);
      return `<tr class="txn-row" data-txn-id="${escapeAttr(txn.id)}" tabindex="0">
        <td><strong>${escapeHtml(formatDateOnly(txn.date))}</strong>${reference ? `<small>${escapeHtml(reference)}</small>` : ""}</td>
        <td>
          <div class="txn-person">
            <span class="txn-avatar" aria-hidden="true">${escapeHtml(txnInitials(txn))}</span>
            <span class="txn-person-copy"><strong>${escapeHtml(customerName)}</strong>${email ? `<small>${escapeHtml(email)}</small>` : ""}</span>
          </div>
        </td>
        <td><span class="txn-type-pill">${escapeHtml(txn.typeLabel || txn.type || "Zahlung")}</span></td>
        <td><strong>${escapeHtml(txn.label || "—")}</strong></td>
        <td class="num"><strong>${escapeHtml(formatEuro(Number(txn.amountCents || 0), currency))}</strong></td>
        <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
        <td><span class="txn-source">${escapeHtml(source)}</span><small>${escapeHtml(method)}</small></td>
      </tr>`;
    })
    .join("");
}

function setTxnFilter(filter) {
  state.transactionFilter = normalizeTxnFilter(filter);
  renderTransactions();
}

async function loadTransactions() {
  if (txnBody && !state.transactions.length) {
    txnBody.innerHTML = `<tr><td colspan="7" class="txn-empty">Transaktionen werden geladen ...</td></tr>`;
  }
  const response = await apiRequest("/clinic/transactions");
  state.transactions = Array.isArray(response.transactions) ? response.transactions : [];
  state.transactionSummary = response.summary && typeof response.summary === "object" ? response.summary : {};
  renderTransactions();
}

function closeTxnDrawer() {
  if (!txnDrawer) return;
  txnDrawer.classList.remove("open");
  txnDrawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => txnDrawer.classList.add("hidden"), 220);
}

function txnDetailRow(label, value) {
  return `<div class="txn-detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>`;
}

function openTxnDrawer(txnId) {
  const txn = (state.transactions || []).find((item) => String(item.id) === String(txnId));
  if (!txn || !txnDrawer || !txnDrawerBody) return;
  const status = txnStatusMeta(txn.status);
  const currency = txn.currency || "eur";
  if (txnDrawerTitle) txnDrawerTitle.textContent = txn.customerName || "Transaktion";
  if (txnDrawerKind) txnDrawerKind.textContent = `${txn.typeLabel || "Zahlung"} · ${status.label}`;

  const items = Array.isArray(txn.items) ? txn.items.filter(Boolean) : [];
  const itemHtml = items.length
    ? `<div class="txn-item-list">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
    : "";

  txnDrawerBody.innerHTML = `
    <div class="txn-drawer-summary">
      <span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span>
      <strong>${escapeHtml(formatEuro(Number(txn.amountCents || 0), currency))}</strong>
      <p>${escapeHtml(txn.label || txn.typeLabel || "Zahlung")}</p>
    </div>
    <div class="txn-detail-list">
      ${txnDetailRow("Datum", formatDate(txn.date))}
      ${txnDetailRow("Kund:in", txn.customerName || "Gast")}
      ${txnDetailRow("E-Mail", txn.customerEmail || "—")}
      ${txnDetailRow("Typ", txn.typeLabel || txn.type || "Zahlung")}
      ${txnDetailRow("Quelle", txn.source || "—")}
      ${txnDetailRow("Zahlart", txnPaymentMethodLabel(txn.paymentMethod))}
      ${txnDetailRow("Referenz", txn.reference || "—")}
      ${txn.membershipStatus ? txnDetailRow("Membership-Status", txn.membershipStatus) : ""}
    </div>
    ${itemHtml}
  `;

  txnDrawer.classList.remove("hidden");
  txnDrawer.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => txnDrawer.classList.add("open"));
  haptics("light");
}

function exportTransactionsCsv() {
  const rows = visibleTransactions();
  if (!rows.length) {
    showToast("Keine Transaktionen für den Export.");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const clinicSlug = String(state.user?.clinicName || "curabo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "curabo";
  downloadCsv(`${clinicSlug}-zahlungen-${date}.csv`, ["Datum", "Kund:in", "E-Mail", "Typ", "Beschreibung", "Betrag (Cent)", "Währung", "Status", "Quelle", "Zahlart", "Referenz"], rows.map((txn) => [
    txn.date || "",
    txn.customerName || "",
    txn.customerEmail || "",
    txn.typeLabel || txn.type || "",
    txn.label || "",
    Number(txn.amountCents || 0),
    txn.currency || "eur",
    txnStatusMeta(txn.status).label,
    txn.source || "",
    txnPaymentMethodLabel(txn.paymentMethod),
    txn.reference || "",
  ]));
  showToast("CSV exportiert");
}

function navigateDashboardRoute(targetView, filter = "") {
  const target = VIEW_META[targetView] ? targetView : "overview";
  if (target === "zahlungen") {
    pendingTxnFilter = normalizeTxnFilter(filter || "all");
  }
  showView(target);
}

const APPOINTMENT_STATUS = {
  confirmed: { label: "Bestätigt", cls: "ok" },
  pending_confirmation: { label: "Offen", cls: "warn" },
  reschedule_requested: { label: "Umbuchung", cls: "warn" },
  rescheduled: { label: "Umgebucht", cls: "ok" },
  completed: { label: "Abgeschlossen", cls: "muted" },
  canceled: { label: "Storniert", cls: "danger" },
};

function renderAppointmentStats() {
  if (!appointmentStats) return;
  const summary = state.appointmentSummary || {};
  const chips = [
    { label: "Gesamt", value: String(Number(summary.total || 0)) },
    { label: "Anstehend", value: String(Number(summary.upcoming || 0)), cls: "brand" },
    { label: "Heute", value: String(Number(summary.today || 0)), cls: "ok" },
    { label: "Bestätigt", value: String(Number(summary.confirmed || 0)), cls: "ok" },
    { label: "Offen", value: String(Number(summary.pending || 0)), cls: "warn" },
    { label: "Storniert", value: String(Number(summary.canceled || 0)), cls: "danger" },
  ];
  appointmentStats.innerHTML = chips
    .map(
      (chip) =>
        `<div class="pstat ${chip.cls || ""}"><span class="pstat-value">${escapeHtml(chip.value)}</span><span class="pstat-label">${escapeHtml(chip.label)}</span></div>`
    )
    .join("");
}

function renderAppointments() {
  renderAppointmentStats();
  if (!appointmentsBody) return;
  const term = String(appointmentSearch?.value || "").trim().toLowerCase();
  const onlyUpcoming = state.appointmentFilter !== "all";
  const rows = (state.appointments || []).filter((row) => {
    if (onlyUpcoming && row.segment !== "upcoming") return false;
    if (!term) return true;
    return [row.patientName, row.patientEmail, row.treatmentName, row.practitionerName].some((value) =>
      String(value || "").toLowerCase().includes(term)
    );
  });

  if (!rows.length) {
    const message = term
      ? "Keine Treffer."
      : onlyUpcoming
        ? "Keine anstehenden Termine."
        : "Noch keine Termine.";
    appointmentsBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
    return;
  }

  appointmentsBody.innerHTML = rows
    .map((row) => {
      const status = APPOINTMENT_STATUS[String(row.status || "").toLowerCase()] || APPOINTMENT_STATUS.pending_confirmation;
      const when = row.startsAt ? formatDate(row.startsAt) : "—";
      const duration = Number(row.treatmentDurationMinutes || 0);
      const patient = row.patientName || row.patientEmail || "—";
      const treatment = row.treatmentName || "—";
      const practitioner = row.practitionerName || "—";
      const durationLabel = duration > 0 ? `<small>${duration} Min</small>` : "";
      return `<tr>
        <td><strong>${escapeHtml(when)}</strong></td>
        <td>${escapeHtml(patient)}</td>
        <td>${escapeHtml(treatment)}${durationLabel}</td>
        <td>${escapeHtml(practitioner)}</td>
        <td><span class="status-pill ${status.cls}">${escapeHtml(status.label)}</span></td>
      </tr>`;
    })
    .join("");
}

async function loadAppointments() {
  const response = await apiRequest("/clinic/appointments?limit=200");
  state.appointments = Array.isArray(response.appointments) ? response.appointments : [];
  if (response.summary && typeof response.summary === "object") {
    state.appointmentSummary = response.summary;
  }
  renderAppointmentStats();
  renderCalendar();
}

/* ============================================================
   Termine-Kalender (Monat / Woche / Tag)
   ============================================================ */
const CAL_WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const calTimeFmt = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });

function calStartOfDay(date) { const x = new Date(date); x.setHours(0, 0, 0, 0); return x; }
function calAddDays(date, n) { const x = new Date(date); x.setDate(x.getDate() + n); return x; }
function calSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function calStartOfWeek(date) { const x = calStartOfDay(date); return calAddDays(x, -((x.getDay() + 6) % 7)); }
function calParseStart(appt) {
  if (!appt || !appt.startsAt) return null;
  const d = new Date(appt.startsAt);
  return Number.isNaN(d.getTime()) ? null : d;
}
function calApptMinutes(appt) {
  const minutes = Number(appt.treatmentDurationMinutes || 0);
  return minutes > 0 ? minutes : 30;
}
function ensureCalendarDate() {
  if (!(state.calendarDate instanceof Date)) state.calendarDate = calStartOfDay(new Date());
  return state.calendarDate;
}
function calEventsForDay(date) {
  return (state.appointments || [])
    .map((appt) => ({ appt, start: calParseStart(appt) }))
    .filter((entry) => entry.start && calSameDay(entry.start, date))
    .sort((a, b) => a.start - b.start)
    .map((entry) => entry.appt);
}
function calStatusCls(appt) {
  return (APPOINTMENT_STATUS[String(appt.status || "").toLowerCase()] || APPOINTMENT_STATUS.pending_confirmation).cls;
}

function renderCalendar() {
  if (!calBody) return;
  const view = state.calendarView || "month";
  if (calViewSwitch) {
    calViewSwitch.querySelectorAll("[data-cal-view]").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-cal-view") === view);
    });
  }
  if (view === "week") renderCalTimeGrid(calWeekDays());
  else if (view === "day") renderCalTimeGrid([ensureCalendarDate()]);
  else renderCalMonth();
}

function calWeekDays() {
  const start = calStartOfWeek(ensureCalendarDate());
  return Array.from({ length: 7 }, (_, i) => calAddDays(start, i));
}

function renderCalMonth() {
  const anchor = ensureCalendarDate();
  if (calTitle) calTitle.textContent = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(anchor);
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = calStartOfWeek(first);
  const today = calStartOfDay(new Date());

  let cells = "";
  for (let i = 0; i < 42; i += 1) {
    const day = calAddDays(gridStart, i);
    const inMonth = day.getMonth() === anchor.getMonth();
    const events = calEventsForDay(day);
    const shown = events.slice(0, 3);
    const more = events.length - shown.length;
    const createIso = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 0).toISOString();
    cells += `<div class="cal-cell${inMonth ? "" : " cal-out"}${calSameDay(day, today) ? " cal-today" : ""}" data-cal-create="${createIso}">
      <div class="cal-cell-date">${day.getDate()}</div>
      <div class="cal-cell-events">
        ${shown.map((appt) => calMonthChip(appt)).join("")}
        ${more > 0 ? `<button class="cal-more" type="button" data-cal-goto="${day.toISOString()}">+${more} weitere</button>` : ""}
      </div>
    </div>`;
  }
  calBody.innerHTML = `<div class="cal-weekhead">${CAL_WEEKDAYS.map((d) => `<div>${d}</div>`).join("")}</div><div class="cal-grid">${cells}</div>`;
}

function calMonthChip(appt) {
  const start = calParseStart(appt);
  const time = start ? calTimeFmt.format(start) : "";
  const text = appt.patientName || appt.patientEmail || appt.treatmentName || "Termin";
  const tip = `${time} · ${appt.patientName || "—"} · ${appt.treatmentName || ""}`.trim();
  return `<button class="cal-chip ${calStatusCls(appt)}" type="button" data-appt-id="${appt.id}" title="${escapeAttr(tip)}"><span class="cal-chip-time">${escapeHtml(time)}</span><span class="cal-chip-text">${escapeHtml(text)}</span></button>`;
}

function renderCalTimeGrid(days) {
  const today = calStartOfDay(new Date());
  if (days.length === 1) {
    if (calTitle) calTitle.textContent = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(days[0]);
  } else if (calTitle) {
    const fmtShort = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });
    const fmtLong = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric" });
    calTitle.textContent = `${fmtShort.format(days[0])} – ${fmtLong.format(days[6])}`;
  }

  let minHour = 8;
  let maxHour = 18;
  days.forEach((day) => {
    calEventsForDay(day).forEach((appt) => {
      const start = calParseStart(appt);
      const endMin = start.getHours() * 60 + start.getMinutes() + calApptMinutes(appt);
      minHour = Math.min(minHour, start.getHours());
      maxHour = Math.max(maxHour, Math.ceil(endMin / 60));
    });
  });
  minHour = Math.max(0, Math.min(minHour, 8));
  maxHour = Math.min(24, Math.max(maxHour, 18));
  const hourPx = 52;
  const totalMin = (maxHour - minHour) * 60;

  const dayHeads = days
    .map((day) => `<div class="cal-tg-dayhead${calSameDay(day, today) ? " cal-today" : ""}"><span class="cal-tg-dow">${CAL_WEEKDAYS[(day.getDay() + 6) % 7]}</span><span class="cal-tg-date">${day.getDate()}</span></div>`)
    .join("");

  let axis = "";
  for (let h = minHour; h < maxHour; h += 1) {
    axis += `<div class="cal-tg-hour" style="height:${hourPx}px"><span>${String(h).padStart(2, "0")}:00</span></div>`;
  }

  const cols = days
    .map((day) => {
      const slots = Array.from({ length: maxHour - minHour }, (_, i) => {
        const slotIso = new Date(day.getFullYear(), day.getMonth(), day.getDate(), minHour + i, 0).toISOString();
        return `<div class="cal-tg-slot" data-cal-create="${slotIso}" style="height:${hourPx}px"></div>`;
      }).join("");
      const blocks = calEventsForDay(day)
        .map((appt) => {
          const start = calParseStart(appt);
          const startMin = start.getHours() * 60 + start.getMinutes();
          const top = ((startMin - minHour * 60) / totalMin) * 100;
          const height = (calApptMinutes(appt) / totalMin) * 100;
          const time = calTimeFmt.format(start);
          return `<button class="cal-block ${calStatusCls(appt)}" type="button" data-appt-id="${appt.id}" style="top:${top}%;height:calc(${height}% - 3px)"><span class="cal-block-time">${escapeHtml(time)}</span><span class="cal-block-title">${escapeHtml(appt.patientName || appt.treatmentName || "Termin")}</span><span class="cal-block-sub">${escapeHtml(appt.treatmentName || "")}</span></button>`;
        })
        .join("");
      return `<div class="cal-tg-col${calSameDay(day, today) ? " cal-today" : ""}">${slots}<div class="cal-tg-events">${blocks}</div></div>`;
    })
    .join("");

  const colsTemplate = `56px repeat(${days.length}, minmax(0, 1fr))`;
  calBody.innerHTML = `<div class="cal-tg">
    <div class="cal-tg-head" style="grid-template-columns:${colsTemplate}"><div class="cal-tg-corner"></div>${dayHeads}</div>
    <div class="cal-tg-scroll"><div class="cal-tg-body" style="grid-template-columns:${colsTemplate}"><div class="cal-tg-axis">${axis}</div>${cols}</div></div>
  </div>`;
}

function calNavigate(direction) {
  const view = state.calendarView || "month";
  if (direction === "today") {
    state.calendarDate = calStartOfDay(new Date());
  } else {
    const sign = direction === "next" ? 1 : -1;
    const current = ensureCalendarDate();
    if (view === "month") state.calendarDate = new Date(current.getFullYear(), current.getMonth() + sign, 1);
    else if (view === "week") state.calendarDate = calAddDays(current, 7 * sign);
    else state.calendarDate = calAddDays(current, sign);
  }
  renderCalendar();
}

/* ---- Termin-Drawer: anlegen / bearbeiten / Notizen ---- */
function calPad2(value) { return String(value).padStart(2, "0"); }
function calDateInputValue(date) { return `${date.getFullYear()}-${calPad2(date.getMonth() + 1)}-${calPad2(date.getDate())}`; }
function calTimeInputValue(date) { return `${calPad2(date.getHours())}:${calPad2(date.getMinutes())}`; }

function populateTreatmentDatalist() {
  if (!apptTreatmentList) return;
  const treatments = (state.catalog && state.catalog.treatments) || [];
  apptTreatmentList.innerHTML = treatments
    .filter((item) => item && item.name)
    .map((item) => `<option value="${escapeAttr(item.name)}"></option>`)
    .join("");
}

function openApptDrawer(mode, data = {}) {
  if (!apptDrawer || !apptForm) return;
  populateTreatmentDatalist();
  if (apptFormError) apptFormError.textContent = "";
  const fields = apptForm.elements;

  if (mode === "edit" && data.id != null) {
    state.editingApptId = Number(data.id);
    const start = calParseStart(data) || new Date();
    if (apptDrawerMode) apptDrawerMode.textContent = "Termin bearbeiten";
    if (apptDrawerTitle) apptDrawerTitle.textContent = data.patientName || data.treatmentName || "Termin";
    fields.patientName.value = data.patientName || "";
    fields.patientEmail.value = data.patientEmail || "";
    fields.treatmentName.value = data.treatmentName || "";
    fields.date.value = calDateInputValue(start);
    fields.time.value = calTimeInputValue(start);
    fields.durationMinutes.value = data.treatmentDurationMinutes || 30;
    fields.practitionerName.value = data.practitionerName || "";
    fields.status.value = String(data.status || "confirmed").toLowerCase();
    fields.notes.value = data.notes || "";
    if (apptCancelAppt) apptCancelAppt.classList.toggle("hidden", String(data.status || "") === "canceled");
  } else {
    state.editingApptId = null;
    let start = data.startsAt ? new Date(data.startsAt) : new Date();
    if (Number.isNaN(start.getTime())) start = new Date();
    if (apptDrawerMode) apptDrawerMode.textContent = "Neuer Termin";
    if (apptDrawerTitle) apptDrawerTitle.textContent = "Neuer Termin";
    apptForm.reset();
    fields.date.value = calDateInputValue(start);
    fields.time.value = calTimeInputValue(start);
    fields.durationMinutes.value = 30;
    fields.status.value = "confirmed";
    if (apptCancelAppt) apptCancelAppt.classList.add("hidden");
  }

  loadCustomerNotes(fields.patientEmail.value);
  apptDrawer.classList.remove("hidden");
  apptDrawer.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => apptDrawer.classList.add("open"));
  haptics("light");
  window.setTimeout(() => { try { fields.patientName.focus(); } catch { /* noop */ } }, 60);
}

async function loadCustomerNotes(email) {
  const field = apptForm && apptForm.elements.customerNotes;
  if (!field) return;
  const clean = String(email || "").trim();
  state.customerNotesEmail = clean;
  if (!clean) { field.value = ""; return; }
  try {
    const response = await apiRequest(`/clinic/patient-notes?email=${encodeURIComponent(clean)}`);
    if (state.customerNotesEmail === clean) field.value = response.notes || "";
  } catch {
    /* notes optional — ignore */
  }
}

function closeApptDrawer() {
  if (!apptDrawer) return;
  apptDrawer.classList.remove("open");
  apptDrawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => apptDrawer.classList.add("hidden"), 220);
}

function apptStartIso() {
  const fields = apptForm.elements;
  const date = String(fields.date.value || "").trim();
  const time = String(fields.time.value || "").trim() || "00:00";
  if (!date) return null;
  const parsed = new Date(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function submitApptForm(event) {
  event.preventDefault();
  if (apptFormError) apptFormError.textContent = "";
  const fields = apptForm.elements;
  const startsAt = apptStartIso();
  if (!String(fields.patientName.value || "").trim()) {
    if (apptFormError) apptFormError.textContent = "Bitte Name der Patient:in eingeben.";
    return;
  }
  if (!startsAt) {
    if (apptFormError) apptFormError.textContent = "Bitte Datum und Uhrzeit wählen.";
    return;
  }
  const payload = {
    patientName: fields.patientName.value.trim(),
    patientEmail: fields.patientEmail.value.trim(),
    treatmentName: fields.treatmentName.value.trim(),
    startsAt,
    durationMinutes: Number(fields.durationMinutes.value) || 30,
    practitionerName: fields.practitionerName.value.trim(),
    status: fields.status.value,
    notes: fields.notes.value.trim(),
  };
  const saveBtn = document.getElementById("apptSaveBtn");
  if (saveBtn) saveBtn.disabled = true;
  try {
    if (state.editingApptId) {
      await apiRequest(`/clinic/appointments/${state.editingApptId}`, { method: "PUT", body: payload });
      showToast("Termin aktualisiert");
    } else {
      await apiRequest("/clinic/appointments", { method: "POST", body: payload });
      showToast("Termin angelegt");
    }
    if (payload.patientEmail) {
      const customerNotes = fields.customerNotes ? fields.customerNotes.value.trim() : "";
      try {
        await apiRequest("/clinic/patient-notes", { method: "PUT", body: { patientEmail: payload.patientEmail, notes: customerNotes } });
      } catch {
        /* customer notes are non-critical */
      }
    }
    closeApptDrawer();
    await loadAppointments();
  } catch (error) {
    if (apptFormError) apptFormError.textContent = error.message || "Speichern fehlgeschlagen.";
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

async function cancelCurrentAppt() {
  if (!state.editingApptId) return;
  try {
    await apiRequest(`/clinic/appointments/${state.editingApptId}`, { method: "PUT", body: { status: "canceled" } });
    showToast("Termin storniert");
    closeApptDrawer();
    await loadAppointments();
  } catch (error) {
    if (apptFormError) apptFormError.textContent = error.message;
  }
}

async function loadCatalog() {
  const response = await apiRequest("/clinic/catalog");
  state.catalog = normalizeCatalogPayload(response.catalog || {});
  renderCatalog();
}

async function loadCampaigns() {
  const response = await apiRequest("/clinic/campaigns");
  state.campaigns = Array.isArray(response.campaigns) ? response.campaigns : [];
  renderCampaigns(state.campaigns);
}

async function loadAuditLogs() {
  const response = await apiRequest("/clinic/audit-logs?limit=100");
  state.auditLogs = Array.isArray(response.logs) ? response.logs : [];
  renderAuditLogs(state.auditLogs);
}

async function saveCatalog() {
  if (!state.isOwner) {
    showToast("Nur Owner können den Katalog speichern.");
    return;
  }

  syncCatalogStateFromDom();
  saveCatalogBtn.disabled = true;

  try {
    await apiRequest("/clinic/catalog", {
      method: "PUT",
      body: state.catalog,
    });
    await Promise.all([loadCatalog(), loadAuditLogs()]);
    showToast("Katalog gespeichert");
  } catch (error) {
    showToast(error.message);
  } finally {
    saveCatalogBtn.disabled = false;
  }
}

async function maybeAdoptWebsiteBranding() {
  // Brand color, accent and font are managed centrally in the Branding (App-Design)
  // editor now, so the website-import flow no longer adopts them here. The catalog/
  // treatment import still happens server-side during the settings save.
  return;
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function handleExportCatalog() {
  try {
    const response = await apiRequest("/clinic/catalog/export");
    const clinicName = String(response.clinicName || state.user?.clinicName || "clinic")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "clinic";
    const date = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`${clinicName}-catalog-${date}.json`, response);
    showToast("Katalog exportiert");
  } catch (error) {
    showToast(error.message);
  }
}

function handleImportCatalogButton() {
  if (!state.isOwner) {
    showToast("Nur Owner können importieren.");
    return;
  }

  void importCatalogFromWebsite();
}

async function importCatalogFromWebsite() {
  const formWebsite = String(settingsForm.elements.website?.value || "").trim();
  const savedWebsite = String(state.settingsSnapshot?.website || "").trim();

  if (!savedWebsite) {
    showToast("Bitte zuerst eine Website in den Einstellungen speichern.");
    showView("einstellungen");
    return;
  }

  if (formWebsite && formWebsite !== savedWebsite) {
    showToast("Website wurde geändert. Bitte zuerst Einstellungen speichern.");
    showView("einstellungen");
    return;
  }

  const previousLabel = importCatalogBtn.textContent;
  try {
    importCatalogBtn.disabled = true;
    importCatalogBtn.textContent = "Website wird übernommen ...";
    const response = await apiRequest("/clinic/catalog/import-from-website", {
      method: "POST",
      body: {},
    });
    state.catalog = normalizeCatalogPayload(response.catalog || {});
    renderCatalog();
    await Promise.all([loadAuditLogs(), loadSettings()]);
    showToast(formatWebsiteImportSuccess(response.websiteSync));
    await maybeAdoptWebsiteBranding(response.websiteSync);
  } catch (error) {
    showToast(humanizeImportError(error.message || "Website-Import fehlgeschlagen"));
  } finally {
    importCatalogBtn.disabled = false;
    importCatalogBtn.textContent = previousLabel || "Von Website übernehmen";
  }
}

async function handleImportCatalogChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incomingCatalog = normalizeCatalogPayload(parsed.catalog || parsed);

    await apiRequest("/clinic/catalog/import", {
      method: "POST",
      body: { catalog: incomingCatalog },
    });

    state.catalog = incomingCatalog;
    renderCatalog();
    await loadAuditLogs();
    showToast("Katalog importiert");
  } catch (error) {
    showToast(error.message || "Import fehlgeschlagen");
  } finally {
    input.value = "";
  }
}

async function handleCreateCampaign(event) {
  event.preventDefault();
  if (!state.isOwner) {
    showToast("Nur Owner können Kampagnen erstellen.");
    return;
  }

  const payload = parseAuthForm(campaignForm);
  payload.pointsBonus = toInt(payload.pointsBonus, 0);

  try {
    createCampaignBtn.disabled = true;
    await apiRequest("/clinic/campaigns", {
      method: "POST",
      body: payload,
    });
    campaignForm.reset();
    campaignForm.elements.triggerType.value = "broadcast";
    campaignForm.elements.channel.value = "in_app";
    campaignForm.elements.status.value = "draft";
    campaignForm.elements.pointsBonus.value = "0";
    await Promise.all([loadCampaigns(), loadAuditLogs()]);
    showToast("Kampagne erstellt");
  } catch (error) {
    showToast(error.message);
  } finally {
    createCampaignBtn.disabled = false;
  }
}

async function runCampaign(campaignId) {
  if (!state.isOwner) {
    showToast("Nur Owner können Kampagnen starten.");
    return;
  }

  try {
    const response = await apiRequest(`/clinic/campaigns/${campaignId}/run`, {
      method: "POST",
      body: {},
    });
    await Promise.all([loadCampaigns(), loadAuditLogs()]);
    const delivery = (response.run || {}).delivery || {};
    const sent = Number(delivery.sent || 0);
    const failed = Number(delivery.failed || 0);
    const skipped = Number(delivery.skipped || 0);
    showToast(`Kampagne ausgeführt: sent ${sent}, failed ${failed}, skipped ${skipped}`);
  } catch (error) {
    showToast(error.message);
  }
}

async function runDueCampaigns() {
  if (!state.isOwner) {
    showToast("Nur Owner können fällige Kampagnen ausführen.");
    return;
  }

  try {
    if (runDueCampaignsBtn) runDueCampaignsBtn.disabled = true;
    const response = await apiRequest("/clinic/campaigns/run-due", {
      method: "POST",
      body: { limit: 20 },
    });
    await Promise.all([loadCampaigns(), loadAuditLogs(), loadAnalyticsSummary()]);
    const executed = Number(response.executed || 0);
    showToast(`Fällige Kampagnen ausgeführt: ${executed}`);
  } catch (error) {
    showToast(error.message);
  } finally {
    if (runDueCampaignsBtn) runDueCampaignsBtn.disabled = !state.isOwner;
  }
}

async function toggleCampaignStatus(campaignId, nextStatus) {
  if (!state.isOwner) {
    showToast("Nur Owner können Kampagnen ändern.");
    return;
  }
  try {
    const existing = state.campaigns.find((entry) => Number(entry.id) === Number(campaignId));
    if (!existing) {
      showToast("Kampagne nicht gefunden.");
      return;
    }
    await apiRequest(`/clinic/campaigns/${campaignId}`, {
      method: "PUT",
      body: {
        name: existing.name,
        triggerType: existing.triggerType,
        channel: existing.channel,
        status: nextStatus,
        templateTitle: existing.templateTitle,
        templateBody: existing.templateBody,
        pointsBonus: existing.pointsBonus,
      },
    });
    await Promise.all([loadCampaigns(), loadAuditLogs()]);
    showToast(`Kampagne auf ${nextStatus} gesetzt`);
  } catch (error) {
    showToast(error.message);
  }
}

function addCatalogRow(listName) {
  syncCatalogStateFromDom();

  if (listName === "categories") {
    state.catalog.categories.push({ id: "", label: "" });
  } else if (listName === "treatments") {
    const firstCategory = state.catalog.categories[0]?.id || "gesicht";
    state.catalog.treatments.push({
      id: "",
      name: "",
      category: firstCategory,
      priceCents: 0,
      memberPriceCents: 0,
      durationMinutes: 30,
      description: "",
      bodyZones: [],
    });
  } else if (listName === "memberships") {
    state.catalog.memberships.push({
      id: "",
      name: "",
      priceCents: 0,
      includedTreatmentIds: [],
      perks: [],
    });
  } else if (listName === "rewardActions") {
    state.catalog.rewardActions.push({ id: "", label: "", points: 0 });
  } else if (listName === "rewardRedeems") {
    state.catalog.rewardRedeems.push({ id: "", label: "", requiredPoints: 0, valueCents: 0 });
  } else if (listName === "homeArticles") {
    state.catalog.homeArticles.push({ id: "", tag: "", title: "", body: "" });
  } else {
    return;
  }

  renderCatalog();
}

function removeCatalogRow(listName, index) {
  syncCatalogStateFromDom();
  const list = state.catalog[listName];
  if (!Array.isArray(list)) return;
  if (index < 0 || index >= list.length) return;
  list.splice(index, 1);
  renderCatalog();
}

async function loadDashboardData() {
  await Promise.all([
    loadSettings(),
    loadMembers(),
    loadBillingStatus(),
    loadBillingHistory(),
    loadAnalyticsSummary(),
    loadPatientMemberships(),
    loadAppointments(),
    loadCatalog(),
    loadClinicTheme(),
    loadCampaigns(),
    loadAuditLogs(),
  ]);
  renderOnboarding();
}

function parseAuthForm(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

async function handleLogin(event) {
  event.preventDefault();
  setAuthMessage("");
  const payload = parseAuthForm(loginForm);

  try {
    const response = await apiRequest("/auth/login", { method: "POST", body: payload });
    setSession(response.user);
    await loadDashboardData();
    showToast("Login erfolgreich");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setAuthMessage("");
  const payload = parseAuthForm(registerForm);

  try {
    const response = await apiRequest("/auth/register", { method: "POST", body: payload });
    setSession(response.user);
    await loadDashboardData();
    showToast("Owner-Konto erstellt");
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function handleLogout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Intentionally ignore logout errors and clear local state.
  }
  setSession(null);
  setTab("login");
  showToast("Abgemeldet");
}

async function handleSettingsSave(event) {
  event.preventDefault();
  if (!state.isOwner) {
    showToast("Nur Owner können Einstellungen speichern.");
    return;
  }

  const websiteValue = String(settingsForm.elements.website?.value || "").trim();
  const previousWebsite = String(state.settingsSnapshot?.website || "").trim();
  const shouldOfferWebsiteBranding = Boolean(websiteValue) && websiteValue !== previousWebsite;
  const payload = buildSettingsPayload({
    syncWebsiteCatalog: shouldOfferWebsiteBranding,
    skipWebsiteImport: false,
    useWebsiteBrandColor: false,
    useWebsiteAccentColor: false,
    useWebsiteFontFamily: false,
  });

  try {
    saveSettingsBtn.disabled = true;
    const response = await apiRequest("/clinic/settings", { method: "PUT", body: payload });
    await Promise.all([
      loadSettings(),
      loadAuditLogs(),
      response.websiteSync?.success ? loadCatalog() : Promise.resolve(),
    ]);

    const importedTreatments = Number(response.websiteSync?.importedTreatments || 0);
    if (response.websiteSync?.success && websiteValue) {
      showToast(`Einstellungen gespeichert · ${formatWebsiteImportSuccess(response.websiteSync)}`);
      if (shouldOfferWebsiteBranding) {
        await maybeAdoptWebsiteBranding(response.websiteSync);
      }
      return;
    }

    if (response.websiteSync?.error) {
      showToast(`Einstellungen gespeichert · ${humanizeImportError(response.websiteSync.error)}`);
      return;
    }

    showToast("Einstellungen gespeichert");
  } catch (error) {
    showToast(humanizeImportError(error.message));
  } finally {
    saveSettingsBtn.disabled = false;
  }
}

function setMemberPhotoPreview(url = "", filename = "") {
  const value = String(url || "").trim();
  if (state.memberPhotoObjectUrl && state.memberPhotoObjectUrl !== value) {
    URL.revokeObjectURL(state.memberPhotoObjectUrl);
    state.memberPhotoObjectUrl = "";
  }
  if (memberForm?.elements?.profileImageUrl) {
    memberForm.elements.profileImageUrl.value = value;
  }
  if (memberPhotoPreview) {
    memberPhotoPreview.innerHTML = value
      ? `<img src="${escapeAttr(value)}" alt="">`
      : "+";
    memberPhotoPreview.classList.toggle("has-photo", Boolean(value));
  }
  if (memberPhotoName) {
    memberPhotoName.textContent = filename || (value ? "Bild hochgeladen." : "Optional, quadratisch wirkt am ruhigsten.");
  }
  if (memberPhotoClearBtn) memberPhotoClearBtn.classList.toggle("hidden", !value);
}

function clearMemberPhoto() {
  if (state.memberPhotoObjectUrl) {
    URL.revokeObjectURL(state.memberPhotoObjectUrl);
    state.memberPhotoObjectUrl = "";
  }
  if (memberPhotoInput) memberPhotoInput.value = "";
  setMemberPhotoPreview("", "");
}

async function uploadMemberPhoto(file) {
  if (!file) return "";
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/clinic/media/upload`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = {}; }
  }
  if (!response.ok) {
    throw new Error(payload.error || "Profilbild konnte nicht hochgeladen werden.");
  }
  const url = payload.file?.url || "";
  if (!url) throw new Error("Profilbild konnte nicht gespeichert werden.");
  return url;
}

function setMemberFormMode(member = null) {
  const isEdit = Boolean(member?.id);
  state.memberDrawerMode = isEdit ? "edit" : "create";
  state.editingMemberId = isEdit ? Number(member.id) : null;

  const fullNameInput = memberForm?.elements?.fullName;
  const jobTitleInput = memberForm?.elements?.jobTitle;
  const staffNotesInput = memberForm?.elements?.staffNotes;
  const emailInput = memberForm?.elements?.email;
  const passwordInput = memberForm?.elements?.password;

  if (memberDrawerTitle) {
    memberDrawerTitle.textContent = isEdit ? "Mitarbeiterprofil bearbeiten" : "Mitarbeiter:in hinzufügen";
  }
  if (memberDrawerIntro) {
    memberDrawerIntro.textContent = isEdit
      ? "Profilbild und Jobtitel strukturieren die Team-Liste."
      : "Neue Staff-Zugänge erhalten Zugriff auf dieses Klinik-Dashboard.";
  }
  if (fullNameInput) fullNameInput.value = isEdit ? String(member.fullName || "") : "";
  if (jobTitleInput) jobTitleInput.value = isEdit ? String(member.jobTitle || "") : "";
  if (staffNotesInput) staffNotesInput.value = isEdit ? String(member.staffNotes || "") : "";
  if (emailInput) {
    emailInput.value = isEdit ? String(member.email || "") : "";
    emailInput.disabled = isEdit;
    emailInput.required = !isEdit;
  }
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.required = !isEdit;
  }
  if (memberEmailLabel) memberEmailLabel.classList.toggle("is-disabled", isEdit);
  if (memberPasswordLabel) memberPasswordLabel.classList.toggle("hidden", isEdit);
  setMemberPhotoPreview(isEdit ? member.profileImageUrl || "" : "", isEdit && member.profileImageUrl ? "Bild gespeichert." : "");
  if (memberSaveBtn) memberSaveBtn.textContent = isEdit ? "Speichern" : "Anlegen";
}

function openMemberDrawer(member = null) {
  if (!state.isOwner) {
    showToast("Nur Owner können Staff anlegen.");
    return;
  }
  if (!memberDrawer || !memberForm) return;
  memberForm.reset();
  clearMemberPhoto();
  setMemberFormMode(member);
  if (memberFormError) memberFormError.textContent = "";
  if (memberSaveBtn) {
    memberSaveBtn.disabled = false;
    memberSaveBtn.textContent = state.memberDrawerMode === "edit" ? "Speichern" : "Anlegen";
  }
  resetPasswordVisibility(memberDrawer);
  memberDrawer.classList.remove("hidden");
  memberDrawer.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => memberDrawer.classList.add("open"));
  haptics("light");
  window.setTimeout(() => {
    try {
      const focusTarget = state.memberDrawerMode === "edit" ? memberForm.elements.jobTitle : memberForm.elements.fullName;
      focusTarget?.focus();
    } catch { /* noop */ }
  }, 60);
}

function closeMemberDrawer() {
  if (!memberDrawer) return;
  memberDrawer.classList.remove("open");
  memberDrawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => memberDrawer.classList.add("hidden"), 220);
}

async function handleMemberSubmit(event) {
  event.preventDefault();
  if (!state.isOwner) {
    showToast("Nur Owner können Staff anlegen.");
    return;
  }

  if (memberFormError) memberFormError.textContent = "";
  const isEdit = state.memberDrawerMode === "edit" && state.editingMemberId;
  if (memberSaveBtn) {
    memberSaveBtn.disabled = true;
    memberSaveBtn.textContent = isEdit ? "Speichere ..." : "Lege an ...";
  }

  try {
    const file = memberPhotoInput?.files?.[0];
    if (file) {
      if (memberSaveBtn) memberSaveBtn.textContent = "Lade Bild ...";
      const imageUrl = await uploadMemberPhoto(file);
      setMemberPhotoPreview(imageUrl, file.name);
    }
    if (memberSaveBtn) memberSaveBtn.textContent = isEdit ? "Speichere ..." : "Lege an ...";
    if (isEdit) {
      const payload = {
        fullName: String(memberForm.elements.fullName?.value || "").trim(),
        jobTitle: String(memberForm.elements.jobTitle?.value || "").trim(),
        staffNotes: String(memberForm.elements.staffNotes?.value || "").trim(),
        profileImageUrl: String(memberForm.elements.profileImageUrl?.value || "").trim(),
      };
      await apiRequest(`/clinic/members/${state.editingMemberId}`, { method: "PATCH", body: payload });
    } else {
      const payload = parseAuthForm(memberForm);
      payload.role = "staff";
      await apiRequest("/clinic/members", { method: "POST", body: payload });
    }
    memberForm.reset();
    clearMemberPhoto();
    closeMemberDrawer();
    await Promise.all([loadMembers(), loadAuditLogs()]);
    showToast(isEdit ? "Mitarbeiterprofil gespeichert" : "Staff-User erstellt");
  } catch (error) {
    if (memberFormError) memberFormError.textContent = error.message || "Mitarbeiter:in konnte nicht gespeichert werden.";
    showToast(error.message);
  } finally {
    if (memberSaveBtn) {
      memberSaveBtn.disabled = false;
      memberSaveBtn.textContent = state.memberDrawerMode === "edit" ? "Speichern" : "Anlegen";
    }
  }
}

async function handleCheckoutStart() {
  if (!state.isOwner) {
    showToast("Nur Owner können Stripe-Checkout starten.");
    return;
  }

  try {
    startCheckoutBtn.disabled = true;
    const response = await apiRequest("/billing/create-checkout-session", {
      method: "POST",
      body: {},
    });

    if (!response.checkoutUrl) {
      throw new Error("Checkout-URL fehlt.");
    }

    window.location.assign(response.checkoutUrl);
  } catch (error) {
    showToast(error.message);
  } finally {
    startCheckoutBtn.disabled = false;
  }
}

function applyBillingReturnToast() {
  const url = new URL(window.location.href);
  const billing = url.searchParams.get("billing");

  if (!billing) return;

  if (billing === "success") {
    showToast("Zahlung erfolgreich. Billing-Status wird aktualisiert.");
  }
  if (billing === "cancel") {
    showToast("Checkout wurde abgebrochen.");
  }

  url.searchParams.delete("billing");
  url.searchParams.delete("plan");
  window.history.replaceState({}, "", url.toString());
}

function handleMetricsRangeApply() {
  const fromDate = String(metricsFromDateInput?.value || "").trim();
  const toDate = String(metricsToDateInput?.value || "").trim();

  if (!fromDate || !toDate) {
    showToast("Bitte Von- und Bis-Datum setzen.");
    return;
  }
  if (!isValidDateInput(fromDate) || !isValidDateInput(toDate)) {
    showToast("Ungültiges Datumsformat.");
    return;
  }
  if (fromDate > toDate) {
    showToast("Von-Datum muss vor Bis-Datum liegen.");
    return;
  }

  applyCustomMetricsRange(fromDate, toDate);
  loadAnalyticsSummary().catch((error) => showToast(error.message));
}

async function bootstrapSession() {
  try {
    const response = await apiRequest("/auth/me");
    setSession(response.user);
    await loadDashboardData();
  } catch {
    setSession(null);
  }
}

function bindEvents() {
  tabLogin.addEventListener("click", () => setTab("login"));
  tabRegister.addEventListener("click", () => setTab("register"));
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  document.addEventListener("click", handlePasswordToggleClick);
  logoutBtn.addEventListener("click", handleLogout);
  settingsForm.addEventListener("submit", handleSettingsSave);
  if (chartColorPicker instanceof HTMLInputElement) {
    const applyChartColor = () => {
      chartColor = normalizeChartColorForUi(chartColorPicker.value);
      updateChartColorControl(chartColor);
      scheduleMetricsRender();
    };
    chartColorPicker.addEventListener("input", applyChartColor);
    chartColorPicker.addEventListener("change", () => {
      applyChartColor();
      apiRequest("/clinic/chart-color", { method: "PUT", body: { chartColor } })
        .catch((error) => showToast(error.message || "Diagrammfarbe konnte nicht gespeichert werden."));
    });
  }
  if (appearanceForm) {
    appearanceForm.addEventListener("input", (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.matches('input[type="color"][data-color-picker-for]')) {
        const textInput = document.getElementById(String(target.getAttribute("data-color-picker-for") || ""));
        if (textInput instanceof HTMLInputElement) {
          textInput.value = target.value.toUpperCase();
        }
      } else if (target instanceof HTMLInputElement && target.type === "text") {
        setAppearanceColorPickerValue(target);
      }
      state.themeDraft = collectAppearanceThemeFromForm();
      applyAppearancePreview(state.themeDraft);
      updateAppearanceRangeLabels(state.themeDraft);
      updateAppearanceWorkflowState();
    });
    appearanceForm.addEventListener("change", () => {
      state.themeDraft = collectAppearanceThemeFromForm();
      applyAppearancePreview(state.themeDraft);
      updateAppearanceRangeLabels(state.themeDraft);
      updateAppearanceWorkflowState();
    });
  }
  if (saveThemeDraftBtn) saveThemeDraftBtn.addEventListener("click", saveThemeDraft);
  if (publishThemeBtn) publishThemeBtn.addEventListener("click", publishThemeDraft);
  if (resetAppearanceBtn) resetAppearanceBtn.addEventListener("click", resetThemeDraftToPublished);
  if (resetDefaultAppearanceBtn) resetDefaultAppearanceBtn.addEventListener("click", resetThemeToDefault);
  if (addMemberBtn) addMemberBtn.addEventListener("click", openMemberDrawer);
  if (memberForm) memberForm.addEventListener("submit", handleMemberSubmit);
  if (memberPhotoBtn) memberPhotoBtn.addEventListener("click", () => memberPhotoInput?.click());
  if (memberPhotoClearBtn) memberPhotoClearBtn.addEventListener("click", clearMemberPhoto);
  if (memberPhotoInput) {
    memberPhotoInput.addEventListener("change", () => {
      const file = memberPhotoInput.files?.[0];
      if (!file) {
        clearMemberPhoto();
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      if (state.memberPhotoObjectUrl) URL.revokeObjectURL(state.memberPhotoObjectUrl);
      state.memberPhotoObjectUrl = objectUrl;
      setMemberPhotoPreview(objectUrl, file.name);
    });
  }
  if (membersBody) {
    membersBody.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      handleMemberAction(event.target).catch((error) => showToast(error.message));
    });
  }
  if (memberConfirmAction) {
    memberConfirmAction.addEventListener("click", () => {
      confirmPendingMemberAction().catch((error) => showToast(error.message));
    });
  }
  if (memberConfirm) {
    memberConfirm.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-member-confirm-cancel]")) closeMemberConfirm();
    });
  }
  if (checkinCamBtn) checkinCamBtn.addEventListener("click", () => { startCheckinCamera(); });
  if (checkinCodeBtn) checkinCodeBtn.addEventListener("click", submitCheckinCode);
  if (checkinCodeInput) checkinCodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); submitCheckinCode(); }
  });
  if (checkinRefreshBtn) checkinRefreshBtn.addEventListener("click", () => { loadCheckinToday(); });
  startCheckoutBtn.addEventListener("click", handleCheckoutStart);
  refreshMetricsBtn.addEventListener("click", () => {
    loadAnalyticsSummary().catch((error) => showToast(error.message));
  });
  metricsDaysSelect.addEventListener("change", () => {
    setMetricsDays(metricsDaysSelect.value || "30");
    loadAnalyticsSummary().catch((error) => showToast(error.message));
  });
  if (metricsApplyRangeBtn) {
    metricsApplyRangeBtn.addEventListener("click", handleMetricsRangeApply);
  }
  [metricsFromDateInput, metricsToDateInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      handleMetricsRangeApply();
    });
  });
  if (metricsChipRow) {
    metricsChipRow.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-days]") : null;
      if (!button) return;
      const days = String(button.getAttribute("data-days") || "30");
      setMetricsDays(days);
      loadAnalyticsSummary().catch((error) => showToast(error.message));
    });
  }
  if (metricsCompareSelect) {
    metricsCompareSelect.addEventListener("change", () => {
      if (metricsCompareSelect.disabled) return;
      const mode = String(metricsCompareSelect.value || "none").toLowerCase();
      state.metricsCompareMode = ["none", "prev", "yoy"].includes(mode) ? mode : "none";
      loadAnalyticsSummary().catch((error) => showToast(error.message));
    });
  }
  if (txnFilters) {
    txnFilters.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-txn-filter]") : null;
      if (!button) return;
      setTxnFilter(button.getAttribute("data-txn-filter") || "all");
    });
  }
  if (txnSearch) {
    txnSearch.addEventListener("input", () => {
      state.transactionSearch = String(txnSearch.value || "");
      renderTransactions();
    });
  }
  if (txnExportBtn) txnExportBtn.addEventListener("click", exportTransactionsCsv);
  if (txnBody) {
    txnBody.addEventListener("click", (event) => {
      const row = event.target instanceof Element ? event.target.closest("tr[data-txn-id]") : null;
      if (!row) return;
      openTxnDrawer(row.getAttribute("data-txn-id"));
    });
    txnBody.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target instanceof Element ? event.target.closest("tr[data-txn-id]") : null;
      if (!row) return;
      event.preventDefault();
      openTxnDrawer(row.getAttribute("data-txn-id"));
    });
  }
  // The legacy "Schnell-Editor" was removed in favour of the visual editor
  // (the /catalog iframe). Its controls may be absent — guard every binding.
  if (saveCatalogBtn) saveCatalogBtn.addEventListener("click", saveCatalog);
  if (exportCatalogBtn) exportCatalogBtn.addEventListener("click", handleExportCatalog);
  if (importCatalogBtn) importCatalogBtn.addEventListener("click", handleImportCatalogButton);
  if (importCatalogInput) {
    importCatalogInput.addEventListener("change", handleImportCatalogChange);
  }
  if (addCategoryBtn) addCategoryBtn.addEventListener("click", () => addCatalogRow("categories"));
  if (addTreatmentBtn) addTreatmentBtn.addEventListener("click", () => addCatalogRow("treatments"));
  if (addMembershipBtn) addMembershipBtn.addEventListener("click", () => addCatalogRow("memberships"));
  if (addRewardActionBtn) addRewardActionBtn.addEventListener("click", () => addCatalogRow("rewardActions"));
  if (addRewardRedeemBtn) addRewardRedeemBtn.addEventListener("click", () => addCatalogRow("rewardRedeems"));
  if (addHomeArticleBtn) addHomeArticleBtn.addEventListener("click", () => addCatalogRow("homeArticles"));
  if (catalogForm) catalogForm.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("button[data-remove-list]") : null;
    if (!target) return;
    const listName = String(target.getAttribute("data-remove-list") || "");
    const index = Number(target.getAttribute("data-index"));
    if (!Number.isFinite(index)) return;
    removeCatalogRow(listName, index);
  });
  campaignForm.addEventListener("submit", handleCreateCampaign);
  refreshCampaignsBtn.addEventListener("click", () => {
    loadCampaigns().catch((error) => showToast(error.message));
  });
  if (runDueCampaignsBtn) {
    runDueCampaignsBtn.addEventListener("click", () => {
      runDueCampaigns().catch((error) => showToast(error.message));
    });
  }
  refreshAuditBtn.addEventListener("click", () => {
    loadAuditLogs().catch((error) => showToast(error.message));
  });
  campaignsBody.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const runBtn = event.target.closest("button[data-run-campaign]");
    if (runBtn) {
      const campaignId = Number(runBtn.getAttribute("data-run-campaign"));
      if (!Number.isFinite(campaignId) || campaignId <= 0) return;
      runCampaign(campaignId);
      return;
    }
    const toggleBtn = event.target.closest("button[data-toggle-campaign]");
    if (toggleBtn) {
      const campaignId = Number(toggleBtn.getAttribute("data-toggle-campaign"));
      const nextStatus = String(toggleBtn.getAttribute("data-next-status") || "").trim();
      if (!Number.isFinite(campaignId) || campaignId <= 0) return;
      if (!nextStatus) return;
      toggleCampaignStatus(campaignId, nextStatus);
    }
  });
  railNavItems.forEach((button) => {
    button.addEventListener("click", () => {
      showView(String(button.getAttribute("data-view") || "overview").trim());
    });
  });
  window.addEventListener("hashchange", () => {
    if (state.user) showView(viewFromHash(), false);
  });
  document.querySelectorAll(".subtabs").forEach((bar) => {
    bar.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-subtab]") : null;
      if (!button) return;
      const name = button.getAttribute("data-subtab");
      const scope = bar.parentElement;
      if (!scope) return;
      bar.querySelectorAll("button[data-subtab]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      Array.from(scope.children)
        .filter((child) => child.matches?.(".subpanel[data-subpanel]"))
        .forEach((panel) => {
          const active = panel.getAttribute("data-subpanel") === name;
          panel.classList.toggle("active", active);
          if (active) {
            ensureLazyFrameSource(panel.querySelector("iframe[data-src]"));
          }
        });
    });
  });
  document.querySelectorAll("iframe[data-src]").forEach((frame) => {
    frame.addEventListener("load", () => {
      const source = frame.getAttribute("data-src");
      if (!source) return;
      let expectedUrl;
      try {
        expectedUrl = new URL(source, window.location.href);
      } catch {
        return;
      }
      try {
        const loadedUrl = new URL(frame.contentWindow.location.href);
        if (
          loadedUrl.origin === expectedUrl.origin &&
          (loadedUrl.pathname !== expectedUrl.pathname || loadedUrl.search !== expectedUrl.search)
        ) {
          frame.setAttribute("src", source);
        }
      } catch {
        // Ignore cross-origin frames. The catalog editor is same-origin.
      }
    });
  });
  if (refreshDashboardBtn) {
    refreshDashboardBtn.addEventListener("click", async () => {
      if (!state.user || refreshDashboardBtn.disabled) return;
      refreshDashboardBtn.classList.add("spinning");
      refreshDashboardBtn.disabled = true;
      try {
        await loadDashboardData();
        showToast("Daten aktualisiert");
      } catch (error) {
        showToast(error.message);
      } finally {
        refreshDashboardBtn.classList.remove("spinning");
        refreshDashboardBtn.disabled = false;
      }
    });
  }
  if (patientSearch) {
    patientSearch.addEventListener("input", () => renderPatients());
  }
  if (appointmentSearch) {
    appointmentSearch.addEventListener("input", () => renderAppointments());
  }
  if (appointmentFilter) {
    appointmentFilter.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-appt-filter]") : null;
      if (!button) return;
      state.appointmentFilter = String(button.getAttribute("data-appt-filter") || "upcoming");
      appointmentFilter.querySelectorAll("button[data-appt-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      renderAppointments();
    });
  }
  const calToolbar = document.querySelector(".cal-toolbar");
  if (calToolbar) {
    calToolbar.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const navBtn = event.target.closest("[data-cal-nav]");
      if (navBtn) {
        calNavigate(navBtn.getAttribute("data-cal-nav"));
        return;
      }
      const viewBtn = event.target.closest("[data-cal-view]");
      if (viewBtn) {
        state.calendarView = viewBtn.getAttribute("data-cal-view");
        renderCalendar();
        return;
      }
      if (event.target.closest("[data-cal-new]")) {
        const base = ensureCalendarDate();
        const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 10, 0);
        openApptDrawer("create", { startsAt: start.toISOString() });
      }
    });
  }
  if (calBody) {
    calBody.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const evt = event.target.closest("[data-appt-id]");
      if (evt) {
        const id = Number(evt.getAttribute("data-appt-id"));
        const appt = (state.appointments || []).find((item) => Number(item.id) === id);
        if (appt) openApptDrawer("edit", appt);
        return;
      }
      const goto = event.target.closest("[data-cal-goto]");
      if (goto) {
        state.calendarDate = calStartOfDay(new Date(goto.getAttribute("data-cal-goto")));
        state.calendarView = "day";
        renderCalendar();
        return;
      }
      const createEl = event.target.closest("[data-cal-create]");
      if (createEl) {
        openApptDrawer("create", { startsAt: createEl.getAttribute("data-cal-create") });
      }
    });
  }
  if (apptForm) {
    apptForm.addEventListener("submit", submitApptForm);
    const emailField = apptForm.elements.patientEmail;
    if (emailField) emailField.addEventListener("change", () => loadCustomerNotes(emailField.value));
  }
  if (apptCancelAppt) apptCancelAppt.addEventListener("click", cancelCurrentAppt);
  if (apptDrawer) {
    apptDrawer.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-drawer-close]")) closeApptDrawer();
    });
  }
  if (txnDrawer) {
    txnDrawer.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-txn-drawer-close]")) closeTxnDrawer();
    });
  }
  if (memberDrawer) {
    memberDrawer.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-member-drawer-close]")) closeMemberDrawer();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && memberConfirm && !memberConfirm.classList.contains("hidden")) closeMemberConfirm();
    if (event.key === "Escape" && apptDrawer && !apptDrawer.classList.contains("hidden")) closeApptDrawer();
    if (event.key === "Escape" && txnDrawer && !txnDrawer.classList.contains("hidden")) closeTxnDrawer();
    if (event.key === "Escape" && memberDrawer && !memberDrawer.classList.contains("hidden")) closeMemberDrawer();
  });
  // Central interaction feedback: haptic tap + ripple on prominent controls.
  document.addEventListener("pointerdown", (event) => {
    const control =
      event.target instanceof Element
        ? event.target.closest(".btn, .icon-btn, .chip-filter-btn, .tab, .subtab, .rail-nav-item")
        : null;
    if (!control || control.disabled) return;
    haptics("light");
    if (control.matches(".rail-nav-item, .btn.primary, .btn.accent")) {
      createRipple(event, control);
    }
  });
  window.addEventListener("resize", scheduleMetricsRender);
  const cardMenu = document.createElement("div");
  cardMenu.className = "card-menu hidden";
  cardMenu.innerHTML = `<button type="button" class="card-menu-item" data-card-download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>Als CSV herunterladen</button>`;
  document.body.appendChild(cardMenu);
  let cardMenuKind = "";
  const closeCardMenu = () => cardMenu.classList.add("hidden");
  const openCardMenu = (button, kind) => {
    cardMenuKind = kind;
    cardMenu.classList.remove("hidden");
    const rect = button.getBoundingClientRect();
    const menuW = cardMenu.offsetWidth || 200;
    cardMenu.style.left = `${Math.max(8, rect.right - menuW)}px`;
    cardMenu.style.top = `${rect.bottom + 6}px`;
  };
  cardMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-card-download]")) {
      if (cardMenuKind) exportDashboardCard(cardMenuKind);
      closeCardMenu();
    }
  });
  dashboardSection.addEventListener("click", (event) => {
    const route = event.target instanceof Element ? event.target.closest("[data-route-view]") : null;
    const routeIsButton = route instanceof HTMLButtonElement;
    const nestedControl = event.target instanceof Element ? event.target.closest("button, a, input, textarea, select, [data-export-kind]") : null;
    if (route && (routeIsButton || !nestedControl)) {
      navigateDashboardRoute(
        String(route.getAttribute("data-route-view") || "overview"),
        String(route.getAttribute("data-route-filter") || "")
      );
      return;
    }
    const button = event.target instanceof Element ? event.target.closest("button[data-export-kind]") : null;
    if (!button) return;
    const kind = String(button.getAttribute("data-export-kind") || "").trim();
    if (!kind) return;
    if (!cardMenu.classList.contains("hidden") && cardMenuKind === kind) {
      closeCardMenu();
      return;
    }
    openCardMenu(button, kind);
  });
  dashboardSection.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const route = event.target instanceof Element ? event.target.closest("[data-route-view]") : null;
    const routeIsButton = route instanceof HTMLButtonElement;
    const nestedControl = event.target instanceof Element ? event.target.closest("button, a, input, textarea, select, [data-export-kind]") : null;
    if (!route || (!routeIsButton && nestedControl)) return;
    event.preventDefault();
    navigateDashboardRoute(
      String(route.getAttribute("data-route-view") || "overview"),
      String(route.getAttribute("data-route-filter") || "")
    );
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && (event.target.closest("button[data-export-kind]") || event.target.closest(".card-menu"))) return;
    closeCardMenu();
  });
  window.addEventListener("scroll", closeCardMenu, true);
}

async function init() {
  bindEvents();
  setTab("login");
  setMetricsDays(metricsDaysSelect?.value || "30");
  if (metricsCompareSelect) {
    const initialMode = String(metricsCompareSelect.value || "none").toLowerCase();
    state.metricsCompareMode = ["none", "prev", "yoy"].includes(initialMode) ? initialMode : "none";
  }
  await bootstrapSession();
  applyBillingReturnToast();
}

init();
