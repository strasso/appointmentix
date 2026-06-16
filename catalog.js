const API_BASE = "/api";

const state = {
  user: null,
  toastTimer: null,
  mediaItems: [],
};

const editorSection = document.getElementById("editorSection");
const blockedSection = document.getElementById("blockedSection");
const blockedMessage = document.getElementById("blockedMessage");
const sessionLabel = document.getElementById("sessionLabel");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

const saveCatalogBtn = document.getElementById("saveCatalogBtn");
const autoGalleryBtn = document.getElementById("autoGalleryBtn");
const importWebsiteBtn = document.getElementById("importWebsiteBtn");
const exportCatalogBtn = document.getElementById("exportCatalogBtn");
const categoriesList = document.getElementById("categoriesList");
const treatmentsList = document.getElementById("treatmentsList");
const membershipsList = document.getElementById("membershipsList");
const rewardActionsList = document.getElementById("rewardActionsList");
const rewardRedeemsList = document.getElementById("rewardRedeemsList");
const homeArticlesList = document.getElementById("homeArticlesList");

const packagesList = document.getElementById("packagesList");
const productsList = document.getElementById("productsList");
const addPackageBtn = document.getElementById("addPackageBtn");
const addProductBtn = document.getElementById("addProductBtn");

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

function categoryCard(item = {}) {
  return `
    <div class="item-card" data-kind="category">
      <div class="field-grid-2">
        <label>ID
          <input data-field="id" value="${escapeAttr(displayCategoryId(item.id))}" placeholder="gesicht">
        </label>
        <label>Label
          <input data-field="label" value="${escapeAttr(item.label)}" placeholder="Gesicht">
        </label>
      </div>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
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

function treatmentCard(item = {}) {
  return `
    <div class="item-card" data-kind="treatment">
      <div class="field-grid">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="t-basic-glow">
        </label>
        <label>Name
          <input data-field="name" value="${escapeAttr(item.name)}" placeholder="Basic Glow">
        </label>
        <label>Kategorie-ID
          <input data-field="category" value="${escapeAttr(displayCategoryId(item.category))}" placeholder="gesicht">
        </label>
        <label>Dauer (Min)
          <input data-field="durationMinutes" value="${escapeAttr(item.durationMinutes)}" placeholder="60">
        </label>
      </div>
      <div class="field-grid-2">
        <label>Preis (€)
          ${euroStepperHtml("priceCents", item.priceCents, "110")}
        </label>
        <label>Mitgliedspreis (€)
          ${euroStepperHtml("memberPriceCents", item.memberPriceCents, "99")}
        </label>
      </div>
      <label>Beschreibung
        <textarea data-field="description" placeholder="Kurzbeschreibung">${escapeAttr(item.description)}</textarea>
      </label>
      <div>
        <label>Body-Zonen</label>
        <div class="body-zone-picker">
          ${renderBodyZoneChips(item.bodyZones)}
        </div>
      </div>
      <div class="field-grid-2">
        <label>Bild URL
          <input data-field="imageUrl" value="${escapeAttr(item.imageUrl)}" placeholder="/uploads/clinic_x/beispiel.jpg">
        </label>
        <div>
          <img class="treatment-preview ${item.imageUrl ? "" : "hidden"}" src="${escapeAttr(item.imageUrl || "")}" alt="Treatment Vorschau">
          <div class="upload-row">
            <input type="file" class="hidden" accept="image/png,image/jpeg,image/webp,image/gif" data-upload-file>
            <button type="button" class="btn ghost btn-sm" data-upload-image><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>Bild hochladen</button>
            <span class="upload-filename" data-upload-name></span>
          </div>
        </div>
      </div>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function membershipCard(item = {}) {
  return `
    <div class="item-card" data-kind="membership">
      <div class="field-grid-3">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="silber">
        </label>
        <label>Name
          <input data-field="name" value="${escapeAttr(item.name)}" placeholder="MOMI Silber">
        </label>
        <label>Preis (€ / Monat)
          ${euroStepperHtml("priceCents", item.priceCents, "79")}
        </label>
      </div>
      <label>Inkludierte Treatment IDs (Komma oder Zeile)
        <textarea data-field="includedTreatmentIds" placeholder="t-basic-glow, t-med-peeling">${escapeAttr(joinList(item.includedTreatmentIds))}</textarea>
      </label>
      <label>Perks (Komma oder Zeile)
        <textarea data-field="perks" placeholder="Perk 1, Perk 2">${escapeAttr(joinList(item.perks))}</textarea>
      </label>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function rewardActionCard(item = {}) {
  return `
    <div class="item-card" data-kind="reward-action">
      <div class="field-grid-3">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="referral">
        </label>
        <label>Label
          <input data-field="label" value="${escapeAttr(item.label)}" placeholder="Freund:in werben">
        </label>
        <label>Punkte
          <input data-field="points" value="${escapeAttr(item.points)}" placeholder="150">
        </label>
      </div>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function rewardRedeemCard(item = {}) {
  return `
    <div class="item-card" data-kind="reward-redeem">
      <div class="field-grid">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="r15">
        </label>
        <label>Label
          <input data-field="label" value="${escapeAttr(item.label)}" placeholder="15 EUR Guthaben">
        </label>
        <label>Benötigte Punkte
          <input data-field="requiredPoints" value="${escapeAttr(item.requiredPoints)}" placeholder="250">
        </label>
        <label>Wert (€)
          ${euroStepperHtml("valueCents", item.valueCents, "15")}
        </label>
      </div>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function homeArticleCard(item = {}) {
  return `
    <div class="item-card" data-kind="home-article">
      <div class="field-grid-3">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="art-1">
        </label>
        <label>Tag
          <input data-field="tag" value="${escapeAttr(item.tag)}" placeholder="Education">
        </label>
        <label>Titel
          <input data-field="title" value="${escapeAttr(item.title)}" placeholder="Titel">
        </label>
      </div>
      <label>Text
        <textarea data-field="body" placeholder="Kurztext">${escapeAttr(item.body)}</textarea>
      </label>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
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

// IDs for packages/products are generated automatically and never shown.
function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function packageTreatmentChecksHtml(selectedIds = []) {
  const selected = new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id).trim()).filter(Boolean));
  const treatments = Array.from(treatmentsList.querySelectorAll('.item-card[data-kind="treatment"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
    }))
    .filter((t) => t.id);
  const known = new Set(treatments.map((t) => t.id));
  const orphans = [...selected].filter((id) => !known.has(id)).map((id) => ({ id, name: id }));
  const all = [...treatments, ...orphans];
  if (!all.length) return '<p class="empty">Erst Behandlungen anlegen, dann hier auswählen.</p>';
  // Same toggle-pill design as the Body-Zonen in the treatment editor: hidden
  // checkbox, whole pill toggles, selected = solid rose. The list is built from
  // the clinic's own treatments, so it is never a fixed set of terms.
  return all
    .map(
      (t) => `<label class="body-zone-chip ${selected.has(t.id) ? "active" : ""}"><input type="checkbox" data-package-treatment value="${escapeAttr(t.id)}" ${selected.has(t.id) ? "checked" : ""}><span>${escapeAttr(t.name || t.id)}</span></label>`
    )
    .join("");
}

