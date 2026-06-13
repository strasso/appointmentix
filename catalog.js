const API_BASE = "/api";

const state = {
  user: null,
  toastTimer: null,
  mediaItems: [],
  activeCategory: "all",
};

const editorSection = document.getElementById("editorSection");
const blockedSection = document.getElementById("blockedSection");
const blockedMessage = document.getElementById("blockedMessage");
const sessionLabel = document.getElementById("sessionLabel");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

const saveCatalogBtn = document.getElementById("saveCatalogBtn");
const autoGalleryBtn = document.getElementById("autoGalleryBtn");
const categoriesList = document.getElementById("categoriesList");
const treatmentsList = document.getElementById("treatmentsList");
const membershipsList = document.getElementById("membershipsList");
const rewardActionsList = document.getElementById("rewardActionsList");
const rewardRedeemsList = document.getElementById("rewardRedeemsList");
const homeArticlesList = document.getElementById("homeArticlesList");

const addCategoryBtn = document.getElementById("addCategoryBtn");
const addTreatmentBtn = document.getElementById("addTreatmentBtn");
const addMembershipBtn = document.getElementById("addMembershipBtn");
const addRewardActionBtn = document.getElementById("addRewardActionBtn");
const addRewardRedeemBtn = document.getElementById("addRewardRedeemBtn");
const addHomeArticleBtn = document.getElementById("addHomeArticleBtn");
const mediaGrid = document.getElementById("mediaGrid");
const mediaUploadInput = document.getElementById("mediaUploadInput");
const mediaUploadBtn = document.getElementById("mediaUploadBtn");
const refreshMediaBtn = document.getElementById("refreshMediaBtn");
const editorTabs = document.getElementById("editorTabs");
const categoryChips = document.getElementById("categoryChips");
const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
const categoryManage = document.getElementById("categoryManage");
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

