const runtime = {
  calendlyUrl: "https://calendly.com/dein-echter-name/30min",
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

function isHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function isPlaceholderCalendlyUrl(url) {
  const normalized = String(url || "").toLowerCase();
  return !normalized || ["dein-echter-name", "dein-name", "your-name", "example"].some((entry) => normalized.includes(entry));
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

function applyPreviewStyles() {
  document.documentElement.style.setProperty("--brand", runtime.brandColor);
  document.body.style.fontFamily = runtime.fontFamily;
  if (previewPhone) {
    previewPhone.style.filter = `drop-shadow(0 28px 48px ${runtime.brandColor}55)`;
  }
  if (previewBrandText) {
    previewBrandText.textContent = `Appointmentix Klinik-Branding • ${runtime.brandColor}`;
  }
}

function resetFormMessage() {
  leadFormMessage.textContent = "";
  leadFormMessage.classList.remove("success");
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

function validateLeadForm(formData) {
  const required = ["fullName", "email", "phone", "companyName", "website", "hasDevices", "recurringRevenueBand"];
  for (const key of required) {
    if (!String(formData.get(key) || "").trim()) {
      return "Bitte fülle alle Pflichtfelder aus.";
    }
  }

  if (formData.get("consentSms") !== "on") {
    return "Bitte bestätige die Kontakt-Einwilligung.";
  }

  return "";
}

function bindLeadForm() {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetFormMessage();

    const formData = new FormData(leadForm);
    const validationError = validateLeadForm(formData);
    if (validationError) {
      leadFormMessage.textContent = validationError;
      showToast(validationError);
      return;
    }

    leadSubmitBtn.disabled = true;
    leadSubmitBtn.textContent = "Senden ...";

    try {
      if (isPlaceholderCalendlyUrl(runtime.calendlyUrl)) {
        const message = "Bitte in app-wix.js zuerst runtime.calendlyUrl auf deinen echten Calendly-Link setzen.";
        leadFormMessage.textContent = message;
        showToast(message);
        return;
      }

      leadFormMessage.textContent = "Danke! Wir leiten dich jetzt zu Calendly weiter ...";
      leadFormMessage.classList.add("success");
      showToast("Weiterleitung zu Calendly ...");

      window.setTimeout(() => {
        window.location.assign(runtime.calendlyUrl);
      }, 700);
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

function init() {
  bindViewSwitching();
  bindConfigPreview();
  bindLeadForm();
  applyPreviewStyles();
  restoreViewFromUrl();
}

init();