function imageFieldHtml(item = {}) {
  return `
    <div class="field-grid-2">
      <label>Bild URL
        <input data-field="imageUrl" value="${escapeAttr(item.imageUrl)}" placeholder="/uploads/clinic_x/beispiel.jpg">
      </label>
      <div>
        <img class="treatment-preview ${item.imageUrl ? "" : "hidden"}" src="${escapeAttr(item.imageUrl || "")}" alt="Vorschau">
        <div class="upload-row">
          <input type="file" class="hidden" accept="image/png,image/jpeg,image/webp,image/gif" data-upload-file>
          <button type="button" class="btn ghost btn-sm" data-upload-image><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>Bild hochladen</button>
        </div>
      </div>
    </div>`;
}

function packageCard(item = {}) {
  return `
    <div class="item-card" data-kind="package">
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <div class="field-grid-2">
        <label>Name
          <input data-field="name" value="${escapeAttr(item.name)}" placeholder="z. B. Glow-Paket">
        </label>
        <label>Preis (€)
          ${euroStepperHtml("priceCents", item.priceCents, "250")}
        </label>
      </div>
      <label>Beschreibung
        <textarea data-field="description" placeholder="Kurzbeschreibung">${escapeAttr(item.description)}</textarea>
      </label>
      <div>
        <label>Inkludierte Behandlungen</label>
        <div class="body-zone-picker">${packageTreatmentChecksHtml(item.includedTreatmentIds)}</div>
      </div>
      ${imageFieldHtml(item)}
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function productCard(item = {}) {
  return `
    <div class="item-card" data-kind="product">
      <input type="hidden" data-field="id" value="${escapeAttr(item.id || "")}">
      <div class="field-grid-2">
        <label>Name
          <input data-field="name" value="${escapeAttr(item.name)}" placeholder="z. B. Vitamin-C-Serum">
        </label>
        <label>Preis (€)
          ${euroStepperHtml("priceCents", item.priceCents, "49")}
        </label>
      </div>
      <label>Beschreibung
        <textarea data-field="description" placeholder="Kurzbeschreibung">${escapeAttr(item.description)}</textarea>
      </label>
      ${imageFieldHtml(item)}
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
}