async function uploadMediaFile(file) {
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
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    throw new Error(payload.error || "Bild-Upload fehlgeschlagen");
  }

  return payload;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function splitList(value) {
  return String(value || "")
    .split(/[\n,;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function joinList(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  raw.forEach((entry) => {
    const zoneId = normalizeBodyZoneId(entry);
    if (zoneId) seen.add(zoneId);
  });
  return BODY_ZONE_OPTIONS.map((item) => item.id).filter((zoneId) => seen.has(zoneId));
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

// Slug/ID helpers — IDs are generated automatically and never shown to the
// user. They stay stable once created so memberships keep referencing the
// right treatments.
function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ä", "ae").replaceAll("ö", "oe").replaceAll("ü", "ue").replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
function genId(prefix, name) {
  const base = slugify(name);
  const tail = Math.random().toString(36).slice(2, 7);
  return base ? `${prefix}-${base}-${tail}` : `${prefix}-${tail}`;
}

function getCategories() {
  return Array.from(categoriesList.querySelectorAll('[data-kind="category"]'))
    .map((row) => ({
      id: row.querySelector('[data-field="id"]')?.value.trim() || "",
      label: row.querySelector('[data-field="label"]')?.value.trim() || "",
    }))
    .filter((cat) => cat.id);
}

function categoryOptionsHtml(selectedId) {
  const target = displayCategoryId(selectedId);
  let matched = false;
  const options = getCategories()
    .map((cat) => {
      const isSel = displayCategoryId(cat.id) === target;
      if (isSel) matched = true;
      return `<option value="${escapeAttr(cat.id)}" ${isSel ? "selected" : ""}>${escapeAttr(cat.label || cat.id)}</option>`;
    })
    .join("");
  const placeholder = `<option value="" ${target ? "" : "selected"} disabled>Kategorie wählen …</option>`;
  // Preserve a set-but-unlisted category so saving never silently drops the item.
  const fallback = target && !matched
    ? `<option value="${escapeAttr(selectedId)}" selected>${escapeAttr(selectedId)}</option>`
    : "";
  return placeholder + fallback + options;
}

function renderCategoryChips() {
  if (!categoryChips) return;
  const cats = getCategories();
  const chip = (id, label) =>
    `<button type="button" class="cat-chip ${state.activeCategory === id ? "active" : ""}" data-cat="${escapeAttr(id)}">${escapeAttr(label)}</button>`;
  categoryChips.innerHTML = chip("all", "Alle") + cats.map((cat) => chip(cat.id, cat.label || cat.id)).join("");
}

function categoryCard(item = {}) {
  return `
    <div class="cat-manage-row" data-kind="category">
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <input class="cat-manage-label" data-field="label" value="${escapeAttr(item.label)}" placeholder="z. B. Gesicht">
      <button type="button" class="row-x" data-remove aria-label="Kategorie entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
  `;
}

function centsToEuroInput(cents) {
  const value = Number(cents || 0) / 100;
  return (Number.isInteger(value) ? String(value) : value.toFixed(2)).replace(".", ",");
}

function euroStepperHtml(field, valueCents, placeholder) {
  return `<span class="eur-stepper">
    <input data-field="${field}" data-unit="euro" data-price-input type="text" inputmode="decimal" autocomplete="off" value="${escapeAttr(centsToEuroInput(valueCents))}" placeholder="${placeholder}">
    <span class="eur-stepper-btns">
      <button type="button" class="eur-step" data-eur-step="1" tabindex="-1" aria-label="Erhöhen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg></button>
      <button type="button" class="eur-step" data-eur-step="-1" tabindex="-1" aria-label="Verringern"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
    </span>
  </span>`;
}

// Snap a raw increment to a clean step (10ct, 20ct, 50ct, 1€, 2€, …).
const EURO_NICE_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000];
function euroNiceStep(rawCents) {
  let step = EURO_NICE_STEPS[0];
  for (const candidate of EURO_NICE_STEPS) {
    if (rawCents >= candidate) step = candidate;
  }
  return step;
}

// Accelerated stepping with an ease-in curve: a tap nudges by 0,10 €, holding
// smoothly speeds up the increment (0,10 € → … → 20 €). Works from an empty field.
function euroStepControl(button) {
  const wrap = button.closest(".eur-stepper");
  const input = wrap && wrap.querySelector("input[data-price-input]");
  if (!input) return null;
  const dir = Number(button.getAttribute("data-eur-step")) || 1;
  const start = Date.now();
  const RAMP_MS = 3800;
  const apply = () => {
    const held = Date.now() - start;
    const progress = Math.min(held / RAMP_MS, 1);
    const eased = progress * progress * progress; // ease-in (cubic)
    const stepCents = euroNiceStep(10 + eased * (2000 - 10));
    const current = euroToCents(input.value); // empty/invalid → 0
    // Snap to the step grid in the travel direction so values stay clean
    // (e.g. holding into 1 € steps lands on whole euros, not 1,40).
    const next = dir > 0
      ? (Math.floor(current / stepCents) + 1) * stepCents
      : (Math.ceil(current / stepCents) - 1) * stepCents;
    input.value = centsToEuroInput(Math.max(0, next));
  };
  apply();
  let repeat = null;
  const delay = window.setTimeout(() => { repeat = window.setInterval(apply, 80); }, 300);
  return () => { window.clearTimeout(delay); if (repeat) window.clearInterval(repeat); };
}

// Keep euro inputs tidy: digits, one comma, max 2 decimals; dot becomes comma.
function sanitizeEuroField(element) {
  if (!element) return;
  let value = String(element.value).replace(/[^0-9.,]/g, "").replace(/\./g, ",");
  const firstComma = value.indexOf(",");
  if (firstComma !== -1) {
    const intPart = value.slice(0, firstComma);
    const decPart = value.slice(firstComma + 1).replace(/,/g, "").slice(0, 2);
    value = `${intPart},${decPart}`;
  }
  element.value = value;
}
function euroToCents(value) {
  const numeric = parseFloat(String(value ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric * 100)) : 0;
}

function treatmentPriceLabel(priceCents) {
  const cents = Number(priceCents || 0);
  if (cents <= 0) return "Preis offen";
  return `${centsToEuroInput(cents)} €`;
}

function treatmentCard(item = {}, opts = {}) {
  const name = String(item.name || "").trim();
  const desc = String(item.description || "").trim();
  const hasImg = Boolean(item.imageUrl);
  return `
    <div class="treat-row ${opts.open ? "open" : ""}" data-kind="treatment" data-cat="${escapeAttr(displayCategoryId(item.category))}">
      <div class="row-summary" data-row-toggle role="button" tabindex="0">
        <span class="row-thumb ${hasImg ? "" : "row-thumb-empty"}">${hasImg ? `<img src="${escapeAttr(item.imageUrl)}" alt="">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>`}</span>
        <span class="row-main">
          <span class="row-title" data-row-title>${escapeAttr(name) || "Neue Behandlung"}</span>
          <span class="row-sub" data-row-sub>${escapeAttr(desc)}</span>
        </span>
        <span class="row-price" data-row-price>${escapeAttr(treatmentPriceLabel(item.priceCents))}</span>
        <svg class="row-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div class="row-detail">
        <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
        <input type="hidden" data-field="imageUrl" value="${escapeAttr(item.imageUrl || "")}">
        <div class="detail-grid">
          <label class="fld fld-wide">Name<input data-field="name" value="${escapeAttr(item.name)}" placeholder="z. B. Basic Glow"></label>
          <label class="fld">Kategorie<select data-field="category">${categoryOptionsHtml(item.category)}</select></label>
          <label class="fld">Dauer (Min)<input data-field="durationMinutes" inputmode="numeric" value="${escapeAttr(item.durationMinutes)}" placeholder="60"></label>
          <label class="fld">Preis (€)${euroStepperHtml("priceCents", item.priceCents, "110")}</label>
          <label class="fld">Mitgliedspreis (€)${euroStepperHtml("memberPriceCents", item.memberPriceCents, "99")}</label>
        </div>
        <label class="fld">Beschreibung<textarea data-field="description" placeholder="Kurzbeschreibung für die App">${escapeAttr(item.description)}</textarea></label>
        <div class="fld">
          <span class="fld-label">Körperzonen</span>
          <div class="body-zone-picker">${renderBodyZoneChips(item.bodyZones)}</div>
        </div>
        <div class="fld">
          <span class="fld-label">Bild</span>
          <div class="img-row">
            <img class="treatment-preview ${item.imageUrl ? "" : "hidden"}" src="${escapeAttr(item.imageUrl || "")}" alt="Vorschau">
            <input type="file" class="hidden" accept="image/png,image/jpeg,image/webp,image/gif" data-upload-file>
            <button type="button" class="btn ghost btn-sm" data-upload-image><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>Bild hochladen</button>
            <span class="upload-filename" data-upload-name></span>
          </div>
        </div>
        <div class="row-detail-foot"><button type="button" class="row-delete" data-remove><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>Behandlung löschen</button></div>
      </div>
    </div>
  `;
}

function getTreatments() {
  return Array.from(treatmentsList.querySelectorAll('[data-kind="treatment"]'))
    .map((row) => ({
      id: row.querySelector('[data-field="id"]')?.value.trim() || "",
      name: row.querySelector('[data-field="name"]')?.value.trim() || "",
    }))
    .filter((t) => t.id);
}

function memberTreatmentChecksHtml(selectedIds = []) {
  const selected = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id).trim()).filter(Boolean));
  const treatments = getTreatments();
  const known = new Set(treatments.map((t) => t.id));
  // Keep any referenced treatment that isn't in the current list (e.g. not yet
  // re-rendered) so saving doesn't silently drop it.
  const orphans = [...selected].filter((id) => !known.has(id)).map((id) => ({ id, name: id }));
  const all = [...treatments, ...orphans];
  if (!all.length) {
    return `<p class="check-empty">Noch keine Behandlungen angelegt.</p>`;
  }
  return all
    .map(
      (t) => `<label class="check"><input type="checkbox" data-member-treatment value="${escapeAttr(t.id)}" ${selected.has(t.id) ? "checked" : ""}><span>${escapeAttr(t.name || t.id)}</span></label>`
    )
    .join("");
}

