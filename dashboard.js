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

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

const settingsForm = document.getElementById("settingsForm");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
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
const sideNavItems = Array.from(document.querySelectorAll(".side-nav-item[data-nav-target]"));

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
  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }
  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
    state.toastTimer = null;
  }, 2600);
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
    setCatalogDisabled(true);
    return;
  }

  sessionLabel.textContent = `${user.fullName} • ${user.clinicName} • ${user.role}`;
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");

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
  const controls = catalogForm.querySelectorAll("input, textarea, button.row-remove");
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
  settingsForm.elements.clinicName.value = settings.clinicName || "";
  settingsForm.elements.website.value = settings.website || "";
  settingsForm.elements.logoUrl.value = settings.logoUrl || "";
  settingsForm.elements.brandColor.value = settings.brandColor || "";
  settingsForm.elements.accentColor.value = settings.accentColor || "";
  settingsForm.elements.fontFamily.value = settings.fontFamily || "";
  settingsForm.elements.designPreset.value = settings.designPreset || "clean";
  settingsForm.elements.calendlyUrl.value = settings.calendlyUrl || "";

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

function drawLineChart(canvas, values, options = {}) {
  const context = getCanvasContext(canvas);
  if (!context) return;
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  const paddingTop = Number(options.paddingTop ?? 12);
  const paddingBottom = Number(options.paddingBottom ?? 20);
  const paddingLeft = Number(options.paddingLeft ?? 8);
  const paddingRight = Number(options.paddingRight ?? 8);
  const chartWidth = Math.max(width - paddingLeft - paddingRight, 1);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 1);
  const series = safeSeries(values, 2);
  const max = Math.max(...series, 1);
  const min = Number(options.minValue ?? 0);
  const range = Math.max(max - min, 1);

  context.clearRect(0, 0, width, height);

  const stripeCount = Number(options.stripeCount ?? Math.min(series.length, 18));
  if (stripeCount > 1) {
    const stripeWidth = chartWidth / stripeCount;
    for (let index = 0; index < stripeCount; index += 1) {
      if (index % 2 !== 0) continue;
      context.fillStyle = options.stripeColor || "#f2f4f7";
      context.fillRect(paddingLeft + index * stripeWidth, paddingTop, stripeWidth, chartHeight);
    }
  }

  context.beginPath();
  context.strokeStyle = options.lineColor || "#5b7cfa";
  context.lineWidth = Number(options.lineWidth ?? 2);
  context.lineJoin = "round";
  context.lineCap = "round";

  series.forEach((value, index) => {
    const x = paddingLeft + (index / Math.max(series.length - 1, 1)) * chartWidth;
    const ratio = (Number(value || 0) - min) / range;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();

  if (Array.isArray(options.secondary) && options.secondary.length) {
    const secondSeries = safeSeries(options.secondary, series.length);
    const secondMax = Math.max(...secondSeries, 1);
    const secondRange = Math.max(secondMax - min, 1);
    context.beginPath();
    context.strokeStyle = options.secondaryColor || "#c4c8d0";
    context.lineWidth = 1.8;
    context.setLineDash([5, 4]);
    secondSeries.forEach((value, index) => {
      const x = paddingLeft + (index / Math.max(secondSeries.length - 1, 1)) * chartWidth;
      const ratio = (Number(value || 0) - min) / secondRange;
      const y = paddingTop + chartHeight - ratio * chartHeight;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
    context.setLineDash([]);
  }
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
      { label: "Mitgliedschaften", value: mrr, color: "#16a34a" },
      { label: "Rewards & Guthaben", value: rewardsCash, color: "#5b7cfa" },
      { label: "Angebotskampagnen", value: notificationOffers, color: "#e91678" },
      { label: "Sonderpläne", value: customPlans, color: "#b54708" },
      { label: "Shop", value: shop, color: "#f59e0b" },
    ];
  }

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
  if (metricDailyProcessingValue) metricDailyProcessingValue.textContent = formatEuro(latestRevenue);
  if (metricDailyProcessingDelta && compareMode !== "none" && deltas.dailyProcessingCents) {
    setDeltaBadge(metricDailyProcessingDelta, deltas.dailyProcessingCents, compareMode);
  } else if (metricDailyProcessingDelta) {
    metricDailyProcessingDelta.classList.remove("hidden");
    metricDailyProcessingDelta.textContent = `${dailyDelta >= 0 ? "+" : ""}${dailyDelta.toFixed(1)}%`;
    metricDailyProcessingDelta.style.color = dailyDelta >= 0 ? "#027a48" : "#b42318";
    metricDailyProcessingDelta.style.background = dailyDelta >= 0 ? "#ecfdf3" : "#fef3f2";
    metricDailyProcessingDelta.style.borderColor = dailyDelta >= 0 ? "#abefc6" : "#fee4e2";
  }

  if (metricNetRevenueValue) metricNetRevenueValue.textContent = formatEuro(revenueTotal);
  if (metricMRRValue) metricMRRValue.textContent = formatEuro(mrrBase);
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
    lineColor: "#5b7cfa",
    secondaryColor: "#c4c8d0",
    stripeCount: 12,
  });
  drawLineChart(chartNetRevenue, normalizeForChart(revenueByDay), { lineColor: "#5b7cfa", stripeCount: 18 });
  drawLineChart(chartMRR, normalizeForChart(mrrSeries), { lineColor: "#5b7cfa", stripeCount: 12 });
  drawLineChart(chartAppUserLTV, normalizeForChart(appUserLtvSeries), { lineColor: "#5b7cfa", stripeCount: 14 });
  drawLineChart(chartClientLTV, normalizeForChart(clientLtvSeries), { lineColor: "#5b7cfa", stripeCount: 14 });
  drawLineChart(chartAppUsers, normalizeForChart(cumulativeSeries(appOpenByDay)), { lineColor: "#5b7cfa", stripeCount: 14 });
  drawLineChart(chartReferrals, normalizeForChart(cumulativeSeries(referralByDay)), { lineColor: "#5b7cfa", stripeCount: 14 });
  drawLineChart(chartVisits, normalizeForChart(appOpenByDay), { lineColor: "#5b7cfa", stripeCount: 14 });
  drawLineChart(chartReviews, normalizeForChart(cumulativeSeries(reviewByDay)), { lineColor: "#5b7cfa", stripeCount: 14 });

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

