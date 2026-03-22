import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

function RewardCard({ styles, theme, item, points, onRedeem }) {
  const canRedeem = points >= item.requiredPoints;
  const progress = Math.max(0, Math.min(1, points / Math.max(1, item.requiredPoints)));
  return (
    <View style={[styles.mowgliRewardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.mowgliRewardCardVisual, { backgroundColor: theme.page }]}>
        <Ionicons name="gift-outline" size={34} color={theme.accent} />
      </View>
      <View style={styles.mowgliRewardCardBody}>
        <Text style={[styles.mowgliRewardCardTitle, { color: theme.text }]} numberOfLines={2}>
          {item.label}
        </Text>
        <View style={styles.mowgliRewardCardPointsRow}>
          <Text style={[styles.mowgliRewardCardPoints, { color: theme.accent }]}>{item.requiredPoints}</Text>
          <Text style={[styles.mowgliRewardCardPointsMeta, { color: theme.textMuted }]}>Pkt</Text>
        </View>
        <View style={[styles.mowgliRewardCardTrack, { backgroundColor: theme.page }]}>
          <View
            style={[
              styles.mowgliRewardCardTrackFill,
              { backgroundColor: theme.accent, width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
        <Text style={[styles.mowgliRewardCardProgressLabel, { color: canRedeem ? theme.accent : theme.textMuted }]}>
          {canRedeem ? 'Einlösbar' : `${points} / ${item.requiredPoints}`}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.mowgliRewardCardButton,
            {
              backgroundColor: canRedeem ? theme.primaryButtonBg : theme.surfaceAlt,
              borderColor: canRedeem ? theme.borderStrong : theme.border,
            },
            !canRedeem && styles.ctaDisabled,
            pressed && canRedeem && styles.mowgliLiftSoft,
          ]}
          disabled={!canRedeem}
          onPress={() => onRedeem(item)}
        >
          <Text style={[styles.mowgliRewardCardButtonText, { color: canRedeem ? theme.primaryButtonText : theme.textMuted }]}>
            {canRedeem ? 'Einlösen' : 'Noch nicht genug'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function HistoryRow({ styles, theme, entry, formatDate, formatPrice }) {
  const isPoints = 'points' in entry;
  return (
    <View style={[styles.mowgliRewardsHistoryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View
        style={[
          styles.mowgliRewardsHistoryIcon,
          { backgroundColor: theme.input, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name={isPoints ? (entry.points >= 0 ? 'add-outline' : 'remove-outline') : 'wallet-outline'}
          size={16}
          color={isPoints ? theme.accent : theme.textMuted}
        />
      </View>
      <View style={styles.mowgliRewardsHistoryCopy}>
        <Text style={[styles.mowgliRewardsHistoryTitle, { color: theme.text }]}>{entry.title}</Text>
        <Text style={[styles.mowgliRewardsHistoryMeta, { color: theme.textMuted }]}>{formatDate(entry.createdAt)}</Text>
      </View>
      <Text style={[styles.mowgliRewardsHistoryValue, { color: isPoints ? theme.accent : theme.text }]}>
        {isPoints ? `${entry.points > 0 ? '+' : ''}${entry.points}` : formatPrice(entry.amount)}
      </Text>
    </View>
  );
}

export default function RewardsScreen({
  styles,
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

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliRewardsHeader}>
        <Text style={[styles.mowgliRewardsHeaderTitle, { color: theme.text }]}>Rewards</Text>
        <Text style={[styles.mowgliRewardsHeaderSubtitle, { color: theme.textMuted }]}>Verdienen & Einlösen</Text>
      </View>

      <View style={[styles.mowgliRewardsBalancePanel, { backgroundColor: theme.shell, borderColor: theme.border }]}>
        <View pointerEvents="none" style={[styles.mowgliRewardsBalanceGlow, { backgroundColor: theme.heroGlow }]} />
        <View style={[styles.mowgliRewardsBalanceIcon, { backgroundColor: theme.accent }]}>
          <Ionicons name="diamond-outline" size={22} color={theme.primaryButtonText} />
        </View>
        <Text style={[styles.mowgliRewardsBalanceLabel, { color: theme.accent }]}>Ihr Punktestand</Text>
        <Text style={[styles.mowgliRewardsBalanceValue, { color: theme.text }]}>{points}</Text>
        <View style={[styles.mowgliRewardsBalanceChip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
          <Text style={[styles.mowgliRewardsBalanceChipText, { color: theme.accent }]}>
            Wallet {formatPrice(walletCents)} • {clinicProfile.name || 'Klinik'}
          </Text>
        </View>
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Verfügbar</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mowgliRewardCardRow}>
        {rewardRedeems.map((item) => (
          <RewardCard
            key={item.id}
            styles={styles}
            theme={theme}
            item={item}
            points={points}
            onRedeem={redeemReward}
          />
        ))}
      </ScrollView>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Punkte sammeln</Text>
      </View>
      <View style={styles.mowgliRewardsActionList}>
        {rewardActions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.mowgliRewardsActionRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.mowgliLiftSoft,
            ]}
            onPress={() => claimActionPoints(action)}
          >
            <View style={[styles.mowgliRewardsActionIcon, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <Ionicons name={rewardActionIcon(action.id)} size={16} color={theme.accent} />
            </View>
            <View style={styles.mowgliRewardsActionCopy}>
              <Text style={[styles.mowgliRewardsActionTitle, { color: theme.text }]}>{action.label}</Text>
              <Text style={[styles.mowgliRewardsActionMeta, { color: theme.textMuted }]}>+{action.points} Punkte</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        ))}
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitle, { color: theme.text }]}>Historie</Text>
      </View>
      <View style={styles.mowgliRewardsHistoryList}>
        {rewardHistoryItems.length === 0 && (
          <View style={[styles.mowgliEmptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.mowgliEmptyTitle, { color: theme.text }]}>Noch keine Rewards-Historie</Text>
            <Text style={[styles.mowgliEmptyBody, { color: theme.textMuted }]}>
              Sobald Punkte gesammelt oder eingelöst wurden, erscheinen sie hier.
            </Text>
          </View>
        )}
        {rewardHistoryItems.map((entry) => (
          <HistoryRow
            key={entry.id}
            styles={styles}
            theme={theme}
            entry={entry}
            formatDate={formatDate}
            formatPrice={formatPrice}
          />
        ))}
      </View>
    </View>
  );
}
