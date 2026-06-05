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
  appointments: [],
  appointmentSummary: {},
  appointmentFilter: "upcoming",
  settingsSnapshot: null,
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
const appointmentStats = document.getElementById("appointmentStats");
const appointmentsBody = document.getElementById("appointmentsBody");
const appointmentSearch = document.getElementById("appointmentSearch");
const appointmentFilter = document.getElementById("appointmentFilter");
const viewEyebrow = document.getElementById("viewEyebrow");
const onboardingCard = document.getElementById("onboardingCard");
const onboardSteps = document.getElementById("onboardSteps");
const onboardProgressLabel = document.getElementById("onboardProgressLabel");
const kpiRevenue = document.getElementById("kpiRevenue");
const kpiMrr = document.getElementById("kpiMrr");
const kpiMembers = document.getElementById("kpiMembers");
const kpiAppUsers = document.getElementById("kpiAppUsers");
const railNavItems = Array.from(document.querySelectorAll(".rail-nav-item[data-view]"));
const viewPanels = Array.from(document.querySelectorAll(".view-panel[data-view-panel]"));
const VIEW_META = {
  overview: { eyebrow: "Performance Center" },
  patienten: { eyebrow: "Patienten" },
  termine: { eyebrow: "Termine" },
  analyse: { eyebrow: "Analyse" },
  katalog: { eyebrow: "Katalog & App" },
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
const brandColorPicker = document.getElementById("brandColorPicker");
const accentColorPicker = document.getElementById("accentColorPicker");
const membersBody = document.getElementById("membersBody");
const memberForm = document.getElementById("memberForm");
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

function syncColorFieldPair(textInput, colorInput, fallback) {
  if (!(textInput instanceof HTMLInputElement) || !(colorInput instanceof HTMLInputElement)) return;
  const syncFromText = () => {
    colorInput.value = normalizeHexColorForUi(textInput.value, fallback);
  };
  const syncFromColor = () => {
    textInput.value = colorInput.value;
  };
  syncFromText();
  textInput.addEventListener("input", syncFromText);
  colorInput.addEventListener("input", syncFromColor);
}

function buildSettingsPayload(extra = {}) {
  const payload = parseAuthForm(settingsForm);
  delete payload.brandColorPicker;
  delete payload.accentColorPicker;
  return { ...payload, ...extra };
}

function setAuthMessage(text, success = false) {
  authMessage.textContent = text;
  authMessage.classList.toggle("success", success);
}

function setTab(nextTab) {
  state.activeTab = nextTab;
  tabLogin.classList.toggle("active", nextTab === "login");
  tabRegister.classList.toggle("active", nextTab === "register");
  loginForm.classList.toggle("hidden", nextTab !== "login");
  registerForm.classList.toggle("hidden", nextTab !== "register");
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
    if (onboardingCard) onboardingCard.classList.add("hidden");
    setCatalogDisabled(true);
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
  saveCatalogBtn.disabled = !state.isOwner;
  if (importCatalogBtn) importCatalogBtn.disabled = !state.isOwner;
  memberForm.classList.toggle("hidden", !state.isOwner);
  startCheckoutBtn.classList.toggle("hidden", !state.isOwner);
  if (createCampaignBtn) createCampaignBtn.disabled = !state.isOwner;
  if (runDueCampaignsBtn) runDueCampaignsBtn.disabled = !state.isOwner;
  if (campaignForm) campaignForm.classList.toggle("hidden", !state.isOwner);
  setCatalogDisabled(!state.isOwner);
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
  settingsForm.elements.brandColor.value = settings.brandColor || "";
  settingsForm.elements.accentColor.value = settings.accentColor || "";
  settingsForm.elements.fontFamily.value = settings.fontFamily || "";
  if (settingsForm.elements.designPreset) {
    settingsForm.elements.designPreset.value = settings.designPreset || "clean";
  }
  settingsForm.elements.calendlyUrl.value = settings.calendlyUrl || "";
  if (brandColorPicker instanceof HTMLInputElement) {
    brandColorPicker.value = normalizeHexColorForUi(settings.brandColor, "#16A34A");
  }
  if (accentColorPicker instanceof HTMLInputElement) {
    accentColorPicker.value = normalizeHexColorForUi(settings.accentColor, "#EB6C13");
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

function normalizeForChart(values, scaleTo = 100) {
  const series = safeSeries(values);
  const max = Math.max(...series, 1);
  return series.map((value) => (Number(value || 0) / max) * scaleTo);
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

const CHART_BRAND = "#b56f80";

function hexToRgba(hex, alpha) {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(181, 111, 128, ${alpha})`;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawLineChart(canvas, values, options = {}) {
  const context = getCanvasContext(canvas);
  if (!context) return;
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  const paddingTop = Number(options.paddingTop ?? 14);
  const paddingBottom = Number(options.paddingBottom ?? 16);
  const paddingLeft = Number(options.paddingLeft ?? 6);
  const paddingRight = Number(options.paddingRight ?? 8);
  const chartWidth = Math.max(width - paddingLeft - paddingRight, 1);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 1);
  const series = safeSeries(values, 2);
  const lineColor = options.lineColor || CHART_BRAND;
  const baselineY = paddingTop + chartHeight;

  context.clearRect(0, 0, width, height);

  // hairline baseline
  context.beginPath();
  context.strokeStyle = "rgba(23, 21, 26, 0.08)";
  context.lineWidth = 1;
  context.moveTo(paddingLeft, baselineY + 0.5);
  context.lineTo(paddingLeft + chartWidth, baselineY + 0.5);
  context.stroke();

  // empty state — no data yet
  if (!(Math.max(...series) > 0)) {
    context.fillStyle = "rgba(108, 104, 115, 0.55)";
    context.font = "600 12px Inter, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(options.emptyText || "Noch keine Daten", paddingLeft + chartWidth / 2, paddingTop + chartHeight / 2);
    return;
  }

  const min = Number(options.minValue ?? 0);
  const max = Math.max(...series, 1);
  const range = Math.max(max - min, 1);
  const points = series.map((value, index) => {
    const x = paddingLeft + (index / Math.max(series.length - 1, 1)) * chartWidth;
    const ratio = (Number(value || 0) - min) / range;
    return [x, paddingTop + chartHeight - ratio * chartHeight];
  });

  // soft area fill
  const gradient = context.createLinearGradient(0, paddingTop, 0, baselineY);
  gradient.addColorStop(0, hexToRgba(lineColor, 0.18));
  gradient.addColorStop(1, hexToRgba(lineColor, 0));
  context.beginPath();
  context.moveTo(points[0][0], baselineY);
  points.forEach(([x, y]) => context.lineTo(x, y));
  context.lineTo(points[points.length - 1][0], baselineY);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  // primary line
  context.beginPath();
  context.strokeStyle = lineColor;
  context.lineWidth = Number(options.lineWidth ?? 2.25);
  context.lineJoin = "round";
  context.lineCap = "round";
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  // optional comparison line (dashed, muted)
  if (Array.isArray(options.secondary) && options.secondary.length) {
    const secondSeries = safeSeries(options.secondary, series.length);
    const secondMax = Math.max(...secondSeries, 1);
    const secondRange = Math.max(secondMax - min, 1);
    context.beginPath();
    context.strokeStyle = options.secondaryColor || "rgba(23, 21, 26, 0.22)";
    context.lineWidth = 1.6;
    context.setLineDash([4, 4]);
    secondSeries.forEach((value, index) => {
      const x = paddingLeft + (index / Math.max(secondSeries.length - 1, 1)) * chartWidth;
      const ratio = (Number(value || 0) - min) / secondRange;
      const y = paddingTop + chartHeight - ratio * chartHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
    context.setLineDash([]);
  }

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
}

function actionToFeedText(action) {
  const mapping = {
    "campaign.run": "Kampagne ausgeführt",
    "campaign.created": "Kampagne erstellt",
    "campaign.updated": "Kampagne geändert",
    "clinic.settings_updated": "Klinikdaten aktualisiert",
    "catalog.updated": "Katalog gespeichert",
    "catalog.imported": "Katalog importiert",
    "billing.checkout_started": "Checkout gestartet",
  };
  return mapping[action] || action || "Aktivität";
}

function renderLiveFeed(rows = []) {
  if (!liveActivityBody) return;
  const items = rows.slice(0, 8);
  if (!items.length) {
    liveActivityBody.innerHTML = "<li><span class='activity-title'>Noch keine Aktivitäten.</span></li>";
    return;
  }

  liveActivityBody.innerHTML = items
    .map((row) => {
      const actor = escapeHtml(row.actorName || row.actorEmail || "System");
      const action = escapeHtml(actionToFeedText(row.action));
      const when = escapeHtml(formatDate(row.createdAt));
      return `<li>
        <span class=\"activity-title\"><strong>${actor}</strong> • ${action}</span>
        <span class=\"activity-meta\">${when}</span>
      </li>`;
    })
    .join("");
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
      { label: "Mitgliedschaften", value: mrr, color: "#b56f80" },
      { label: "Rewards & Guthaben", value: rewardsCash, color: "#cf9aa6" },
      { label: "Angebotskampagnen", value: notificationOffers, color: "#8c6f9e" },
      { label: "Sonderpläne", value: customPlans, color: "#c98a5e" },
      { label: "Shop", value: shop, color: "#6b7280" },
    ];
  }

  // Harmonized brand palette — applied regardless of source so the
  // legend stays tonal (rose family + warm neutrals), not a rainbow.
  const SOURCE_PALETTE = ["#b56f80", "#cf9aa6", "#8c6f9e", "#c98a5e", "#6b7280", "#a98a72"];
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
  const timeseries = Array.isArray(state.analytics.timeseries) ? state.analytics.timeseries : [];
  const windowInfo = state.analytics.window || {};
  const memberships = state.membershipSummary || {};
  const members = state.members || [];
  const auditRows = state.auditLogs || [];
  const comparison = state.analytics.comparison || {};
  const periodInfo = state.analytics.period || {};
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

  const revenueByDay = safeSeries(timeseries.map((point) => Number(point.revenueCents || 0)));
  const purchasesByDay = safeSeries(timeseries.map((point) => Number(point.purchaseSuccess || 0)));
  const viewsByDay = safeSeries(timeseries.map((point) => Number(point.offerView || 0)));
  const appOpenByDay = safeSeries(timeseries.map((point) => Number(point.appOpen || 0)));
  const referralByDay = safeSeries(timeseries.map((point) => Number(point.rewardClaim || 0)));
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

  const latestRevenue = Number(summary.dailyProcessingCents || revenueByDay[revenueByDay.length - 1] || 0);
  const previousRevenue = revenueByDay[revenueByDay.length - 2] || 0;
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

  drawLineChart(chartDailyProcessing, normalizeForChart(purchasesByDay), {
    secondary: normalizeForChart(viewsByDay),
    lineColor: CHART_BRAND,
    secondaryColor: "#c4c8d0",
    stripeCount: 12,
  });
  drawLineChart(chartNetRevenue, normalizeForChart(revenueByDay), { lineColor: CHART_BRAND, stripeCount: 18 });
  drawLineChart(chartMRR, normalizeForChart(mrrSeries), { lineColor: CHART_BRAND, stripeCount: 12 });
  drawLineChart(chartAppUserLTV, normalizeForChart(appUserLtvSeries), { lineColor: CHART_BRAND, stripeCount: 14 });
  drawLineChart(chartClientLTV, normalizeForChart(clientLtvSeries), { lineColor: CHART_BRAND, stripeCount: 14 });
  drawLineChart(chartAppUsers, normalizeForChart(cumulativeSeries(appOpenByDay)), { lineColor: CHART_BRAND, stripeCount: 14 });
  drawLineChart(chartReferrals, normalizeForChart(cumulativeSeries(referralByDay)), { lineColor: CHART_BRAND, stripeCount: 14 });
  drawLineChart(chartVisits, normalizeForChart(appOpenByDay), { lineColor: CHART_BRAND, stripeCount: 14 });
  drawLineChart(chartReviews, normalizeForChart(cumulativeSeries(reviewByDay)), { lineColor: CHART_BRAND, stripeCount: 14 });

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
  return VIEW_META[raw] ? raw : "overview";
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
                <label class="cat-field">Preis (€)<input data-field="priceCents" data-unit="euro" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.priceCents))}" placeholder="110"></label>
                <label class="cat-field">Mitgliedspreis (€)<input data-field="memberPriceCents" data-unit="euro" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.memberPriceCents))}" placeholder="99"></label>
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
                <label class="cat-field">Preis (€ / Monat)<input data-field="priceCents" data-unit="euro" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.priceCents))}" placeholder="79"></label>
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
                <label class="cat-field cat-field-num">Wert (€)<input data-field="valueCents" data-unit="euro" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeAttr(centsToEuroInput(item.valueCents))}" placeholder="15"></label>
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

function renderMembers(members) {
  state.members = Array.isArray(members) ? members : [];
  if (!membersBody) {
    renderMetricsDashboard();
    return;
  }
  membersBody.innerHTML = "";
  if (!members.length) {
    membersBody.innerHTML = '<tr><td colspan="3">Noch keine Team-Mitglieder.</td></tr>';
    renderMetricsDashboard();
    return;
  }

  const rows = members
    .map(
      (member) =>
        `<tr><td>${member.fullName}</td><td>${member.email}</td><td>${member.role}</td></tr>`
    )
    .join("");
  membersBody.innerHTML = rows;
  renderMetricsDashboard();
}

function renderBillingStatus(subscription, canUsePlatform) {
  const statusLabel = canUsePlatform ? "Aktiv" : "Inaktiv";
  billingStatus.innerHTML = [
    ["Plan", subscription.planName || "-"],
    ["Status", `${subscription.status || "-"} (${statusLabel})`],
    ["Monatlicher Betrag", formatEuro(subscription.amountCents, subscription.currency)],
    ["Nächstes Periodenende", formatDate(subscription.currentPeriodEnd)],
    ["Stripe Subscription ID", subscription.stripeSubscriptionId || "-"],
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
          <td>${row.planName || "-"}</td>
          <td>${row.status || "-"}</td>
          <td>${formatEuro(row.amountCents, row.currency)}</td>
          <td>${formatDate(row.updatedAt || row.createdAt)}</td>
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

function renderCampaigns(rows = []) {
  campaignsBody.innerHTML = "";
  if (!rows.length) {
    campaignsBody.innerHTML = '<tr><td colspan="6">Noch keine Kampagnen vorhanden.</td></tr>';
    return;
  }

  campaignsBody.innerHTML = rows
    .map(
      (row) =>
        `<tr>
          <td>${row.name || "-"}</td>
          <td>${row.triggerType || "-"}</td>
          <td>${row.status || "-"}</td>
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
        </tr>`
    )
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
          <td>${formatDate(row.createdAt)}</td>
          <td>${row.action || "-"}</td>
          <td>${row.entityType || "-"}${row.entityId ? ` • ${row.entityId}` : ""}</td>
          <td>${row.actorName || row.actorEmail || "System"}</td>
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
  renderAppointments();
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

async function maybeAdoptWebsiteBranding(websiteSync) {
  const suggestedBranding = websiteSync?.suggestedBranding;
  if (!suggestedBranding || typeof suggestedBranding !== "object") return;

  const suggestedBrandColor = String(suggestedBranding.brandColor || "").trim();
  const suggestedAccentColor = String(suggestedBranding.accentColor || "").trim();
  const suggestedFontFamily = String(suggestedBranding.fontFamily || "").trim();
  const currentBrandColor = String(settingsForm.elements.brandColor?.value || "").trim();
  const currentFontFamily = String(settingsForm.elements.fontFamily?.value || "").trim();

  const wantsWebsiteColor = Boolean(suggestedBrandColor)
    && suggestedBrandColor.toLowerCase() !== currentBrandColor.toLowerCase()
    && window.confirm("Möchtest du die Markenfarbe von der Website übernehmen?");
  const wantsWebsiteFont = Boolean(suggestedFontFamily)
    && suggestedFontFamily !== currentFontFamily
    && window.confirm("Möchtest du die Schriftart von der Website übernehmen?");

  if (!wantsWebsiteColor && !wantsWebsiteFont) {
    return;
  }

  const followUpPayload = buildSettingsPayload({
    syncWebsiteCatalog: false,
    skipWebsiteImport: true,
    useWebsiteBrandColor: false,
    useWebsiteAccentColor: false,
    useWebsiteFontFamily: false,
  });

  if (wantsWebsiteColor) {
    followUpPayload.brandColor = suggestedBrandColor;
    if (suggestedAccentColor) {
      followUpPayload.accentColor = suggestedAccentColor;
    }
  }
  if (wantsWebsiteFont) {
    followUpPayload.fontFamily = suggestedFontFamily;
  }

  const response = await apiRequest("/clinic/settings", { method: "PUT", body: followUpPayload });
  await Promise.all([loadSettings(), loadAuditLogs()]);
  showToast("Website-Branding übernommen");
  return response;
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
  const website = String(settingsForm.elements.website?.value || "").trim();
  if (!website) {
    showToast("Bitte zuerst eine Website in den Klinik-Einstellungen speichern.");
    return;
  }

  try {
    importCatalogBtn.disabled = true;
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

async function handleCreateMember(event) {
  event.preventDefault();
  if (!state.isOwner) {
    showToast("Nur Owner können Staff anlegen.");
    return;
  }

  const payload = parseAuthForm(memberForm);
  payload.role = "staff";

  try {
    await apiRequest("/clinic/members", { method: "POST", body: payload });
    memberForm.reset();
    await Promise.all([loadMembers(), loadAuditLogs()]);
    showToast("Staff-User erstellt");
  } catch (error) {
    showToast(error.message);
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
  logoutBtn.addEventListener("click", handleLogout);
  settingsForm.addEventListener("submit", handleSettingsSave);
  syncColorFieldPair(settingsForm.elements.brandColor, brandColorPicker, "#16A34A");
  syncColorFieldPair(settingsForm.elements.accentColor, accentColorPicker, "#EB6C13");
  memberForm.addEventListener("submit", handleCreateMember);
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
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("button[data-days]");
      if (!(button instanceof HTMLElement)) return;
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
  saveCatalogBtn.addEventListener("click", saveCatalog);
  exportCatalogBtn.addEventListener("click", handleExportCatalog);
  importCatalogBtn.addEventListener("click", handleImportCatalogButton);
  if (importCatalogInput) {
    importCatalogInput.addEventListener("change", handleImportCatalogChange);
  }
  addCategoryBtn.addEventListener("click", () => addCatalogRow("categories"));
  addTreatmentBtn.addEventListener("click", () => addCatalogRow("treatments"));
  addMembershipBtn.addEventListener("click", () => addCatalogRow("memberships"));
  addRewardActionBtn.addEventListener("click", () => addCatalogRow("rewardActions"));
  addRewardRedeemBtn.addEventListener("click", () => addCatalogRow("rewardRedeems"));
  addHomeArticleBtn.addEventListener("click", () => addCatalogRow("homeArticles"));
  catalogForm.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest("button[data-remove-list]") : null;
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
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("button[data-run-campaign]")) {
      const campaignId = Number(target.getAttribute("data-run-campaign"));
      if (!Number.isFinite(campaignId) || campaignId <= 0) return;
      runCampaign(campaignId);
      return;
    }
    if (target.matches("button[data-toggle-campaign]")) {
      const campaignId = Number(target.getAttribute("data-toggle-campaign"));
      const nextStatus = String(target.getAttribute("data-next-status") || "").trim();
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
  // Central interaction feedback: haptic tap + ripple on prominent controls.
  document.addEventListener("pointerdown", (event) => {
    const control =
      event.target instanceof Element
        ? event.target.closest(".btn, .icon-btn, .chip-filter-btn, .tab, .rail-nav-item")
        : null;
    if (!control || control.disabled) return;
    haptics("light");
    if (control.matches(".rail-nav-item, .btn.primary, .btn.accent")) {
      createRipple(event, control);
    }
  });
  window.addEventListener("resize", scheduleMetricsRender);
  dashboardSection.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("button[data-export-kind]");
    if (!(button instanceof HTMLElement)) return;
    const kind = String(button.getAttribute("data-export-kind") || "").trim();
    if (!kind) return;
    exportDashboardCard(kind);
  });
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
