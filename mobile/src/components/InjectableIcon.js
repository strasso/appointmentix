import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function InjectableIcon({ active = false }) {
  const stroke = active ? '#243144' : '#435165';
  const soft = active ? '#DCE5EE' : '#E8EEF4';

  return (
    <View style={styles.canvas}>
      <View style={[styles.syringeBody, { borderColor: stroke, backgroundColor: soft }]} />
      <View style={[styles.syringePlunger, { backgroundColor: stroke }]} />
      <View style={[styles.syringeNeedle, { backgroundColor: stroke }]} />
      <View style={[styles.measureLineTop, { backgroundColor: stroke }]} />
      <View style={[styles.measureLineBottom, { backgroundColor: stroke }]} />
      <View style={[styles.spark, { borderColor: stroke }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syringeBody: {
    width: 12,
    height: 6,
    borderWidth: 1.6,
    borderRadius: 3,
    transform: [{ rotate: '-34deg' }],
  },
  syringePlunger: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 7,
    height: 1.8,
    borderRadius: 999,
    transform: [{ rotate: '-34deg' }],
  },
  syringeNeedle: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 8,
    height: 1.4,
    borderRadius: 999,
    transform: [{ rotate: '-34deg' }],
  },
  measureLineTop: {
    position: 'absolute',
    top: 8,
    left: 11,
    width: 1.5,
    height: 4,
    borderRadius: 999,
    transform: [{ rotate: '-34deg' }],
  },
  measureLineBottom: {
    position: 'absolute',
    top: 11,
    left: 9,
    width: 1.5,
    height: 3,
    borderRadius: 999,
    transform: [{ rotate: '-34deg' }],
  },
  spark: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 6,
    height: 6,
    borderWidth: 1.4,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});
