(() => {
  const APPROVED_FONTS = [
    { value: "Inter, system-ui, sans-serif", label: "Inter" },
    { value: "Gabarito, DM Sans, system-ui, sans-serif", label: "Gabarito" },
    { value: "Avenir Next, system-ui, sans-serif", label: "Avenir Next" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "Playfair Display, Georgia, serif", label: "Playfair Display" },
  ];

  const MEMBERSHIP_PRESETS = ["classic", "metallic", "minimal", "dark-premium", "gradient"];

  const DEFAULT_THEME = {
    colors: {
      primary: "#B56F80",
      secondary: "#A15E72",
      background: "#F3F4F6",
      surface: "#FFFFFF",
      textPrimary: "#16181D",
      textSecondary: "#697079",
      accent: "#B56F80",
    },
    typography: {
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
    },
    radius: {
      button: 12,
      card: 16,
      input: 9,
    },
    membershipCard: {
      preset: "classic",
      backgroundColor: "#FFFFFF",
      textColor: "#16181D",
      accentColor: "#B56F80",
      borderRadius: 22,
      gradientStrength: 34,
      textureOpacity: 10,
      cornerDecoration: true,
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeTheme(base, partial) {
    const output = clone(base);
    if (!isPlainObject(partial)) return output;
    Object.keys(output).forEach((group) => {
      if (!isPlainObject(output[group]) || !isPlainObject(partial[group])) return;
      Object.keys(output[group]).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(partial[group], key)) {
          output[group][key] = partial[group][key];
        }
      });
    });
    return output;
  }

  function normalizeHex(value, fallback) {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      const chars = raw.slice(1).split("");
      return `#${chars.map((item) => item + item).join("")}`.toUpperCase();
    }
    return fallback;
  }

  function clampNumber(value, fallback, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.round(Math.max(min, Math.min(max, numeric)));
  }

  function normalizeFont(value, fallback) {
    const raw = String(value || "").trim();
    return APPROVED_FONTS.some((item) => item.value === raw) ? raw : fallback;
  }

  function normalizeTheme(partial) {
    const merged = mergeTheme(DEFAULT_THEME, partial);
    const theme = clone(DEFAULT_THEME);

    Object.keys(theme.colors).forEach((key) => {
      theme.colors[key] = normalizeHex(merged.colors[key], DEFAULT_THEME.colors[key]);
    });
    theme.typography.headingFont = normalizeFont(merged.typography.headingFont, DEFAULT_THEME.typography.headingFont);
    theme.typography.bodyFont = normalizeFont(merged.typography.bodyFont, DEFAULT_THEME.typography.bodyFont);
    theme.radius.button = clampNumber(merged.radius.button, DEFAULT_THEME.radius.button, 0, 32);
    theme.radius.card = clampNumber(merged.radius.card, DEFAULT_THEME.radius.card, 0, 40);
    theme.radius.input = clampNumber(merged.radius.input, DEFAULT_THEME.radius.input, 0, 28);

    theme.membershipCard.preset = MEMBERSHIP_PRESETS.includes(String(merged.membershipCard.preset))
      ? String(merged.membershipCard.preset)
      : DEFAULT_THEME.membershipCard.preset;
    theme.membershipCard.backgroundColor = normalizeHex(
      merged.membershipCard.backgroundColor,
      DEFAULT_THEME.membershipCard.backgroundColor
    );
    theme.membershipCard.textColor = normalizeHex(merged.membershipCard.textColor, DEFAULT_THEME.membershipCard.textColor);
    theme.membershipCard.accentColor = normalizeHex(
      merged.membershipCard.accentColor,
      DEFAULT_THEME.membershipCard.accentColor
    );
    theme.membershipCard.borderRadius = clampNumber(
      merged.membershipCard.borderRadius,
      DEFAULT_THEME.membershipCard.borderRadius,
      0,
      40
    );
    theme.membershipCard.gradientStrength = clampNumber(
      merged.membershipCard.gradientStrength,
      DEFAULT_THEME.membershipCard.gradientStrength,
      0,
      100
    );
    theme.membershipCard.textureOpacity = clampNumber(
      merged.membershipCard.textureOpacity,
      DEFAULT_THEME.membershipCard.textureOpacity,
      0,
      35
    );
    theme.membershipCard.cornerDecoration = Boolean(merged.membershipCard.cornerDecoration);
    return theme;
  }

  function hexToRgb(value) {
    const hex = normalizeHex(value, "#000000").slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  function relativeLuminance(value) {
    const { r, g, b } = hexToRgb(value);
    const normalize = (channel) => {
      const next = channel / 255;
      return next <= 0.03928 ? next / 12.92 : ((next + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  }

  function contrastRatio(foreground, background) {
    const fg = relativeLuminance(foreground);
    const bg = relativeLuminance(background);
    const light = Math.max(fg, bg);
    const dark = Math.min(fg, bg);
    return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
  }

  function contrastWarnings(themeInput) {
    const theme = normalizeTheme(themeInput);
    const checks = [
      ["Primärtext auf Hintergrund", theme.colors.textPrimary, theme.colors.background],
      ["Sekundärtext auf Hintergrund", theme.colors.textSecondary, theme.colors.background],
      ["Primärtext auf Fläche", theme.colors.textPrimary, theme.colors.surface],
      ["Mitgliedskarten-Text auf Karte", theme.membershipCard.textColor, theme.membershipCard.backgroundColor],
    ];
    return checks
      .map(([label, foreground, background]) => ({
        label,
        foreground,
        background,
        ratio: contrastRatio(foreground, background),
      }))
      .filter((item) => item.ratio < 4.5);
  }

  function isThemeEqual(a, b) {
    return JSON.stringify(normalizeTheme(a)) === JSON.stringify(normalizeTheme(b));
  }

  window.CuraboTheme = {
    APPROVED_FONTS,
    MEMBERSHIP_PRESETS,
    DEFAULT_THEME,
    clone,
    normalizeHex,
    normalizeTheme,
    contrastRatio,
    contrastWarnings,
    isThemeEqual,
  };
})();