function membershipCard(item = {}) {
  return `
    <div class="edit-row" data-kind="membership">
      <button type="button" class="row-x" data-remove aria-label="Entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <div class="detail-grid">
        <label class="fld fld-wide">Name<input data-field="name" value="${escapeAttr(item.name)}" placeholder="z. B. Silber"></label>
        <label class="fld">Preis (€ / Monat)${euroStepperHtml("priceCents", item.priceCents, "79")}</label>
      </div>
      <div class="fld">
        <span class="fld-label">Inkludierte Behandlungen</span>
        <div class="check-grid">${memberTreatmentChecksHtml(item.includedTreatmentIds)}</div>
      </div>
      <label class="fld">Vorteile (mit Komma trennen)<textarea data-field="perks" placeholder="z. B. 10 % Rabatt, Gratis-Beratung">${escapeAttr(joinList(item.perks))}</textarea></label>
    </div>
  `;
}

function rewardActionCard(item = {}) {
  return `
    <div class="edit-row edit-row-inline" data-kind="reward-action">
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <label class="fld fld-wide">Aktion<input data-field="label" value="${escapeAttr(item.label)}" placeholder="z. B. Freundin werben"></label>
      <label class="fld fld-narrow">Punkte<input data-field="points" inputmode="numeric" value="${escapeAttr(item.points)}" placeholder="150"></label>
      <button type="button" class="row-x" data-remove aria-label="Entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
  `;
}

