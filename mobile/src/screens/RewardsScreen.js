import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

function formatPoints(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString('de-DE');
}

function rewardIcon(index) {
  const icons = ['cafe-outline', 'pricetag-outline', 'sparkles-outline', 'gift-outline'];
  return icons[index % icons.length];
}

function AvailableRewardCard({ theme, item, points, index, onRedeem }) {
  const canRedeem = Number(points || 0) >= Number(item.requiredPoints || 0);
  const progress = Math.max(0, Math.min(1, Number(points || 0) / Math.max(1, Number(item.requiredPoints || 0))));

  return (
    <Pressable
      onPress={() => canRedeem && onRedeem(item)}
      disabled={!canRedeem}
      style={({ pressed }) => [
        rewardsStyles.rewardCard,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.border,
          opacity: canRedeem ? 1 : 0.94,
        },
        pressed && canRedeem && rewardsStyles.pressed,
      ]}
    >
      <View style={[rewardsStyles.rewardVisual, { backgroundColor: theme.page }]}>
        <Ionicons name={rewardIcon(index)} size={34} color={theme.accent} />
      </View>

      <View style={rewardsStyles.rewardCardBody}>
        <Text style={[rewardsStyles.rewardCardTitle, { color: theme.text }]} numberOfLines={2}>
          {item.label}
        </Text>
        <View style={rewardsStyles.rewardPointsRow}>
          <Text style={[rewardsStyles.rewardPoints, { color: theme.accent }]}>{formatPoints(item.requiredPoints)}</Text>
          <Text style={[rewardsStyles.rewardPointsMeta, { color: theme.textMuted }]}>Pkt</Text>
        </View>
        <View style={[rewardsStyles.rewardTrack, { backgroundColor: theme.page }]}>
          <View
            style={[
              rewardsStyles.rewardTrackFill,
              {
                backgroundColor: theme.accent,
                width: `${Math.max(8, Math.round(progress * 100))}%`,
              },
            ]}
          />
        </View>
        <Text style={[rewardsStyles.rewardProgressText, { color: canRedeem ? theme.accent : theme.textMuted }]}>
          {canRedeem ? 'Einlösbar' : `${formatPoints(points)} / ${formatPoints(item.requiredPoints)}`}
        </Text>
      </View>
    </Pressable>
  );
}

