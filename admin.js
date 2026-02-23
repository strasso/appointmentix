const API_BASE = "/api/admin";

const state = {
  admin: null,
  clinics: [],
  selectedClinicId: null,
  toastTimer: null,
};

const adminEmail = document.getElementById("adminEmail");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const adminLoginSection = document.getElementById("adminLoginSection");
const adminAppSection = document.getElementById("adminAppSection");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const adminConfigHint = document.getElementById("adminConfigHint");

const kpiGrid = document.getElementById("kpiGrid");
const clinicSearchInput = document.getElementById("clinicSearchInput");
const clinicSearchBtn = document.getElementById("clinicSearchBtn");
const clinicRefreshBtn = document.getElementById("clinicRefreshBtn");
const clinicsBody = document.getElementById("clinicsBody");

const clinicDetailEmpty = document.getElementById("clinicDetailEmpty");
const clinicDetailPanel = document.getElementById("clinicDetailPanel");
const clinicMeta = document.getElementById("clinicMeta");
const clinicSubscriptionForm = document.getElementById("clinicSubscriptionForm");
const clinicMembersBody = document.getElementById("clinicMembersBody");
const clinicSubscriptionsBody = document.getElementById("clinicSubscriptionsBody");

const leadsRefreshBtn = document.getElementById("leadsRefreshBtn");
const leadsBody = document.getElementById("leadsBody");

const toast = document.getElementById("toast");

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

function setLoginMessage(text, success = false) {
  adminLoginMessage.textContent = text;
  adminLoginMessage.classList.toggle("success", success);
}

function setAdminSession(admin) {
  state.admin = admin;

  if (!admin) {
    adminEmail.textContent = "Nicht angemeldet";
    adminLogoutBtn.classList.add("hidden");
    adminLoginSection.classList.remove("hidden");
    adminAppSection.classList.add("hidden");
    return;
  }

  adminEmail.textContent = admin.email;
  adminLogoutBtn.classList.remove("hidden");
  adminLoginSection.classList.add("hidden");
  adminAppSection.classList.remove("hidden");
}

async function api(path, options = {}) {
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
    const error = new Error(payload.error || "Serveranfrage fehlgeschlagen");
    error.status = response.status;
    throw error;
  }

  return payload;
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

function renderOverview(overview) {
  const cards = [
    ["Kliniken", overview.clinicsTotal],
    ["User", overview.usersTotal],
    ["Owner", overview.ownersTotal],
    ["Staff", overview.staffTotal],
    ["Aktive Kliniken", overview.activeClinics],
    ["Aktive Subscriptions", overview.subscriptionsActive],
    ["Leads (7 Tage)", overview.leadsLast7Days],
  ];

  kpiGrid.innerHTML = cards
    .map(
      ([label, value]) =>
        `<div class="kpi"><p class="key">${label}</p><p class="value">${value}</p></div>`
    )
    .join("");
}

function renderClinics(clinics) {
  clinicsBody.innerHTML = "";

  if (!clinics.length) {
    clinicsBody.innerHTML = '<tr><td colspan="4">Keine Kliniken gefunden.</td></tr>';
    return;
  }

  clinicsBody.innerHTML = clinics
    .map((clinic) => {
      const activeClass = state.selectedClinicId === clinic.id ? "active" : "";
      return `<tr class="clinic-row ${activeClass}" data-clinic-id="${clinic.id}">
        <td><strong>${clinic.name}</strong><br><small>${clinic.website || "-"}</small></td>
        <td>${clinic.ownerEmail || "-"}</td>
        <td>${clinic.subscriptionStatus}</td>
        <td>${clinic.membersCount} (${clinic.ownersCount} Owner / ${clinic.staffCount} Staff)</td>
      </tr>`;
    })
    .join("");
}

function renderClinicDetail(payload) {
  const clinic = payload.clinic;
  clinicDetailEmpty.classList.add("hidden");
  clinicDetailPanel.classList.remove("hidden");
  clinicSubscriptionForm.dataset.clinicId = String(clinic.id);
  clinicSubscriptionForm.elements.subscriptionStatus.value = clinic.subscriptionStatus || "inactive";

  clinicMeta.innerHTML = [
    ["Klinik", clinic.name],
    ["Website", clinic.website || "-"],
    ["Design", clinic.designPreset || "-"],
    ["Brand", clinic.brandColor || "-"],
    ["Akzent", clinic.accentColor || "-"],
    ["Calendly", clinic.calendlyUrl || "-"],
    ["Stripe Customer", clinic.stripeCustomerId || "-"],
    ["Stripe Subscription", clinic.stripeSubscriptionId || "-"],
    ["Erstellt", formatDate(clinic.createdAt)],
    ["Paid Sales", `${payload.paymentsSummary.paidCount} (${formatEuro(payload.paymentsSummary.paidTotalCents)})`],
  ]
    .map(([key, value]) => `<div class="detail-line"><span>${key}</span><strong>${value}</strong></div>`)
    .join("");

  const members = payload.members || [];
  clinicMembersBody.innerHTML = members.length
    ? members
        .map(
          (member) =>
            `<tr><td>${member.fullName}</td><td>${member.email}</td><td>${member.role}</td></tr>`
        )
        .join("")
    : '<tr><td colspan="3">Keine Mitglieder.</td></tr>';

  const subscriptions = payload.subscriptions || [];
  clinicSubscriptionsBody.innerHTML = subscriptions.length
    ? subscriptions
        .map(
          (subscription) =>
            `<tr><td>${subscription.planName || "-"}</td><td>${subscription.status || "-"}</td><td>${formatEuro(subscription.amountCents, subscription.currency)}</td><td>${subscription.userEmail || "-"}</td></tr>`
        )
        .join("")
    : '<tr><td colspan="4">Keine Subscriptions.</td></tr>';
}

