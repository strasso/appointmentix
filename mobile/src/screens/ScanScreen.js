import React from 'react';
import { Pressable, Text, View } from 'react-native';
import TopHeader from '../components/TopHeader';

export default function ScanScreen({
  styles,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  points,
  checkInViaScan,
}) {
  return (
    <View>
      <TopHeader
        styles={styles}
        title="Scan"
        sectionLabel="Check-in & Besuch"
        subtitle="Schnell erfassen und Punkte sammeln"
        clinicShortName={clinicProfile.shortName}
        clinicName={clinicProfile.name}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        cartCount={cartCount}
      />

      <View style={styles.scanCard}>
        <View pointerEvents="none" style={styles.surfaceRim} />
        <View pointerEvents="none" style={styles.surfaceBlueAura} />
        <View pointerEvents="none" style={styles.cardChrome} />
        <Text style={styles.scanTitle}>Check-in QR</Text>
        <Text style={styles.scanBody}>
          Scanne beim Empfang deinen App-Code. So werden Besuche sauber erfasst und Punkte automatisch gutgeschrieben.
        </Text>
        <View style={styles.scanQrMock}>
          <View pointerEvents="none" style={styles.scanQrGloss} />
          <View pointerEvents="none" style={styles.scanQrGlow} />
          <Text style={styles.scanQrText}>{clinicProfile.shortName || 'APP'}-{String(points).slice(0, 4)}</Text>
        </View>
        <Pressable style={styles.primaryCta} onPress={checkInViaScan}>
          <Text style={styles.primaryCtaText}>Scan bestätigen (Demo)</Text>
        </Pressable>
      </View>

      <View style={styles.inlineInfoBox}>
        <Text style={styles.inlineInfoTitle}>So funktioniert es live</Text>
        <Text style={styles.inlineInfoText}>• Empfang scannt den QR aus der App</Text>
        <Text style={styles.inlineInfoText}>• Besuch wird in der MedSpa-Historie verbucht</Text>
        <Text style={styles.inlineInfoText}>• Punkte werden automatisch gutgeschrieben</Text>
      </View>
    </View>
  );
}