function rewardRedeemCard(item = {}) {
  return `
    <div class="edit-row edit-row-inline" data-kind="reward-redeem">
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <label class="fld fld-wide">Prämie<input data-field="label" value="${escapeAttr(item.label)}" placeholder="z. B. 15 € Guthaben"></label>
      <label class="fld fld-narrow">Benötigte Punkte<input data-field="requiredPoints" inputmode="numeric" value="${escapeAttr(item.requiredPoints)}" placeholder="250"></label>
      <label class="fld fld-narrow">Wert (€)${euroStepperHtml("valueCents", item.valueCents, "15")}</label>
      <button type="button" class="row-x" data-remove aria-label="Entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
  `;
}

function homeArticleCard(item = {}) {
  return `
    <div class="edit-row" data-kind="home-article">
      <button type="button" class="row-x" data-remove aria-label="Entfernen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <div class="detail-grid">
        <label class="fld fld-wide">Titel<input data-field="title" value="${escapeAttr(item.title)}" placeholder="z. B. Skin Refresh für jede Saison"></label>
        <label class="fld">Schlagwort<input data-field="tag" value="${escapeAttr(item.tag)}" placeholder="z. B. Tipps"></label>
      </div>
      <label class="fld">Text<textarea data-field="body" placeholder="Kurztext für die Startseite">${escapeAttr(item.body)}</textarea></label>
    </div>
  `;
}

