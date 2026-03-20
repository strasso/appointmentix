import React from 'react';
import { View } from 'react-native';

export default function AmbientBackground({ styles }) {
  return (
    <View pointerEvents="none" style={styles.ambientLayer}>
      <View style={styles.ambientWash} />
      <View style={styles.ambientBeam} />
      <View style={styles.ambientLensTop} />
      <View style={styles.ambientLensBottom} />
      <View style={styles.ambientOrbA} />
      <View style={styles.ambientOrbB} />
      <View style={styles.ambientOrbC} />
    </View>
  );
}