function HistoryRow({ theme, entry, formatDate, formatPrice }) {
  const isPoints = Object.prototype.hasOwnProperty.call(entry, 'points');
  const value = isPoints ? Number(entry.points || 0) : Number(entry.amount || 0);
  const positive = isPoints ? value >= 0 : true;
  const tint = positive ? theme.accent : '#FF6B6B';

  return (
    <View style={[rewardsStyles.historyRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <View style={[rewardsStyles.historyIcon, { backgroundColor: positive ? theme.accentSurface : 'rgba(255,107,107,0.12)' }]}>
        <Ionicons
          name={isPoints ? (positive ? 'add-outline' : 'remove-outline') : 'wallet-outline'}
          size={16}
          color={tint}
        />
      </View>
      <View style={rewardsStyles.historyCopy}>
        <Text style={[rewardsStyles.historyTitle, { color: theme.text }]}>{entry.title}</Text>
        <Text style={[rewardsStyles.historyMeta, { color: theme.textMuted }]}>{formatDate(entry.createdAt)}</Text>
      </View>
      <Text style={[rewardsStyles.historyValue, { color: tint }]}>
        {isPoints ? `${positive ? '+' : ''}${formatPoints(value)}` : formatPrice(value)}
      </Text>
    </View>
  );
}

function ActionRow({ theme, action, rewardActionIcon, claimActionPoints }) {
  return (
    <Pressable
      onPress={() => claimActionPoints(action)}
      style={({ pressed }) => [
        rewardsStyles.actionRow,
        { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        pressed && rewardsStyles.pressed,
      ]}
    >
      <View style={[rewardsStyles.actionIconWrap, { backgroundColor: theme.accentSurface }]}>
        <Ionicons name={rewardActionIcon(action.id)} size={16} color={theme.accent} />
      </View>
      <View style={rewardsStyles.actionCopy}>
        <Text style={[rewardsStyles.actionTitle, { color: theme.text }]}>{action.label}</Text>
        <Text style={[rewardsStyles.actionMeta, { color: theme.textMuted }]}>+{formatPoints(action.points)} Punkte</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </Pressable>
  );
}

export default function RewardsScreen({
  mowgliTheme,
  clinicProfile,
  points,
  rewardHistoryItems,
  walletCents,
  formatPrice,
  rewardActions,
  rewardActionIcon,
  claimActionPoints,
  rewardRedeems,
  redeemReward,
  formatDate,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const rewards = Array.isArray(rewardRedeems) ? rewardRedeems : [];
  const history = Array.isArray(rewardHistoryItems) ? rewardHistoryItems : [];
  const actions = Array.isArray(rewardActions) ? rewardActions : [];

  return (
    <View style={[rewardsStyles.screen, { backgroundColor: theme.page }]}>
      <View style={rewardsStyles.header}>
        <Text style={[rewardsStyles.headerTitle, { color: theme.text }]}>Rewards</Text>
        <Text style={[rewardsStyles.headerSubtitle, { color: theme.textMuted }]}>Verdienen & Einlösen</Text>
      </View>

      <View style={[rewardsStyles.balanceCard, { backgroundColor: theme.shell, borderColor: theme.borderStrong }]}>
        <View style={[rewardsStyles.balanceGlow, { backgroundColor: theme.heroGlow }]} />
        <View style={[rewardsStyles.balanceIcon, { backgroundColor: theme.accent }]}>
          <Ionicons name="sparkles-outline" size={24} color={theme.primaryButtonText} />
        </View>
        <Text style={[rewardsStyles.balanceLabel, { color: theme.accent }]}>Ihr Punktestand</Text>
        <Text style={[rewardsStyles.balanceValue, { color: theme.text }]}>{formatPoints(points)}</Text>
        <Text style={[rewardsStyles.balanceSubtext, { color: theme.textMuted }]}>
          {clinicProfile.name || 'Klinik'} • Wallet {formatPrice(walletCents)}
        </Text>
        <View style={[rewardsStyles.balanceChip, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}>
          <Text style={[rewardsStyles.balanceChipText, { color: theme.accent }]}>
            1€ = 1 Punkt
          </Text>
        </View>
      </View>

      <View style={rewardsStyles.sectionHeader}>
        <Text style={[rewardsStyles.sectionTitle, { color: theme.text }]}>Verfügbar</Text>
        <Text style={[rewardsStyles.sectionLink, { color: theme.accent }]}>Alle</Text>
      </View>
      {rewards.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={rewardsStyles.rewardRow}
        >
          {rewards.map((item, index) => (
            <AvailableRewardCard
              key={item.id}
              theme={theme}
              item={item}
              points={points}
              index={index}
              onRedeem={redeemReward}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={[rewardsStyles.emptyCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons name="gift-outline" size={18} color={theme.textMuted} />
          <Text style={[rewardsStyles.emptyTitle, { color: theme.text }]}>Noch keine Rewards verfügbar</Text>
          <Text style={[rewardsStyles.emptyBody, { color: theme.textMuted }]}>
            Neue Einlösungen erscheinen hier, sobald die Klinik Rewards konfiguriert hat.
          </Text>
        </View>
      )}

      <View style={rewardsStyles.sectionHeader}>
        <Text style={[rewardsStyles.sectionTitle, { color: theme.text }]}>Historie</Text>
        <Text style={[rewardsStyles.sectionLink, { color: theme.accent }]}>Alle</Text>
      </View>
      <View style={rewardsStyles.historyList}>
        {history.length === 0 ? (
          <View style={[rewardsStyles.emptyCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={18} color={theme.textMuted} />
            <Text style={[rewardsStyles.emptyTitle, { color: theme.text }]}>Noch keine Rewards-Historie</Text>
            <Text style={[rewardsStyles.emptyBody, { color: theme.textMuted }]}>
              Sobald Punkte gesammelt oder eingelöst wurden, erscheinen sie hier.
            </Text>
          </View>
        ) : (
          history.map((entry) => (
            <HistoryRow
              key={entry.id}
              theme={theme}
              entry={entry}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          ))
        )}
      </View>

      {actions.length > 0 && (
        <>
          <View style={rewardsStyles.sectionHeader}>
            <Text style={[rewardsStyles.sectionTitle, { color: theme.text }]}>Punkte sammeln</Text>
          </View>
          <View style={rewardsStyles.actionList}>
            {actions.map((action) => (
              <ActionRow
                key={action.id}
                theme={theme}
                action={action}
                rewardActionIcon={rewardActionIcon}
                claimActionPoints={claimActionPoints}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const rewardsStyles = StyleSheet.create({
  screen: {
    paddingTop: 18,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  balanceCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 28,
  },
  balanceGlow: {
    position: 'absolute',
    right: -24,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  balanceSubtext: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  balanceChip: {
    marginTop: 16,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  balanceChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '300',
  },
  sectionLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  rewardRow: {
    paddingLeft: 24,
    paddingRight: 20,
    paddingBottom: 10,
    gap: 16,
  },
  rewardCard: {
    width: 144,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rewardVisual: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCardBody: {
    padding: 12,
  },
  rewardCardTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardPointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  rewardPoints: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  rewardPointsMeta: {
    fontSize: 10,
    lineHeight: 14,
  },
  rewardTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  rewardTrackFill: {
    height: '100%',
    borderRadius: 999,
  },
  rewardProgressText: {
    fontSize: 10,
    lineHeight: 14,
  },
  historyList: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyCopy: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 11,
    lineHeight: 15,
  },
  historyValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  actionList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCard: {
    marginHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ translateY: -1 }],
  },
});