function renderCatalog(catalog) {
  renderList(categoriesList, catalog.categories, categoryCard, "Noch keine Kategorien.");
  renderList(treatmentsList, catalog.treatments, treatmentCard, "Noch keine Treatments.");
  renderList(membershipsList, catalog.memberships, membershipCard, "Noch keine Memberships.");
  renderList(rewardActionsList, catalog.rewardActions, rewardActionCard, "Noch keine Reward Aktionen.");
  renderList(rewardRedeemsList, catalog.rewardRedeems, rewardRedeemCard, "Noch keine Reward Einlösungen.");
  renderList(homeArticlesList, catalog.homeArticles, homeArticleCard, "Noch keine Home Artikel.");
  // Packages read the current treatments for their checkboxes, so render after treatments.
  if (packagesList) renderList(packagesList, catalog.packages, packageCard, "Noch keine Pakete. Tippe oben rechts auf + Paket.");
  if (productsList) renderList(productsList, catalog.products, productCard, "Noch keine Produkte. Tippe oben rechts auf + Produkt.");
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
  const categories = Array.from(categoriesList.querySelectorAll('.item-card[data-kind="category"]'))
    .map((card) => ({
      id: storeCategoryId(card.querySelector('[data-field="id"]')?.value.trim() || ""),
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.label);

  const treatments = Array.from(treatmentsList.querySelectorAll('.item-card[data-kind="treatment"]'))
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

  const memberships = Array.from(membershipsList.querySelectorAll('.item-card[data-kind="membership"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
      priceCents: euroToCents(card.querySelector('[data-field="priceCents"]')?.value),
      includedTreatmentIds: splitList(card.querySelector('[data-field="includedTreatmentIds"]')?.value),
      perks: splitList(card.querySelector('[data-field="perks"]')?.value),
    }))
    .filter((item) => item.id && item.name);

  const rewardActions = Array.from(rewardActionsList.querySelectorAll('.item-card[data-kind="reward-action"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
      points: toInt(card.querySelector('[data-field="points"]')?.value, 0),
    }))
    .filter((item) => item.id && item.label);

  const rewardRedeems = Array.from(rewardRedeemsList.querySelectorAll('.item-card[data-kind="reward-redeem"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
      requiredPoints: toInt(card.querySelector('[data-field="requiredPoints"]')?.value, 0),
      valueCents: euroToCents(card.querySelector('[data-field="valueCents"]')?.value),
    }))
    .filter((item) => item.id && item.label);

  const homeArticles = Array.from(homeArticlesList.querySelectorAll('.item-card[data-kind="home-article"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      tag: card.querySelector('[data-field="tag"]')?.value.trim() || "",
      title: card.querySelector('[data-field="title"]')?.value.trim() || "",
      body: card.querySelector('[data-field="body"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.title);

  const packages = packagesList
    ? Array.from(packagesList.querySelectorAll('.item-card[data-kind="package"]'))
        .map((card) => ({
          id: card.querySelector('[data-field="id"]')?.value.trim() || "",
          name: card.querySelector('[data-field="name"]')?.value.trim() || "",
          priceCents: euroToCents(card.querySelector('[data-field="priceCents"]')?.value),
          description: card.querySelector('[data-field="description"]')?.value.trim() || "",
          imageUrl: card.querySelector('[data-field="imageUrl"]')?.value.trim() || "",
          includedTreatmentIds: Array.from(card.querySelectorAll('input[data-package-treatment]:checked'))
            .map((input) => String(input.value || "").trim())
            .filter(Boolean),
        }))
        .filter((item) => item.id && item.name)
    : [];

  const products = productsList
    ? Array.from(productsList.querySelectorAll('.item-card[data-kind="product"]'))
        .map((card) => ({
          id: card.querySelector('[data-field="id"]')?.value.trim() || "",
          name: card.querySelector('[data-field="name"]')?.value.trim() || "",
          priceCents: euroToCents(card.querySelector('[data-field="priceCents"]')?.value),
          description: card.querySelector('[data-field="description"]')?.value.trim() || "",
          imageUrl: card.querySelector('[data-field="imageUrl"]')?.value.trim() || "",
        }))
        .filter((item) => item.id && item.name)
    : [];

  return { categories, treatments, memberships, rewardActions, rewardRedeems, homeArticles, packages, products };
}

function bindRemoveHandlers(container) {
  container.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("button[data-remove]")) return;
    const card = target.closest(".item-card");
    if (card) {
      card.remove();
    }
  });
}

