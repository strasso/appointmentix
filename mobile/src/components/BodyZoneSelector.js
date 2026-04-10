import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { FRONT_BODY_VIEWBOX } from '../config/bodyZones/frontZones';

function renderFallbackFigure(theme) {
  const baseFill = theme.mode === 'dark' ? 'rgba(240,240,238,0.05)' : 'rgba(30,24,19,0.05)';
  const baseStroke = theme.mode === 'dark' ? 'rgba(240,240,238,0.08)' : 'rgba(30,24,19,0.08)';
  return (
    <G>
      <Circle cx="120" cy="58" r="34" fill={baseFill} stroke={baseStroke} strokeWidth="1" />
      <Path
        d="M102 92 C101 105 101 117 105 128 L135 128 C139 117 139 105 138 92 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Path
        d="M92 132 C79 148 72 172 73 201 C74 226 83 247 98 265 L92 319 C88 350 88 381 95 414 L100 468 C102 489 109 506 120 512 C131 506 138 489 140 468 L145 414 C152 381 152 350 148 319 L142 265 C157 247 166 226 167 201 C168 172 161 148 148 132 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Path
        d="M72 164 C56 182 45 205 43 233 C41 257 49 282 63 301 C71 286 76 267 78 244 C81 215 79 190 72 164 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Path
        d="M168 164 C161 190 159 215 162 244 C164 267 169 286 177 301 C191 282 199 257 197 233 C195 205 184 182 168 164 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Path
        d="M97 390 C86 404 79 425 76 452 C73 480 75 504 84 520 L100 520 C104 501 106 476 106 452 C106 427 103 406 97 390 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Path
        d="M143 390 C137 406 134 427 134 452 C134 476 136 501 140 520 L156 520 C165 504 167 480 164 452 C161 425 154 404 143 390 Z"
        fill={baseFill}
        stroke={baseStroke}
        strokeWidth="1"
      />
      <Ellipse cx="96" cy="514" rx="16" ry="6" fill={baseFill} stroke={baseStroke} strokeWidth="1" />
      <Ellipse cx="144" cy="514" rx="16" ry="6" fill={baseFill} stroke={baseStroke} strokeWidth="1" />
    </G>
  );
}

export default function BodyZoneSelector({
  bodyImageSource,
  zones = [],
  activeZoneId = null,
  enabledZoneIds = [],
  onZoneSelect,
  theme,
}) {
  const enabledSet = new Set(Array.isArray(enabledZoneIds) ? enabledZoneIds : []);
  const activeId = String(activeZoneId || '').trim().toLowerCase();

  return (
    <View style={[styles.shell, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.frame}>
        {bodyImageSource ? (
          <Image source={bodyImageSource} resizeMode="contain" style={styles.image} />
        ) : null}
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${FRONT_BODY_VIEWBOX.width} ${FRONT_BODY_VIEWBOX.height}`}
        >
          {!bodyImageSource ? renderFallbackFigure(theme) : null}
          {zones.map((zone) => {
            const zoneId = String(zone?.id || '').trim().toLowerCase();
            const enabled = enabledSet.has(zoneId);
            const active = activeId === zoneId;
            const fill = active ? theme.accentSurfaceStrong : enabled ? 'rgba(0,0,0,0.001)' : 'transparent';
            const stroke = active
              ? theme.accent
              : enabled
                ? theme.borderStrong
                : theme.mode === 'dark'
                  ? 'rgba(240,240,238,0.08)'
                  : 'rgba(30,24,19,0.08)';
            const opacity = enabled || active ? 1 : 0.6;
            return (
              <Path
                key={zoneId}
                d={zone.path}
                fill={fill}
                stroke={stroke}
                strokeWidth={active ? 2 : 1.35}
                opacity={opacity}
                onPress={enabled ? () => onZoneSelect?.(active ? null : zoneId) : undefined}
              />
            );
          })}
        </Svg>
      </View>
      <View style={styles.captionRow}>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          Tippe auf einen Bereich, um passende Treatments zu sehen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  frame: {
    width: '100%',
    aspectRatio: FRONT_BODY_VIEWBOX.width / FRONT_BODY_VIEWBOX.height,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  captionRow: {
    paddingTop: 6,
    alignItems: 'center',
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