function renderList(container, items, renderer, emptyText) {
  container.innerHTML = "";
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="empty">${emptyText}</p>`;
    return;
  }
  container.innerHTML = items.map((item) => renderer(item)).join("");
}

function applyCategoryFilter() {
  const active = state.activeCategory;
  treatmentsList.querySelectorAll('[data-kind="treatment"]').forEach((row) => {
    const cat = row.getAttribute("data-cat") || "";
    const show = active === "all" || displayCategoryId(cat) === displayCategoryId(active);
    row.classList.toggle("filtered-out", !show);
  });
}

function renderCatalog(catalog) {
  // Order matters: categories first (treatment selects read them), then
  // treatments (membership checkboxes read them).
  renderList(categoriesList, catalog.categories, categoryCard, "Noch keine Kategorien — lege deine erste an.");
  renderList(treatmentsList, catalog.treatments, treatmentCard, "Noch keine Behandlungen. Tippe oben rechts auf + Behandlung, um zu starten.");
  renderList(membershipsList, catalog.memberships, membershipCard, "Noch keine Mitgliedschaften angelegt.");
  renderList(rewardActionsList, catalog.rewardActions, rewardActionCard, "Noch keine Aktionen angelegt.");
  renderList(rewardRedeemsList, catalog.rewardRedeems, rewardRedeemCard, "Noch keine Prämien angelegt.");
  renderList(homeArticlesList, catalog.homeArticles, homeArticleCard, "Noch keine Beiträge angelegt.");
  renderCategoryChips();
  applyCategoryFilter();
}

function renderMediaLibrary(items) {
  mediaGrid.innerHTML = "";
  if (!Array.isArray(items) || !items.length) {
    mediaGrid.innerHTML = '<p class="empty">Noch keine Bilder hochgeladen.</p>';
    return;
  }

  mediaGrid.innerHTML = items
    .map(
      (item) => `
        <div class="media-item">
          <img class="media-thumb" src="${escapeAttr(item.url)}" alt="${escapeAttr(item.filename)}">
          <div class="media-meta">
            <p class="media-name">${escapeAttr(item.filename)}</p>
            <div class="media-actions">
              <button type="button" class="btn ghost" data-copy-url="${escapeAttr(item.url)}">URL kopieren</button>
              <button type="button" class="btn danger" data-delete-file="${escapeAttr(item.filename)}">Löschen</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function setTreatmentPreview(card, urlValue) {
  const preview = card.querySelector(".treatment-preview");
  if (!preview) return;
  const url = String(urlValue || "").trim();
  if (!url) {
    preview.classList.add("hidden");
    preview.removeAttribute("src");
    return;
  }
  preview.src = url;
  preview.classList.remove("hidden");
}

async function loadMediaLibrary() {
  const response = await apiRequest("/clinic/media");
  state.mediaItems = Array.isArray(response.items) ? response.items : [];
  renderMediaLibrary(state.mediaItems);
}

function collectCatalogFromDom() {
  const categories = Array.from(categoriesList.querySelectorAll('[data-kind="category"]'))
    .map((card) => ({
      id: storeCategoryId(card.querySelector('[data-field="id"]')?.value.trim() || ""),
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.label);

  const treatments = Array.from(treatmentsList.querySelectorAll('[data-kind="treatment"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
      category: storeCategoryId(card.querySelector('[data-field="category"]')?.value.trim() || ""),
      durationMinutes: toInt(card.querySelector('[data-field="durationMinutes"]')?.value, 30),
      priceCents: euroToCents(card.querySelector('[data-field="priceCents"]')?.value),
      memberPriceCents: euroToCents(card.querySelector('[data-field="memberPriceCents"]')?.value),
      description: card.querySelector('[data-field="description"]')?.value.trim() || "",
      imageUrl: card.querySelector('[data-field="imageUrl"]')?.value.trim() || "",
      bodyZones: Array.from(card.querySelectorAll('input[data-body-zone-option]:checked'))
        .map((input) => normalizeBodyZoneId(input.value))
        .filter(Boolean),
    }))
    .filter((item) => item.id && item.name && item.category);

  const memberships = Array.from(membershipsList.querySelectorAll('[data-kind="membership"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
      priceCents: euroToCents(card.querySelector('[data-field="priceCents"]')?.value),
      includedTreatmentIds: Array.from(card.querySelectorAll('input[data-member-treatment]:checked'))
        .map((input) => String(input.value || "").trim())
        .filter(Boolean),
      perks: splitList(card.querySelector('[data-field="perks"]')?.value),
    }))
    .filter((item) => item.id && item.name);

  const rewardActions = Array.from(rewardActionsList.querySelectorAll('[data-kind="reward-action"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
      points: toInt(card.querySelector('[data-field="points"]')?.value, 0),
    }))
    .filter((item) => item.id && item.label);

  const rewardRedeems = Array.from(rewardRedeemsList.querySelectorAll('[data-kind="reward-redeem"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
      requiredPoints: toInt(card.querySelector('[data-field="requiredPoints"]')?.value, 0),
      valueCents: euroToCents(card.querySelector('[data-field="valueCents"]')?.value),
    }))
    .filter((item) => item.id && item.label);

  const homeArticles = Array.from(homeArticlesList.querySelectorAll('[data-kind="home-article"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      tag: card.querySelector('[data-field="tag"]')?.value.trim() || "",
      title: card.querySelector('[data-field="title"]')?.value.trim() || "",
      body: card.querySelector('[data-field="body"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.title);

  return { categories, treatments, memberships, rewardActions, rewardRedeems, homeArticles };
}

function refreshTreatmentCategorySelects() {
  treatmentsList.querySelectorAll('select[data-field="category"]').forEach((sel) => {
    const current = sel.value;
    sel.innerHTML = categoryOptionsHtml(current);
  });
}

// Keep chips + treatment selects in sync whenever categories change.
function syncCategoryDependents() {
  const stillExists = getCategories().some((cat) => displayCategoryId(cat.id) === displayCategoryId(state.activeCategory));
  if (state.activeCategory !== "all" && !stillExists) state.activeCategory = "all";
  renderCategoryChips();
  refreshTreatmentCategorySelects();
  applyCategoryFilter();
}

function bindRemoveHandlers(container) {
  container.addEventListener("click", (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-remove]") : null;
    if (!btn || !container.contains(btn)) return;
    const row = btn.closest("[data-kind]");
    if (!row) return;
    const wasCategory = row.getAttribute("data-kind") === "category";
    row.remove();
    if (wasCategory) syncCategoryDependents();
  });
}

function disableEditor(disabled) {
  const controls = document.querySelectorAll(
    '#editorSection input, #editorSection textarea, #editorSection button'
  );
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function appendCard(container, html) {
  const emptyNode = container.querySelector(".empty");
  if (emptyNode) {
    emptyNode.remove();
  }
  container.insertAdjacentHTML("beforeend", html);
  return container.lastElementChild;
}

// Reflect a treatment row's fields back into its collapsed summary line.
function refreshTreatmentSummary(row) {
  if (!row) return;
  const get = (field) => row.querySelector(`[data-field="${field}"]`)?.value || "";
  const titleEl = row.querySelector("[data-row-title]");
  const subEl = row.querySelector("[data-row-sub]");
  const priceEl = row.querySelector("[data-row-price]");
  if (titleEl) titleEl.textContent = get("name").trim() || "Neue Behandlung";
  if (subEl) subEl.textContent = get("description").trim();
  if (priceEl) priceEl.textContent = treatmentPriceLabel(euroToCents(get("priceCents")));
  row.setAttribute("data-cat", displayCategoryId(get("category")));
  const thumb = row.querySelector(".row-thumb");
  const url = get("imageUrl").trim();
  if (thumb && url) {
    thumb.classList.remove("row-thumb-empty");
    thumb.innerHTML = `<img src="${escapeAttr(url)}" alt="">`;
  }
}

async function handleSave() {
  if (!state.user || state.user.role !== "owner") {
    showToast("Nur Owner können speichern.");
    return;
  }

  const payload = collectCatalogFromDom();
  saveCatalogBtn.disabled = true;
  try {
    await apiRequest("/clinic/catalog", { method: "PUT", body: payload });
    showToast("Katalog gespeichert");
  } catch (error) {
    showToast(error.message);
  } finally {
    saveCatalogBtn.disabled = false;
  }
}

async function handleAutoGallery() {
  if (!state.user || state.user.role !== "owner") {
    showToast("Nur Owner können Auto-Galerie anwenden.");
    return;
  }

  autoGalleryBtn.disabled = true;
  try {
    const response = await apiRequest("/clinic/catalog/auto-gallery", {
      method: "POST",
      body: { overwriteExisting: false },
    });
    renderCatalog(response.catalog || {});
    showToast("Auto-Galerie angewendet");
  } catch (error) {
    showToast(error.message || "Auto-Galerie fehlgeschlagen");
  } finally {
    autoGalleryBtn.disabled = false;
  }
}

async function handleCopyUrl(url) {
  const normalized = String(url || "").trim();
  if (!normalized) return;
  try {
    await navigator.clipboard.writeText(normalized);
    showToast("Bild-URL kopiert");
  } catch {
    showToast("Konnte URL nicht kopieren");
  }
}

async function handleDeleteMedia(filename) {
  if (!filename) return;
  if (!window.confirm(`Datei "${filename}" wirklich löschen?`)) return;
  try {
    await apiRequest("/clinic/media", {
      method: "DELETE",
      body: { filename },
    });
    await loadMediaLibrary();
    showToast("Bild gelöscht");
  } catch (error) {
    showToast(error.message);
  }
}

async function uploadSelectedMedia(file) {
  if (!file) return;
  const response = await uploadMediaFile(file);
  const filePayload = response.file || {};
  if (!filePayload.url) {
    throw new Error("Upload erfolgreich, aber keine URL erhalten.");
  }
  return filePayload.url;
}

async function handleLogout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // no-op
  }
  window.location.assign("/dashboard");
}

