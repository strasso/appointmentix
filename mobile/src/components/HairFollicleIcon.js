import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HairFollicleIcon({ active = false }) {
  const follicleColor = active ? '#253145' : '#3F4B5F';
  const skinColor = active ? '#D7DEE6' : '#E4EAF0';
  const lineColor = active ? '#BCC7D2' : '#CBD4DD';

  return (
    <View style={styles.canvas}>
      <View style={[styles.skinBase, { backgroundColor: skinColor }]} />
      <View style={[styles.skinArcLeft, { borderTopColor: lineColor }]} />
      <View style={[styles.skinArcRight, { borderTopColor: lineColor }]} />

      <View style={styles.leftGroup}>
        <View style={[styles.hairShaftLeft, { backgroundColor: follicleColor }]} />
        <View style={[styles.follicleLeft, { backgroundColor: follicleColor }]} />
      </View>

      <View style={styles.centerGroup}>
        <View style={[styles.hairShaftCenter, { backgroundColor: follicleColor }]} />
        <View style={[styles.follicleCenter, { backgroundColor: follicleColor }]} />
      </View>

      <View style={styles.rightGroup}>
        <View style={[styles.hairShaftRight, { backgroundColor: follicleColor }]} />
        <View style={[styles.follicleRight, { backgroundColor: follicleColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skinBase: {
    position: 'absolute',
    bottom: 4,
    left: 1,
    right: 1,
    height: 6,
    borderRadius: 999,
  },
  skinArcLeft: {
    position: 'absolute',
    bottom: 7,
    left: 4,
    width: 6,
    height: 4,
    borderTopWidth: 1.2,
    borderRadius: 999,
  },
  skinArcRight: {
    position: 'absolute',
    bottom: 7,
    right: 4,
    width: 6,
    height: 4,
    borderTopWidth: 1.2,
    borderRadius: 999,
  },
  leftGroup: {
    position: 'absolute',
    left: 3,
    bottom: 5,
    width: 5,
    height: 14,
    alignItems: 'center',
  },
  centerGroup: {
    position: 'absolute',
    bottom: 3,
    width: 8,
    height: 18,
    alignItems: 'center',
  },
  rightGroup: {
    position: 'absolute',
    right: 3,
    bottom: 5,
    width: 5,
    height: 14,
    alignItems: 'center',
  },
  hairShaftLeft: {
    width: 1.4,
    height: 10,
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
  hairShaftCenter: {
    width: 1.8,
    height: 13,
    borderRadius: 999,
  },
  hairShaftRight: {
    width: 1.4,
    height: 10,
    borderRadius: 999,
    transform: [{ rotate: '10deg' }],
  },
  follicleLeft: {
    marginTop: -1,
    width: 4,
    height: 5,
    borderRadius: 999,
  },
  follicleCenter: {
    marginTop: -1,
    width: 6,
    height: 7,
    borderRadius: 999,
  },
  follicleRight: {
    marginTop: -1,
    width: 4,
    height: 5,
    borderRadius: 999,
  },
});
