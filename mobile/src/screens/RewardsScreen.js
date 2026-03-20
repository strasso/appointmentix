import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { THEME } from '../theme/tokens';

export default function RewardsScreen({
  styles,
  clinicProfile,
  cartCount,
  onSearchPress,
  onCartPress,
  liquidShineAnim,
  floatingAuraAnim,
  points,
  rewardHistoryItems,
  patientGuestMode,
  walletCents,
  formatPrice,
  rewardsView,
  setRewardsView,
  rewardActions,
  rewardActionIcon,
  claimActionPoints,
  rewardRedeems,
  redeemReward,
  formatDate,
}) {
  return (
    <View>
      <TopHeader
        styles={styles}
        title="Vorteile"
        sectionLabel="Punkte & Wallet"
        subtitle="Treueprogramm deiner Klinik"
        clinicShortName={clinicProfile.shortName}
        clinicName={clinicProfile.name}
        onSearchPress={onSearchPress}
        onCartPress={onCartPress}
        cartCount={cartCount}
      />

      <View style={styles.rewardsBalanceCard}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rewardsLiquidShine,
            {
              transform: [{ translateX: liquidShineAnim }, { rotate: '18deg' }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rewardsOrbit,
            {
              transform: [
                {
                  translateY: floatingAuraAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
                {
                  translateX: floatingAuraAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 6],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.rewardsOrbitCore} />
          <View style={styles.rewardsOrbitRing} />
        </Animated.View>
        <View pointerEvents="none" style={styles.rewardsBalanceGloss} />
        <View pointerEvents="none" style={styles.rewardsBalancePearl} />
        <View pointerEvents="none" style={styles.rewardsBalanceGlow} />
        <View pointerEvents="none" style={styles.rewardsBalanceGlowSecondary} />
        <View style={styles.rewardsBalanceTopRow}>
          <View>
            <Text style={styles.rewardsBalanceEyebrow}>KLINIK WALLET</Text>
            <Text style={styles.rewardsBalanceLabel}>Treuepunkte & Guthaben</Text>
          </View>
          <View style={styles.rewardsBalanceStatusPill}>
            <Text style={styles.rewardsBalanceStatusText}>{patientGuestMode ? 'Gast' : 'Mitglied'}</Text>
          </View>
        </View>
        <Text style={styles.rewardsBalanceLogo}>O</Text>
        <View style={styles.rewardsCardStatsRow}>
          <View style={styles.rewardsCardStatItem}>
            <Text style={styles.rewardsCardStatValue}>{points}</Text>
            <Text style={styles.rewardsCardStatLabel}>Punkte</Text>
          </View>
          <View style={styles.rewardsCardStatItem}>
            <Text style={styles.rewardsCardStatValue}>{rewardHistoryItems.length}</Text>
            <Text style={styles.rewardsCardStatLabel}>Aktivitäten</Text>
          </View>
        </View>
        <View style={styles.rewardsBalanceFooter}>
          <View>
            <Text style={styles.rewardsBalanceMember}>{patientGuestMode ? 'Gastzugang' : 'Mitgliedschaft aktiv'}</Text>
            <Text style={styles.rewardsBalanceJoined}>Seit heute verbunden</Text>
          </View>
          <View style={styles.rewardsBalanceRight}>
            <Text style={styles.rewardsBalanceWallet}>{formatPrice(walletCents)}</Text>
            <Text style={styles.rewardsBalanceCash}>{clinicProfile.shortName || 'APP'} Guthaben</Text>
          </View>
        </View>
      </View>

      <View style={styles.rewardsHeaderRow}>
        <View>
          <Text style={styles.sectionEyebrow}>VORTEILE</Text>
          <Text style={styles.rewardsHeaderTitle}>Punkte, Aktionen und Vorteile</Text>
        </View>
        <Pressable onPress={() => setRewardsView('past')}>
          <Text style={styles.rewardsHeaderLink}>Verlauf öffnen ›</Text>
        </Pressable>
      </View>

      <View style={styles.rewardsSegmentRow}>
        <Pressable
          style={[styles.rewardsSegmentBtn, rewardsView === 'active' && styles.rewardsSegmentBtnActive]}
          onPress={() => setRewardsView('active')}
        >
          <Text
            style={[
              styles.rewardsSegmentText,
              rewardsView === 'active' && styles.rewardsSegmentTextActive,
            ]}
          >
            Aktiv
          </Text>
        </Pressable>
        <Pressable
          style={[styles.rewardsSegmentBtn, rewardsView === 'past' && styles.rewardsSegmentBtnActive]}
          onPress={() => setRewardsView('past')}
        >
          <Text
            style={[
              styles.rewardsSegmentText,
              rewardsView === 'past' && styles.rewardsSegmentTextActive,
            ]}
          >
            Vergangen
          </Text>
        </Pressable>
      </View>

      {rewardsView === 'active' && (
        <View>
          <Text style={styles.sectionLead}>
            Sammle Punkte durch Besuche und kleine Aktionen. Löse sie später direkt in Guthaben oder Extras ein.
          </Text>
          <Text style={styles.rewardsSectionTitle}>Mehr Punkte sammeln?</Text>
          {rewardActions.map((action) => (
            <View key={action.id} style={styles.rewardsActionRow}>
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <View style={styles.rewardsActionLeft}>
                <View style={styles.rewardsActionIconWrap}>
                  <Ionicons name={rewardActionIcon(action.id)} size={17} color={THEME.brandStrong} />
                </View>
                <Text style={styles.rewardsActionLabel}>{action.label}</Text>
              </View>
              <Pressable style={styles.rewardsActionBtn} onPress={() => claimActionPoints(action)}>
                <Text style={styles.rewardsActionBtnText}>+{action.points} Punkte</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.rewardsSectionTitle}>Punkte einlösen</Text>
          {rewardRedeems.map((item) => (
            <View key={item.id} style={styles.rewardsRedeemRow}>
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <View>
                <Text style={styles.rewardsRedeemLabel}>{item.label}</Text>
                <Text style={styles.rewardsRedeemHint}>{item.requiredPoints} Punkte</Text>
              </View>
              <Pressable
                style={[
                  styles.rewardsRedeemBtn,
                  points < item.requiredPoints && styles.rewardsRedeemBtnDisabled,
                ]}
                disabled={points < item.requiredPoints}
                onPress={() => redeemReward(item)}
              >
                <Text style={styles.rewardsRedeemBtnText}>Einlösen</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {rewardsView === 'past' && (
        <View style={styles.rewardsPastList}>
          <Text style={styles.sectionLead}>
            Hier siehst du abgeschlossene Vorteile und Einlösungen deiner letzten Besuche.
          </Text>
          {rewardHistoryItems.length === 0 && (
            <Text style={styles.rewardsPastEmpty}>Keine Vorteile in diesem Bereich.</Text>
          )}
          {rewardHistoryItems.map((entry) => (
            <View key={entry.id} style={styles.rewardsPastItem}>
              <View pointerEvents="none" style={styles.surfaceGlossStrip} />
              <Text style={styles.rewardsPastTitle}>{entry.title}</Text>
              <Text style={styles.rewardsPastMeta}>{formatDate(entry.createdAt)}</Text>
              {'points' in entry && (
                <Text style={styles.rewardsPastMeta}>+{entry.points} Punkte</Text>
              )}
              {'amount' in entry && (
                <Text style={styles.rewardsPastMeta}>{formatPrice(entry.amount)}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