function showBlocked(message) {
  editorSection.classList.add("hidden");
  blockedSection.classList.remove("hidden");
  blockedMessage.textContent = message;
}

function showEditor(user) {
  blockedSection.classList.add("hidden");
  editorSection.classList.remove("hidden");
  sessionLabel.textContent = `${user.fullName} • ${user.clinicName} • ${user.role}`;
  logoutBtn.classList.remove("hidden");
}

async function init() {
  bindRemoveHandlers(categoriesList);
  bindRemoveHandlers(treatmentsList);
  bindRemoveHandlers(membershipsList);
  bindRemoveHandlers(rewardActionsList);
  bindRemoveHandlers(rewardRedeemsList);
  bindRemoveHandlers(homeArticlesList);

  document.addEventListener("input", (event) => {
    if (event.target instanceof HTMLElement && event.target.matches("[data-price-input]")) {
      sanitizeEuroField(event.target);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".eur-step") : null;
    if (!button) return;
    event.preventDefault();
    const stop = euroStepControl(button);
    if (!stop) return;
    const treatRow = button.closest(".treat-row");
    const end = () => {
      stop();
      if (treatRow) refreshTreatmentSummary(treatRow);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", end);
    };
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
    window.addEventListener("blur", end);
  });
  addCategoryBtn.addEventListener("click", () => {
    const node = appendCard(categoriesList, categoryCard({ id: genId("cat") }));
    syncCategoryDependents();
    node?.querySelector('[data-field="label"]')?.focus();
  });
  addTreatmentBtn.addEventListener("click", () => {
    const preCat = state.activeCategory !== "all" ? state.activeCategory : "";
    const node = appendCard(treatmentsList, treatmentCard({ id: genId("t"), category: preCat }, { open: true }));
    applyCategoryFilter();
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.querySelector('input[data-field="name"]')?.focus();
    }
  });
  addMembershipBtn.addEventListener("click", () => {
    const node = appendCard(membershipsList, membershipCard({ id: genId("m") }));
    node?.querySelector('input[data-field="name"]')?.focus();
  });
  addRewardActionBtn.addEventListener("click", () => {
    const node = appendCard(rewardActionsList, rewardActionCard({ id: genId("ra") }));
    node?.querySelector('input[data-field="label"]')?.focus();
  });
  addRewardRedeemBtn.addEventListener("click", () => {
    const node = appendCard(rewardRedeemsList, rewardRedeemCard({ id: genId("rr") }));
    node?.querySelector('input[data-field="label"]')?.focus();
  });
  addHomeArticleBtn.addEventListener("click", () => {
    const node = appendCard(homeArticlesList, homeArticleCard({ id: genId("art") }));
    node?.querySelector('input[data-field="title"]')?.focus();
  });

  // Section tabs (Behandlungen / Mitgliedschaften / …)
  editorTabs.addEventListener("click", (event) => {
    const btn = event.target instanceof Element ? event.target.closest(".editor-tab") : null;
    if (!btn) return;
    const tab = btn.getAttribute("data-tab");
    editorTabs.querySelectorAll(".editor-tab").forEach((t) => t.classList.toggle("active", t === btn));
    document.querySelectorAll(".editor-panel").forEach((p) => p.classList.toggle("hidden", p.getAttribute("data-panel") !== tab));
  });

  // Category filter chips
  categoryChips.addEventListener("click", (event) => {
    const chip = event.target instanceof Element ? event.target.closest(".cat-chip") : null;
    if (!chip) return;
    state.activeCategory = chip.getAttribute("data-cat") || "all";
    renderCategoryChips();
    applyCategoryFilter();
  });

  // Toggle the inline category editor
  manageCategoriesBtn.addEventListener("click", () => {
    const open = categoryManage.classList.toggle("hidden") === false;
    manageCategoriesBtn.classList.toggle("active", open);
  });

  // Renaming a category updates chips + treatment selects live
  categoriesList.addEventListener("input", (event) => {
    if (event.target instanceof Element && event.target.matches('[data-field="label"]')) {
      syncCategoryDependents();
    }
  });

  // Expand / collapse a treatment row
  treatmentsList.addEventListener("click", (event) => {
    const summary = event.target instanceof Element ? event.target.closest("[data-row-toggle]") : null;
    if (!summary) return;
    const row = summary.closest(".treat-row");
    if (!row) return;
    const willClose = row.classList.contains("open");
    row.classList.toggle("open");
    if (willClose) refreshTreatmentSummary(row);
  });
  treatmentsList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const summary = event.target instanceof Element ? event.target.closest("[data-row-toggle]") : null;
    if (!summary) return;
    event.preventDefault();
    summary.closest(".treat-row")?.classList.toggle("open");
  });

  // Keep summary + category filter in sync while editing a treatment
  treatmentsList.addEventListener("input", (event) => {
    const row = event.target instanceof Element ? event.target.closest(".treat-row") : null;
    if (row) refreshTreatmentSummary(row);
  });
  treatmentsList.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof Element && target.matches('select[data-field="category"]')) {
      const row = target.closest(".treat-row");
      if (row) { refreshTreatmentSummary(row); applyCategoryFilter(); }
    }
  });
  saveCatalogBtn.addEventListener("click", handleSave);
  autoGalleryBtn.addEventListener("click", handleAutoGallery);
  logoutBtn.addEventListener("click", handleLogout);
  mediaUploadBtn.addEventListener("click", () => mediaUploadInput.click());
  refreshMediaBtn.addEventListener("click", () => {
    loadMediaLibrary().catch((error) => showToast(error.message));
  });
  mediaUploadInput.addEventListener("change", async () => {
    const file = mediaUploadInput.files?.[0];
    if (!file) return;
    mediaUploadBtn.disabled = true;
    try {
      await uploadSelectedMedia(file);
      await loadMediaLibrary();
      showToast("Bild hochgeladen");
    } catch (error) {
      showToast(error.message);
    } finally {
      mediaUploadBtn.disabled = false;
      mediaUploadInput.value = "";
    }
  });
  mediaGrid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("button[data-copy-url]")) {
      const url = String(target.getAttribute("data-copy-url") || "");
      handleCopyUrl(url);
      return;
    }
    if (target.matches("button[data-delete-file]")) {
      const filename = String(target.getAttribute("data-delete-file") || "");
      handleDeleteMedia(filename);
    }
  });
  // Clicking the styled button just opens the (hidden) file dialog …
  treatmentsList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-upload-image]") : null;
    if (!button) return;
    const card = button.closest(".treat-row");
    const fileInput = card?.querySelector("input[data-upload-file]");
    if (fileInput instanceof HTMLInputElement) fileInput.click();
  });
  // … and picking a file uploads it straight away (no second click).
  treatmentsList.addEventListener("change", async (event) => {
    const fileInput = event.target instanceof Element ? event.target.closest("input[data-upload-file]") : null;
    if (!(fileInput instanceof HTMLInputElement)) return;
    const card = fileInput.closest(".treat-row");
    const file = fileInput.files?.[0];
    if (!card || !file) return;
    const button = card.querySelector("button[data-upload-image]");
    const nameEl = card.querySelector("[data-upload-name]");
    const previousLabel = button?.innerHTML;
    if (nameEl) nameEl.textContent = file.name;
    if (button) {
      button.disabled = true;
      button.textContent = "Lädt …";
    }
    try {
      const url = await uploadSelectedMedia(file);
      const urlInput = card.querySelector('input[data-field="imageUrl"]');
      if (urlInput instanceof HTMLInputElement) urlInput.value = url;
      setTreatmentPreview(card, url);
      refreshTreatmentSummary(card);
      await loadMediaLibrary();
      showToast("Behandlungsbild hochgeladen");
    } catch (error) {
      if (nameEl) nameEl.textContent = "";
      showToast(error.message);
    } finally {
      fileInput.value = "";
      if (button) {
        button.disabled = false;
        if (previousLabel) button.innerHTML = previousLabel;
      }
    }
  });

  try {
    const auth = await apiRequest("/auth/me");
    state.user = auth.user;
    if (!state.user) {
      showBlocked("Bitte zuerst im Dashboard einloggen.");
      return;
    }

    if (state.user.role !== "owner") {
      showBlocked("Nur Owner dürfen den visuellen Katalog-Editor nutzen.");
      return;
    }

    showEditor(state.user);
    const catalogResponse = await apiRequest("/clinic/catalog");
    renderCatalog(catalogResponse.catalog || {});
    try {
      await loadMediaLibrary();
    } catch (error) {
      mediaGrid.innerHTML = `<p class="empty">Medien konnten nicht geladen werden: ${escapeAttr(error.message || "Fehler")}</p>`;
    }
    disableEditor(false);
  } catch (error) {
    showBlocked(error.message || "Bitte zuerst im Dashboard einloggen.");
  }
}

init();
