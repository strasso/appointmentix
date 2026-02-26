const API_BASE = "/api";

const runtime = {
  calendlyUrl: "https://calendly.com/",
  calendlyConfigured: false,
  toastTimer: null,
  brandColor: "#8A5A2F",
  fontFamily: "Gabarito, DM Sans, sans-serif"
};

const HOME_VIEW = document.getElementById("homeView");
const BOOK_VIEW = document.getElementById("bookView");
const TOAST = document.getElementById("toast");

const openBookButtons = [...document.querySelectorAll("[data-open-book]")];
const openHomeButtons = [...document.querySelectorAll("[data-open-home]")];

const configForm = document.getElementById("configForm");
const brandColorInput = document.getElementById("brandColorInput");
const brandHexInput = document.getElementById("brandHexInput");
const fontSelect = document.getElementById("fontSelect");
const previewPhone = document.getElementById("previewPhone");
const previewBrandText = document.getElementById("previewBrandText");

const leadForm = document.getElementById("leadForm");
const leadSubmitBtn = document.getElementById("leadSubmitBtn");
const leadFormMessage = document.getElementById("leadFormMessage");

function showToast(message) {
  TOAST.textContent = message;
  TOAST.classList.add("show");
  if (runtime.toastTimer) {
    clearTimeout(runtime.toastTimer);
  }
  runtime.toastTimer = setTimeout(() => {
    TOAST.classList.remove("show");
    runtime.toastTimer = null;
  }, 2600);
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isPlaceholderCalendlyUrl(url) {
  const normalized = String(url || "").toLowerCase();
  return !normalized || ["dein-name", "your-name", "example"].some((entry) => normalized.includes(entry));
}

function updateUrl(viewName) {
  const url = new URL(window.location.href);
  url.search = "";
  url.pathname = viewName === "book" ? "/book-a-call" : "/";
  window.history.replaceState({}, "", url.toString());
}

function setView(viewName) {
  const isBook = viewName === "book";
  HOME_VIEW.classList.toggle("hidden", isBook);
  BOOK_VIEW.classList.toggle("hidden", !isBook);
  updateUrl(isBook ? "book" : "home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function applyPreviewStyles() {
  document.documentElement.style.setProperty("--brand", runtime.brandColor);
  document.body.style.fontFamily = runtime.fontFamily;
  if (previewPhone) {
    previewPhone.style.filter = `drop-shadow(0 28px 48px ${runtime.brandColor}55)`;
  }
  if (previewBrandText) {
    previewBrandText.textContent = `Curabo Klinik-Branding • ${runtime.brandColor}`;
  }
}

function resetFormMessage() {
  leadFormMessage.textContent = "";
  leadFormMessage.classList.remove("success");
}

async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const requestOptions = {
    method,
    credentials: "same-origin",
    headers: {}
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

async function loadConfig() {
  try {
    const response = await apiRequest("/config/public");
    runtime.calendlyUrl = normalizeUrl(response.calendlyUrl) || runtime.calendlyUrl;
    runtime.calendlyConfigured = Boolean(response.calendlyConfigured) && !isPlaceholderCalendlyUrl(runtime.calendlyUrl);
  } catch {
    runtime.calendlyConfigured = false;
  }
}

function bindViewSwitching() {
  openBookButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setView("book");
    });
  });

  openHomeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setView("home");
    });
  });
}

function bindConfigPreview() {
  brandColorInput.addEventListener("input", () => {
    runtime.brandColor = brandColorInput.value;
    brandHexInput.value = runtime.brandColor;
    applyPreviewStyles();
  });

  brandHexInput.addEventListener("input", () => {
    const next = brandHexInput.value.trim();
    if (isHexColor(next)) {
      runtime.brandColor = next;
      brandColorInput.value = next;
      applyPreviewStyles();
    }
  });

  fontSelect.addEventListener("change", () => {
    runtime.fontFamily = fontSelect.value;
    applyPreviewStyles();
  });

  configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setView("book");
    showToast("Perfekt. Bitte fülle jetzt das kurze Qualifizierungsformular aus.");
  });
}

function buildLeadPayload(formData) {
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    companyName: String(formData.get("companyName") || "").trim(),
    website: String(formData.get("website") || "").trim(),
    hasDevices: String(formData.get("hasDevices") || "").trim(),
    recurringRevenueBand: String(formData.get("recurringRevenueBand") || "").trim(),
    consentSms: formData.get("consentSms") === "on",
    consentMarketing: formData.get("consentMarketing") === "on",
    brandColor: runtime.brandColor,
    fontFamily: runtime.fontFamily
  };
}

function bindLeadForm() {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetFormMessage();

    const formData = new FormData(leadForm);
    const payload = buildLeadPayload(formData);

    leadSubmitBtn.disabled = true;
    leadSubmitBtn.textContent = "Senden ...";

    try {
      const response = await apiRequest("/leads", {
        method: "POST",
        body: payload
      });

      runtime.calendlyUrl = normalizeUrl(response.calendlyUrl) || runtime.calendlyUrl;
      runtime.calendlyConfigured = Boolean(response.calendlyConfigured) && !isPlaceholderCalendlyUrl(runtime.calendlyUrl);

      if (!runtime.calendlyConfigured) {
        leadFormMessage.textContent = "Lead gespeichert. Calendly-Link ist noch Platzhalter. Bitte setze in .env: CALENDLY_URL=https://calendly.com/dein-echter-link";
        showToast("Lead gespeichert. Bitte zuerst den echten Calendly-Link setzen.");
        return;
      }

      leadFormMessage.textContent = "Danke! Wir leiten dich jetzt zu Calendly weiter ...";
      leadFormMessage.classList.add("success");
      showToast("Qualifizierung gespeichert.");

      window.setTimeout(() => {
        window.location.assign(runtime.calendlyUrl);
      }, 700);
    } catch (error) {
      leadFormMessage.textContent = error.message;
      showToast(error.message);
    } finally {
      leadSubmitBtn.disabled = false;
      leadSubmitBtn.textContent = "Weiter";
    }
  });
}

function restoreViewFromUrl() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/book-a-call") {
    setView("book");
  } else {
    setView("home");
  }
}

async function init() {
  await loadConfig();
  bindViewSwitching();
  bindConfigPreview();
  bindLeadForm();
  applyPreviewStyles();
  restoreViewFromUrl();
}

init();
