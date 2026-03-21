import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function FaceContourIcon({ active = false }) {
  const stroke = active ? '#243144' : '#435165';
  const soft = active ? '#DCE5EE' : '#E8EEF4';

  return (
    <View style={styles.canvas}>
      <View style={[styles.faceOuter, { borderColor: stroke }]} />
      <View style={[styles.cheek, { backgroundColor: soft }]} />
      <View style={[styles.profileLine, { backgroundColor: stroke }]} />
      <View style={[styles.neckLine, { backgroundColor: stroke }]} />
      <View style={[styles.crownAccent, { backgroundColor: soft }]} />
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
  faceOuter: {
    width: 14,
    height: 19,
    borderWidth: 1.7,
    borderRadius: 999,
  },
  cheek: {
    position: 'absolute',
    bottom: 5,
    width: 8,
    height: 5,
    borderRadius: 999,
  },
  profileLine: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 1.7,
    height: 9,
    borderRadius: 999,
    transform: [{ rotate: '10deg' }],
  },
  neckLine: {
    position: 'absolute',
    bottom: 3,
    right: 9,
    width: 1.7,
    height: 5,
    borderRadius: 999,
    transform: [{ rotate: '18deg' }],
  },
  crownAccent: {
    position: 'absolute',
    top: 2,
    width: 10,
    height: 4,
    borderRadius: 999,
  },
});