function scrollToDashboardTarget(targetId) {
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveSidebarItem(activeButton) {
  sideNavItems.forEach((button) => {
    button.classList.toggle("active", button === activeButton);
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
    treatments: Array.isArray(payload.treatments) ? payload.treatments : base.treatments,
    memberships: Array.isArray(payload.memberships) ? payload.memberships : base.memberships,
    rewardActions: Array.isArray(payload.rewardActions) ? payload.rewardActions : base.rewardActions,
    rewardRedeems: Array.isArray(payload.rewardRedeems) ? payload.rewardRedeems : base.rewardRedeems,
    homeArticles: Array.isArray(payload.homeArticles) ? payload.homeArticles : base.homeArticles,
  };
}

function renderCatalog() {
  const catalog = normalizeCatalogPayload(state.catalog);
  state.catalog = catalog;

  categoriesBody.innerHTML = catalog.categories
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="categories" data-field="id" value="${escapeAttr(item.id)}" placeholder="gesicht"></td>
          <td><input data-list="categories" data-field="label" value="${escapeAttr(item.label)}" placeholder="Gesicht"></td>
          <td><button class="row-remove" type="button" data-remove-list="categories" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.categories.length) {
    categoriesBody.innerHTML = '<tr><td colspan="3">Noch keine Kategorien.</td></tr>';
  }

  treatmentsBody.innerHTML = catalog.treatments
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="treatments" data-field="id" value="${escapeAttr(item.id)}" placeholder="t-basic-glow"></td>
          <td><input data-list="treatments" data-field="name" value="${escapeAttr(item.name)}" placeholder="Basic Glow"></td>
          <td><input data-list="treatments" data-field="category" value="${escapeAttr(item.category)}" placeholder="gesicht"></td>
          <td><input data-list="treatments" data-field="priceCents" value="${escapeAttr(item.priceCents)}" placeholder="11000"></td>
          <td><input data-list="treatments" data-field="memberPriceCents" value="${escapeAttr(item.memberPriceCents)}" placeholder="9900"></td>
          <td><input data-list="treatments" data-field="durationMinutes" value="${escapeAttr(item.durationMinutes)}" placeholder="60"></td>
          <td><input data-list="treatments" data-field="description" value="${escapeAttr(item.description)}" placeholder="Beschreibung"></td>
          <td><button class="row-remove" type="button" data-remove-list="treatments" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.treatments.length) {
    treatmentsBody.innerHTML = '<tr><td colspan="8">Noch keine Treatments.</td></tr>';
  }

  membershipsBody.innerHTML = catalog.memberships
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="memberships" data-field="id" value="${escapeAttr(item.id)}" placeholder="silber"></td>
          <td><input data-list="memberships" data-field="name" value="${escapeAttr(item.name)}" placeholder="MOMI Silber"></td>
          <td><input data-list="memberships" data-field="priceCents" value="${escapeAttr(item.priceCents)}" placeholder="7900"></td>
          <td><input data-list="memberships" data-field="includedTreatmentIds" value="${escapeAttr(joinCommaList(item.includedTreatmentIds))}" placeholder="t-basic-glow, t-med-peeling"></td>
          <td><input data-list="memberships" data-field="perks" value="${escapeAttr(joinCommaList(item.perks))}" placeholder="Perk 1, Perk 2"></td>
          <td><button class="row-remove" type="button" data-remove-list="memberships" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.memberships.length) {
    membershipsBody.innerHTML = '<tr><td colspan="6">Noch keine Mitgliedschaften.</td></tr>';
  }

  rewardActionsBody.innerHTML = catalog.rewardActions
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="rewardActions" data-field="id" value="${escapeAttr(item.id)}" placeholder="referral"></td>
          <td><input data-list="rewardActions" data-field="label" value="${escapeAttr(item.label)}" placeholder="Freund:in werben"></td>
          <td><input data-list="rewardActions" data-field="points" value="${escapeAttr(item.points)}" placeholder="150"></td>
          <td><button class="row-remove" type="button" data-remove-list="rewardActions" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.rewardActions.length) {
    rewardActionsBody.innerHTML = '<tr><td colspan="4">Noch keine Reward Aktionen.</td></tr>';
  }

  rewardRedeemsBody.innerHTML = catalog.rewardRedeems
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="rewardRedeems" data-field="id" value="${escapeAttr(item.id)}" placeholder="r15"></td>
          <td><input data-list="rewardRedeems" data-field="label" value="${escapeAttr(item.label)}" placeholder="15 EUR Guthaben"></td>
          <td><input data-list="rewardRedeems" data-field="requiredPoints" value="${escapeAttr(item.requiredPoints)}" placeholder="250"></td>
          <td><input data-list="rewardRedeems" data-field="valueCents" value="${escapeAttr(item.valueCents)}" placeholder="1500"></td>
          <td><button class="row-remove" type="button" data-remove-list="rewardRedeems" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.rewardRedeems.length) {
    rewardRedeemsBody.innerHTML = '<tr><td colspan="5">Noch keine Einlösungen.</td></tr>';
  }

  homeArticlesBody.innerHTML = catalog.homeArticles
    .map(
      (item, index) =>
        `<tr>
          <td><input data-list="homeArticles" data-field="id" value="${escapeAttr(item.id)}" placeholder="art-1"></td>
          <td><input data-list="homeArticles" data-field="tag" value="${escapeAttr(item.tag)}" placeholder="Education"></td>
          <td><input data-list="homeArticles" data-field="title" value="${escapeAttr(item.title)}" placeholder="Titel"></td>
          <td><input data-list="homeArticles" data-field="body" value="${escapeAttr(item.body)}" placeholder="Kurztext"></td>
          <td><button class="row-remove" type="button" data-remove-list="homeArticles" data-index="${index}">Entfernen</button></td>
        </tr>`
    )
    .join("");
  if (!catalog.homeArticles.length) {
    homeArticlesBody.innerHTML = '<tr><td colspan="5">Noch keine Home Artikel.</td></tr>';
  }

  setCatalogDisabled(!state.isOwner);
}