function renderLeads(leads) {
  leadsBody.innerHTML = "";

  if (!leads.length) {
    leadsBody.innerHTML = '<tr><td colspan="5">Keine Leads vorhanden.</td></tr>';
    return;
  }

  leadsBody.innerHTML = leads
    .map(
      (lead) =>
        `<tr>
          <td>${formatDate(lead.createdAt)}</td>
          <td>${lead.companyName}</td>
          <td>${lead.fullName}<br><small>${lead.email}<br>${lead.phone}</small></td>
          <td>${lead.website || "-"}</td>
          <td>${lead.recurringRevenueBand}</td>
        </tr>`
    )
    .join("");
}

async function loadOverview() {
  const response = await api("/overview");
  renderOverview(response.overview || {});
}

async function loadClinics() {
  const q = clinicSearchInput.value.trim();
  const response = await api(`/clinics?limit=150&q=${encodeURIComponent(q)}`);
  state.clinics = response.clinics || [];

  if (
    state.selectedClinicId !== null
    && !state.clinics.some((clinic) => clinic.id === state.selectedClinicId)
  ) {
    state.selectedClinicId = null;
    clinicDetailPanel.classList.add("hidden");
    clinicDetailEmpty.classList.remove("hidden");
  }

  renderClinics(state.clinics);
}

async function loadClinicDetail(clinicId) {
  state.selectedClinicId = clinicId;
  renderClinics(state.clinics);

  const response = await api(`/clinics/${clinicId}`);
  renderClinicDetail(response);
}

async function loadLeads() {
  const response = await api("/leads?limit=80");
  renderLeads(response.leads || []);
}

async function refreshAdminData() {
  await Promise.all([loadOverview(), loadClinics(), loadLeads()]);
  if (state.selectedClinicId !== null) {
    await loadClinicDetail(state.selectedClinicId);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  setLoginMessage("");

  const formData = new FormData(adminLoginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await api("/login", { method: "POST", body: payload });
    setAdminSession(response.admin);
    setLoginMessage("Login erfolgreich", true);
    await refreshAdminData();
    showToast("Super-Admin Login aktiv");
  } catch (error) {
    setLoginMessage(error.message);
  }
}

async function handleLogout() {
  try {
    await api("/logout", { method: "POST" });
  } catch {
    // ignore
  }
  setAdminSession(null);
  state.selectedClinicId = null;
  showToast("Logout erfolgreich");
}

async function handleClinicTableClick(event) {
  const row = event.target.closest("tr[data-clinic-id]");
  if (!row) return;

  const clinicId = Number(row.dataset.clinicId);
  if (!clinicId) return;

  try {
    await loadClinicDetail(clinicId);
  } catch (error) {
    showToast(error.message);
  }
}

async function handleSubscriptionSave(event) {
  event.preventDefault();

  const clinicId = Number(clinicSubscriptionForm.dataset.clinicId || 0);
  if (!clinicId) {
    showToast("Keine Klinik ausgewählt.");
    return;
  }

  const formData = new FormData(clinicSubscriptionForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    await api(`/clinics/${clinicId}/subscription`, { method: "PUT", body: payload });
    await loadOverview();
    await loadClinics();
    await loadClinicDetail(clinicId);
    showToast("Subscription-Status aktualisiert");
  } catch (error) {
    showToast(error.message);
  }
}

async function bootstrap() {
  try {
    const config = await api("/config");
    if (!config.configured) {
      adminConfigHint.classList.remove("hidden");
      adminConfigHint.textContent = "Super-Admin ist noch nicht konfiguriert. Setze in .env: SUPERADMIN_EMAIL und SUPERADMIN_PASSWORD.";
    } else {
      adminConfigHint.classList.add("hidden");
      adminConfigHint.textContent = "";
    }
  } catch {
    // ignore
  }

  try {
    const response = await api("/me");
    setAdminSession(response.admin);
    await refreshAdminData();
  } catch {
    setAdminSession(null);
  }
}

function bindEvents() {
  adminLoginForm.addEventListener("submit", handleLogin);
  adminLogoutBtn.addEventListener("click", handleLogout);
  clinicsBody.addEventListener("click", handleClinicTableClick);
  clinicSubscriptionForm.addEventListener("submit", handleSubscriptionSave);
  clinicSearchBtn.addEventListener("click", () => loadClinics().catch((error) => showToast(error.message)));
  clinicRefreshBtn.addEventListener("click", () => refreshAdminData().catch((error) => showToast(error.message)));
  leadsRefreshBtn.addEventListener("click", () => loadLeads().catch((error) => showToast(error.message)));
  clinicSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    loadClinics().catch((error) => showToast(error.message));
  });
}

async function init() {
  bindEvents();
  await bootstrap();
}

init();
