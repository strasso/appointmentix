export const FRONT_BODY_VIEWBOX = {
  width: 240,
  height: 520,
};

export const FRONT_BODY_ZONES = [
  {
    id: 'face',
    label: 'Gesicht',
    path: 'M120 24 C102 24 88 38 88 58 C88 80 101 96 120 96 C139 96 152 80 152 58 C152 38 138 24 120 24 Z',
  },
  {
    id: 'neck',
    label: 'Hals',
    path: 'M106 96 C103 106 103 117 106 128 L134 128 C137 117 137 106 134 96 Z',
  },
  {
    id: 'chest',
    label: 'Brust',
    path: 'M92 134 C78 149 71 171 73 197 C75 224 91 245 120 253 C149 245 165 224 167 197 C169 171 162 149 148 134 Z',
  },
  {
    id: 'underarms',
    label: 'Achseln',
    path: 'M66 172 C52 176 45 188 45 203 C45 216 53 226 67 230 C76 220 81 209 82 197 C83 185 78 176 66 172 Z M174 172 C162 176 157 185 158 197 C159 209 164 220 173 230 C187 226 195 216 195 203 C195 188 188 176 174 172 Z',
  },
  {
    id: 'upper_arms',
    label: 'Oberarme',
    path: 'M56 182 C44 192 37 211 38 233 C39 255 48 274 61 287 C73 281 80 267 81 248 C82 224 76 201 56 182 Z M184 182 C164 201 158 224 159 248 C160 267 167 281 179 287 C192 274 201 255 202 233 C203 211 196 192 184 182 Z',
  },
  {
    id: 'forearms',
    label: 'Unterarme',
    path: 'M61 288 C49 302 44 321 46 344 C48 363 55 380 66 392 C75 384 81 370 82 352 C83 328 78 307 61 288 Z M179 288 C162 307 157 328 158 352 C159 370 165 384 174 392 C185 380 192 363 194 344 C196 321 191 302 179 288 Z',
  },
  {
    id: 'hands',
    label: 'Hände',
    path: 'M63 392 C56 395 52 402 52 410 C52 420 60 428 70 428 C78 428 85 422 87 414 C82 406 76 398 63 392 Z M177 392 C164 398 158 406 153 414 C155 422 162 428 170 428 C180 428 188 420 188 410 C188 402 184 395 177 392 Z',
  },
  {
    id: 'belly',
    label: 'Bauch',
    path: 'M89 254 C82 272 80 293 82 316 C84 340 96 356 120 362 C144 356 156 340 158 316 C160 293 158 272 151 254 Z',
  },
  {
    id: 'bikini',
    label: 'Bikini',
    path: 'M96 362 C101 377 109 388 120 390 C131 388 139 377 144 362 C136 355 128 352 120 352 C112 352 104 355 96 362 Z',
  },
  {
    id: 'intimate',
    label: 'Intimbereich',
    path: 'M112 386 C109 391 108 397 108 402 C108 409 113 414 120 414 C127 414 132 409 132 402 C132 397 131 391 128 386 Z',
  },
  {
    id: 'upper_legs',
    label: 'Oberschenkel',
    path: 'M96 392 C86 404 80 421 77 441 C74 461 75 481 80 496 L97 496 C101 481 103 462 103 442 C103 423 100 406 96 392 Z M144 392 C140 406 137 423 137 442 C137 462 139 481 143 496 L160 496 C165 481 166 461 163 441 C160 421 154 404 144 392 Z',
  },
  {
    id: 'knees',
    label: 'Knie',
    path: 'M82 430 C78 436 77 442 79 448 C81 454 87 458 95 458 C102 458 108 454 110 448 C112 442 111 436 107 430 Z M133 430 C129 436 128 442 130 448 C132 454 138 458 145 458 C153 458 159 454 161 448 C163 442 162 436 158 430 Z',
  },
  {
    id: 'lower_legs',
    label: 'Unterschenkel',
    path: 'M85 458 C79 468 76 480 76 492 C76 503 80 513 87 520 L101 520 C107 509 109 498 109 486 C109 475 106 466 101 458 Z M139 458 C134 466 131 475 131 486 C131 498 133 509 139 520 L153 520 C160 513 164 503 164 492 C164 480 161 468 155 458 Z',
  },
  {
    id: 'feet',
    label: 'Füße',
    path: 'M86 500 C80 504 79 509 83 513 C87 517 95 520 104 520 C112 520 119 517 123 513 C118 507 108 503 86 500 Z M154 500 C132 503 122 507 117 513 C121 517 128 520 136 520 C145 520 153 517 157 513 C161 509 160 504 154 500 Z',
  },
];

export const FRONT_BODY_ZONE_IDS = FRONT_BODY_ZONES.map((zone) => zone.id);
export const FRONT_BODY_ZONE_MAP = FRONT_BODY_ZONES.reduce((acc, zone) => {
  acc[zone.id] = zone;
  return acc;
}, {});

export function sanitizeBodyZones(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const zones = [];
  for (const entry of value) {
    const zoneId = String(entry || '').trim().toLowerCase();
    if (!FRONT_BODY_ZONE_MAP[zoneId] || seen.has(zoneId)) continue;
    seen.add(zoneId);
    zones.push(zoneId);
  }
  return FRONT_BODY_ZONES.filter((zone) => seen.has(zone.id)).map((zone) => zone.id);
}

export function getBodyZoneLabel(zoneId) {
  return FRONT_BODY_ZONE_MAP[String(zoneId || '').trim().toLowerCase()]?.label || '';
}