function syncCatalogStateFromDom() {
  const categories = Array.from(categoriesBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const label = row.querySelector('input[data-field="label"]')?.value.trim() || "";
      return { id, label };
    })
    .filter((item) => item.id && item.label);

  const treatments = Array.from(treatmentsBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const name = row.querySelector('input[data-field="name"]')?.value.trim() || "";
      const category = row.querySelector('input[data-field="category"]')?.value.trim() || "";
      const description = row.querySelector('input[data-field="description"]')?.value.trim() || "";
      return {
        id,
        name,
        category,
        priceCents: toInt(row.querySelector('input[data-field="priceCents"]')?.value, 0),
        memberPriceCents: toInt(row.querySelector('input[data-field="memberPriceCents"]')?.value, 0),
        durationMinutes: toInt(row.querySelector('input[data-field="durationMinutes"]')?.value, 0),
        description,
      };
    })
    .filter((item) => item.id && item.name && item.category);

  const memberships = Array.from(membershipsBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const name = row.querySelector('input[data-field="name"]')?.value.trim() || "";
      return {
        id,
        name,
        priceCents: toInt(row.querySelector('input[data-field="priceCents"]')?.value, 0),
        includedTreatmentIds: splitCommaList(row.querySelector('input[data-field="includedTreatmentIds"]')?.value),
        perks: splitCommaList(row.querySelector('input[data-field="perks"]')?.value),
      };
    })
    .filter((item) => item.id && item.name);

  const rewardActions = Array.from(rewardActionsBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const label = row.querySelector('input[data-field="label"]')?.value.trim() || "";
      return {
        id,
        label,
        points: toInt(row.querySelector('input[data-field="points"]')?.value, 0),
      };
    })
    .filter((item) => item.id && item.label);

  const rewardRedeems = Array.from(rewardRedeemsBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const label = row.querySelector('input[data-field="label"]')?.value.trim() || "";
      return {
        id,
        label,
        requiredPoints: toInt(row.querySelector('input[data-field="requiredPoints"]')?.value, 0),
        valueCents: toInt(row.querySelector('input[data-field="valueCents"]')?.value, 0),
      };
    })
    .filter((item) => item.id && item.label);

  const homeArticles = Array.from(homeArticlesBody.querySelectorAll("tr"))
    .map((row) => {
      const id = row.querySelector('input[data-field="id"]')?.value.trim() || "";
      const title = row.querySelector('input[data-field="title"]')?.value.trim() || "";
      return {
        id,
        tag: row.querySelector('input[data-field="tag"]')?.value.trim() || "",
        title,
        body: row.querySelector('input[data-field="body"]')?.value.trim() || "",
      };
    })
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

