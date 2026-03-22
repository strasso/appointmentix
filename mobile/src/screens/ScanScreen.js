import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

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

function QrPattern() {
  return (
    <View style={{ width: 192, height: 192, flexDirection: 'row', flexWrap: 'wrap' }}>
      {QR_MATRIX.join('').split('').map((bit, index) => (
        <View
          key={`qr-${index}`}
          style={{
            width: 12,
            height: 12,
            backgroundColor: bit === '1' ? '#000000' : '#FFFFFF',
          }}
        />
      ))}
    </View>
  );
}

export default function ScanScreen({
  styles,
  mowgliTheme,
  clinicProfile,
  points,
  checkInViaScan,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const [showManualId, setShowManualId] = useState(false);
  const manualId = useMemo(() => {
    const prefix = String(clinicProfile.shortName || 'CUR').toUpperCase().slice(0, 4);
    const pointPart = String(points || 0).padStart(4, '0').slice(0, 4);
    return `${prefix}-${pointPart}-A1`;
  }, [clinicProfile.shortName, points]);

  return (
    <View style={[styles.mowgliScanShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliScanCenter}>
        <View style={[styles.mowgliScanBadge, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
          <Ionicons name="qr-code-outline" size={28} color={theme.accent} />
        </View>

        <Text style={[styles.mowgliScanTitle, { color: theme.text }]}>Check-in Code</Text>
        <Text style={[styles.mowgliScanBody, { color: theme.textMuted }]}>
          Zeige diesen Code an der Rezeption für Check-in oder Bezahlung.
        </Text>

        {!showManualId && (
          <View style={styles.mowgliScanQrShell}>
            <View style={styles.mowgliScanQrCard}>
              <QrPattern />
              <View style={styles.mowgliScanQrMark}>
                <Ionicons name="sparkles" size={18} color="#0A0A0C" />
              </View>
            </View>
          </View>
        )}

        {showManualId && (
          <View style={[styles.mowgliScanManualCard, { backgroundColor: theme.shell, borderColor: theme.border }]}>
            <Text style={[styles.mowgliScanManualLabel, { color: theme.accent }]}>Manuelle ID</Text>
            <Text style={[styles.mowgliScanManualValue, { color: theme.text }]}>{manualId}</Text>
            <Text style={[styles.mowgliScanManualBody, { color: theme.textMuted }]}>
              Falls der Scanner nicht funktioniert, kann das Team diese ID manuell eingeben.
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
            {showManualId ? 'Code anzeigen statt ID' : 'ID anzeigen statt Code'}
          </Text>
          <Ionicons name={showManualId ? 'qr-code-outline' : 'keypad-outline'} size={16} color={theme.accent} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.mowgliHeroCta,
            { backgroundColor: theme.primaryButtonBg, borderColor: theme.borderStrong, minWidth: 240 },
            pressed && styles.mowgliLiftSoft,
          ]}
          onPress={checkInViaScan}
        >
          <Text style={[styles.mowgliHeroCtaText, { color: theme.primaryButtonText }]}>Check-in bestätigen</Text>
        </Pressable>
      </View>
    </View>
  );
}