// Reusable image upload for any .item-card with [data-upload-image]/[data-upload-file].
function bindImageUpload(container) {
  if (!container) return;
  container.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-upload-image]") : null;
    if (!button) return;
    const fileInput = button.closest(".item-card")?.querySelector("input[data-upload-file]");
    if (fileInput instanceof HTMLInputElement) fileInput.click();
  });
  container.addEventListener("change", async (event) => {
    const fileInput = event.target instanceof Element ? event.target.closest("input[data-upload-file]") : null;
    if (!(fileInput instanceof HTMLInputElement)) return;
    const card = fileInput.closest(".item-card");
    const file = fileInput.files?.[0];
    if (!card || !file) return;
    const button = card.querySelector("button[data-upload-image]");
    const previousLabel = button?.innerHTML;
    if (button) { button.disabled = true; button.textContent = "Lädt …"; }
    try {
      const url = await uploadSelectedMedia(file);
      const urlInput = card.querySelector('input[data-field="imageUrl"]');
      if (urlInput instanceof HTMLInputElement) urlInput.value = url;
      const preview = card.querySelector(".treatment-preview");
      if (preview) { preview.src = url; preview.classList.remove("hidden"); }
      await loadMediaLibrary();
      showToast("Bild hochgeladen");
    } catch (error) {
      showToast(error.message);
    } finally {
      fileInput.value = "";
      if (button) { button.disabled = false; if (previousLabel) button.innerHTML = previousLabel; }
    }
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

function appendCard(container, html, prepend = false) {
  const emptyNode = container.querySelector(".empty");
  if (emptyNode) {
    emptyNode.remove();
  }
  container.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", html);
  return prepend ? container.firstElementChild : container.lastElementChild;
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

async function handleExportCatalog() {
  try {
    const response = await fetch(`${API_BASE}/clinic/catalog/export`, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Export fehlgeschlagen");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "katalog.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Katalog exportiert");
  } catch (error) {
    showToast(error.message || "Export fehlgeschlagen");
  }
}

async function handleImportWebsite() {
  if (!state.user || state.user.role !== "owner") {
    showToast("Nur Owner können importieren.");
    return;
  }
  if (!window.confirm("Behandlungen von deiner Klinik-Website übernehmen? Bestehende Behandlungen können dabei überschrieben werden.")) return;
  const previousLabel = importWebsiteBtn.textContent;
  importWebsiteBtn.disabled = true;
  importWebsiteBtn.textContent = "Wird übernommen …";
  try {
    const response = await apiRequest("/clinic/catalog/import-from-website", { method: "POST", body: {} });
    renderCatalog(response.catalog || {});
    const n = Number(response.websiteSync?.importedTreatments || 0);
    showToast(n ? `${n} Behandlungen übernommen` : "Website übernommen");
  } catch (error) {
    showToast(error.message || "Website-Import fehlgeschlagen");
  } finally {
    importWebsiteBtn.disabled = false;
    importWebsiteBtn.textContent = previousLabel || "Von Website übernehmen";
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
  if (packagesList) bindRemoveHandlers(packagesList);
  if (productsList) bindRemoveHandlers(productsList);
  bindImageUpload(packagesList);
  bindImageUpload(productsList);

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
    const end = () => {
      stop();
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", end);
    };
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
    window.addEventListener("blur", end);
  });
  addCategoryBtn.addEventListener("click", () => appendCard(categoriesList, categoryCard({})));
  addTreatmentBtn.addEventListener("click", () => {
    const card = appendCard(treatmentsList, treatmentCard({}), true);
    card?.querySelector('input[data-field="name"]')?.focus();
  });
  addMembershipBtn.addEventListener("click", () => appendCard(membershipsList, membershipCard({})));
  addRewardActionBtn.addEventListener("click", () => appendCard(rewardActionsList, rewardActionCard({})));
  addRewardRedeemBtn.addEventListener("click", () => appendCard(rewardRedeemsList, rewardRedeemCard({})));
  addHomeArticleBtn.addEventListener("click", () => appendCard(homeArticlesList, homeArticleCard({})));
  if (addPackageBtn) addPackageBtn.addEventListener("click", () => appendCard(packagesList, packageCard({ id: genId("pkg") })));
  if (addProductBtn) addProductBtn.addEventListener("click", () => appendCard(productsList, productCard({ id: genId("prod") })));

  // Shop-Bereich-Umschalter (Treatments / Pakete / Mitgliedschaften / Produkte)
  const shopNav = document.getElementById("shopNav");
  if (shopNav) {
    shopNav.addEventListener("click", (event) => {
      const btn = event.target instanceof Element ? event.target.closest(".shop-nav-item") : null;
      if (!btn) return;
      const shop = btn.getAttribute("data-shop");
      shopNav.querySelectorAll(".shop-nav-item").forEach((b) => b.classList.toggle("active", b === btn));
      document
        .querySelectorAll("[data-shop-panel]")
        .forEach((p) => p.classList.toggle("hidden", p.getAttribute("data-shop-panel") !== shop));
    });
  }

  saveCatalogBtn.addEventListener("click", handleSave);
  autoGalleryBtn.addEventListener("click", handleAutoGallery);
  if (exportCatalogBtn) exportCatalogBtn.addEventListener("click", handleExportCatalog);
  if (importWebsiteBtn) importWebsiteBtn.addEventListener("click", handleImportWebsite);
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
  treatmentsList.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('input[data-field="imageUrl"]')) return;
    const card = target.closest('.item-card[data-kind="treatment"]');
    if (!card) return;
    setTreatmentPreview(card, target.value);
  });
  // Clicking the styled button just opens the (hidden) file dialog …
  treatmentsList.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("button[data-upload-image]") : null;
    if (!button) return;
    const card = button.closest('.item-card[data-kind="treatment"]');
    const fileInput = card?.querySelector("input[data-upload-file]");
    if (fileInput instanceof HTMLInputElement) fileInput.click();
  });
  // … and picking a file uploads it straight away (no second click).
  treatmentsList.addEventListener("change", async (event) => {
    const fileInput = event.target instanceof Element ? event.target.closest("input[data-upload-file]") : null;
    if (!(fileInput instanceof HTMLInputElement)) return;
    const card = fileInput.closest('.item-card[data-kind="treatment"]');
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
      await loadMediaLibrary();
      showToast("Treatment-Bild hochgeladen");
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