async function loadPatientMemberships() {
  const response = await apiRequest("/clinic/patient-memberships?limit=200");
  state.patientMemberships = Array.isArray(response.memberships) ? response.memberships : [];
  if (response.summary && typeof response.summary === "object") {
    state.membershipSummary = response.summary;
  }
  renderMetricsDashboard();
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
  importCatalogInput.click();
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
    loadCatalog(),
    loadCampaigns(),
    loadAuditLogs(),
  ]);
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

  const payload = parseAuthForm(settingsForm);

  try {
    saveSettingsBtn.disabled = true;
    await apiRequest("/clinic/settings", { method: "PUT", body: payload });
    await Promise.all([loadSettings(), loadAuditLogs()]);
    showToast("Einstellungen gespeichert");
  } catch (error) {
    showToast(error.message);
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
  importCatalogInput.addEventListener("change", handleImportCatalogChange);
  addCategoryBtn.addEventListener("click", () => addCatalogRow("categories"));
  addTreatmentBtn.addEventListener("click", () => addCatalogRow("treatments"));
  addMembershipBtn.addEventListener("click", () => addCatalogRow("memberships"));
  addRewardActionBtn.addEventListener("click", () => addCatalogRow("rewardActions"));
  addRewardRedeemBtn.addEventListener("click", () => addCatalogRow("rewardRedeems"));
  addHomeArticleBtn.addEventListener("click", () => addCatalogRow("homeArticles"));
  catalogForm.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("button[data-remove-list]")) return;
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
  sideNavItems.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSidebarItem(button);
      const targetId = String(button.getAttribute("data-nav-target") || "").trim();
      scrollToDashboardTarget(targetId);
    });
  });
  window.addEventListener("resize", () => {
    renderMetricsDashboard();
  });
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
