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

function categoryCard(item = {}) {
  return `
    <div class="item-card" data-kind="category">
      <div class="field-grid-2">
        <label>ID
          <input data-field="id" value="${escapeAttr(item.id)}" placeholder="gesicht">
        </label>
        <label>Label
          <input data-field="label" value="${escapeAttr(item.label)}" placeholder="Gesicht">
        </label>
      </div>
      <div class="item-footer"><button type="button" class="btn danger" data-remove>Entfernen</button></div>
    </div>
  `;
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
          <input data-field="category" value="${escapeAttr(item.category)}" placeholder="gesicht">
        </label>
        <label>Dauer (Min)
          <input data-field="durationMinutes" value="${escapeAttr(item.durationMinutes)}" placeholder="60">
        </label>
      </div>
      <div class="field-grid-2">
        <label>Preis (Cent)
          <input data-field="priceCents" value="${escapeAttr(item.priceCents)}" placeholder="11000">
        </label>
        <label>Member Preis (Cent)
          <input data-field="memberPriceCents" value="${escapeAttr(item.memberPriceCents)}" placeholder="9900">
        </label>
      </div>
      <label>Beschreibung
        <textarea data-field="description" placeholder="Kurzbeschreibung">${escapeAttr(item.description)}</textarea>
      </label>
      <div class="field-grid-2">
        <label>Bild URL
          <input data-field="imageUrl" value="${escapeAttr(item.imageUrl)}" placeholder="/uploads/clinic_x/beispiel.jpg">
        </label>
        <div>
          <img class="treatment-preview ${item.imageUrl ? "" : "hidden"}" src="${escapeAttr(item.imageUrl || "")}" alt="Treatment Vorschau">
          <div class="upload-row">
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload-file>
            <button type="button" class="btn ghost" data-upload-image>Bild hochladen</button>
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
        <label>Preis (Cent)
          <input data-field="priceCents" value="${escapeAttr(item.priceCents)}" placeholder="7900">
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
        <label>Wert (Cent)
          <input data-field="valueCents" value="${escapeAttr(item.valueCents)}" placeholder="1500">
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

function renderCatalog(catalog) {
  renderList(categoriesList, catalog.categories, categoryCard, "Noch keine Kategorien.");
  renderList(treatmentsList, catalog.treatments, treatmentCard, "Noch keine Treatments.");
  renderList(membershipsList, catalog.memberships, membershipCard, "Noch keine Memberships.");
  renderList(rewardActionsList, catalog.rewardActions, rewardActionCard, "Noch keine Reward Aktionen.");
  renderList(rewardRedeemsList, catalog.rewardRedeems, rewardRedeemCard, "Noch keine Reward Einlösungen.");
  renderList(homeArticlesList, catalog.homeArticles, homeArticleCard, "Noch keine Home Artikel.");
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
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      label: card.querySelector('[data-field="label"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.label);

  const treatments = Array.from(treatmentsList.querySelectorAll('.item-card[data-kind="treatment"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
      category: card.querySelector('[data-field="category"]')?.value.trim() || "",
      durationMinutes: toInt(card.querySelector('[data-field="durationMinutes"]')?.value, 30),
      priceCents: toInt(card.querySelector('[data-field="priceCents"]')?.value, 0),
      memberPriceCents: toInt(card.querySelector('[data-field="memberPriceCents"]')?.value, 0),
      description: card.querySelector('[data-field="description"]')?.value.trim() || "",
      imageUrl: card.querySelector('[data-field="imageUrl"]')?.value.trim() || "",
    }))
    .filter((item) => item.id && item.name && item.category);

  const memberships = Array.from(membershipsList.querySelectorAll('.item-card[data-kind="membership"]'))
    .map((card) => ({
      id: card.querySelector('[data-field="id"]')?.value.trim() || "",
      name: card.querySelector('[data-field="name"]')?.value.trim() || "",
      priceCents: toInt(card.querySelector('[data-field="priceCents"]')?.value, 0),
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
      valueCents: toInt(card.querySelector('[data-field="valueCents"]')?.value, 0),
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

  return { categories, treatments, memberships, rewardActions, rewardRedeems, homeArticles };
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

  addCategoryBtn.addEventListener("click", () => appendCard(categoriesList, categoryCard({})));
  addTreatmentBtn.addEventListener("click", () => appendCard(treatmentsList, treatmentCard({})));
  addMembershipBtn.addEventListener("click", () => appendCard(membershipsList, membershipCard({})));
  addRewardActionBtn.addEventListener("click", () => appendCard(rewardActionsList, rewardActionCard({})));
  addRewardRedeemBtn.addEventListener("click", () => appendCard(rewardRedeemsList, rewardRedeemCard({})));
  addHomeArticleBtn.addEventListener("click", () => appendCard(homeArticlesList, homeArticleCard({})));
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
  treatmentsList.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('input[data-field="imageUrl"]')) return;
    const card = target.closest('.item-card[data-kind="treatment"]');
    if (!card) return;
    setTreatmentPreview(card, target.value);
  });
  treatmentsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("button[data-upload-image]")) return;
    const card = target.closest('.item-card[data-kind="treatment"]');
    if (!card) return;
    const fileInput = card.querySelector('input[data-upload-file]');
    if (!(fileInput instanceof HTMLInputElement)) return;
    const file = fileInput.files?.[0];
    if (!file) {
      showToast("Bitte zuerst eine Bilddatei auswählen.");
      return;
    }
    target.disabled = true;
    try {
      const url = await uploadSelectedMedia(file);
      const urlInput = card.querySelector('input[data-field="imageUrl"]');
      if (urlInput instanceof HTMLInputElement) {
        urlInput.value = url;
      }
      setTreatmentPreview(card, url);
      fileInput.value = "";
      await loadMediaLibrary();
      showToast("Treatment-Bild hochgeladen");
    } catch (error) {
      showToast(error.message);
    } finally {
      target.disabled = false;
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
