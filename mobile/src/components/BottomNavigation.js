import React from 'react';
import { View } from 'react-native';
import BottomTab from './BottomTab';

export default function BottomNavigation({ styles, mainTab, switchMainTab }) {
  return (
    <View style={styles.bottomBar}>
      <View pointerEvents="none" style={styles.bottomBarGlow} />
      <View pointerEvents="none" style={styles.bottomBarGloss} />
      <BottomTab styles={styles} label="Home" active={mainTab === 'home'} onPress={() => switchMainTab('home')} />
      <BottomTab styles={styles} label="Shop" active={mainTab === 'shop'} onPress={() => switchMainTab('shop')} />
      <BottomTab styles={styles} label="Scan" active={mainTab === 'scan'} onPress={() => switchMainTab('scan')} />
      <BottomTab styles={styles} label="Rewards" active={mainTab === 'rewards'} onPress={() => switchMainTab('rewards')} />
      <BottomTab styles={styles} label="Profil" active={mainTab === 'profile'} onPress={() => switchMainTab('profile')} />
    </View>
  );
}
