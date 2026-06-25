import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

// Fallback pattern shown only if the live QR code hasn't loaded yet (offline / first paint).
const QR_MATRIX = [
  '1110001001011010',
  '1010011100010111',
  '1110100011110010',
  '0001011010010101',
  '1011100101110001',
  '0010110100101110',
  '1101001011010011',
  '0101110001011100',
  '1110010110100011',
  '0011011000101101',
  '1010100111010010',
  '0100110100111001',
  '1100101011001010',
  '0011010110010111',
  '1010011001101001',
  '0110100110011010',
];

// Renders a QR module matrix (array of "0"/"1" rows) as a crisp black/white grid.
function QrPattern({ matrix }) {
  const rows = Array.isArray(matrix) && matrix.length ? matrix : QR_MATRIX;
  const size = rows.length || 1;
  const cell = Math.max(3, Math.floor(200 / size));
  const dim = cell * size;
  return (
    <View style={{ width: dim, height: dim, flexDirection: 'column' }}>
      {rows.map((row, r) => (
        <View key={`qr-r-${r}`} style={{ flexDirection: 'row' }}>
          {String(row)
            .split('')
            .map((bit, c) => (
              <View
                key={`qr-${r}-${c}`}
                style={{ width: cell, height: cell, backgroundColor: bit === '1' ? '#000000' : '#FFFFFF' }}
              />
            ))}
        </View>
      ))}
    </View>
  );
}

export default function ScanScreen({
  styles,
  mowgliTheme,
  checkinData,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const [showManualId, setShowManualId] = useState(false);
  const code = checkinData && checkinData.code ? String(checkinData.code) : '——————';
  const matrix = checkinData ? checkinData.qrMatrix : null;

  return (
    <View style={[styles.mowgliScanShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliScanCenter}>
        <View style={[styles.mowgliScanBadge, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
          <Ionicons name="qr-code-outline" size={28} color={theme.accent} />
        </View>

        <Text style={[styles.mowgliScanTitle, { color: theme.text }]}>Check-in Code</Text>
        <Text style={[styles.mowgliScanBody, { color: theme.textMuted }]}>
          Zeige diesen QR-Code an der Rezeption — das Team scannt ihn für deinen Check-in.
        </Text>

        {!showManualId && (
          <View style={styles.mowgliScanQrShell}>
            <View style={styles.mowgliScanQrCard}>
              <QrPattern matrix={matrix} />
              <View style={styles.mowgliScanQrMark}>
                <Ionicons name="sparkles" size={18} color="#0A0A0C" />
              </View>
            </View>
          </View>
        )}

        {showManualId && (
          <View style={[styles.mowgliScanManualCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
            <Text style={[styles.mowgliScanManualLabel, { color: theme.accent }]}>Code für die Rezeption</Text>
            <Text style={[styles.mowgliScanManualValue, { color: theme.text }]}>{code}</Text>
            <Text style={[styles.mowgliScanManualBody, { color: theme.textMuted }]}>
              Falls der Scanner nicht funktioniert, kann das Team diesen Code manuell eingeben.
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.mowgliScanToggle,
            pressed && styles.mowgliLiftSoft,
          ]}
          onPress={() => setShowManualId((prev) => !prev)}
        >
          <Text style={[styles.mowgliScanToggleText, { color: theme.accent }]}>
            {showManualId ? 'QR-Code anzeigen' : 'Code anzeigen statt QR'}
          </Text>
          <Ionicons name={showManualId ? 'qr-code-outline' : 'keypad-outline'} size={16} color={theme.accent} />
        </Pressable>
      </View>
    </View>
  );
}
