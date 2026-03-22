import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

function RewardCard({ styles, theme, item, points, onRedeem }) {
  const canRedeem = points >= item.requiredPoints;
  const progress = Math.max(0, Math.min(1, points / Math.max(1, item.requiredPoints)));

  return (
    <View style={[styles.mowgliRewardCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.mowgliRewardCardVisual, { backgroundColor: theme.page, borderColor: theme.border }]}>
        <Ionicons name="gift-outline" size={30} color={theme.accent} />
      </View>
      <View style={styles.mowgliRewardCardBody}>
        <Text style={[styles.mowgliRewardCardTitle, { color: theme.text }]} numberOfLines={2}>
          {item.label}
        </Text>
        <View style={styles.mowgliRewardCardPointsRow}>
          <Text style={[styles.mowgliRewardCardPoints, { color: theme.accent }]}>{item.requiredPoints}</Text>
          <Text style={[styles.mowgliRewardCardPointsMeta, { color: theme.textMuted }]}>Punkte</Text>
        </View>
        <View style={[styles.mowgliRewardCardTrack, { backgroundColor: theme.input }]}>
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

function ActionRow({ styles, theme, action, rewardActionIcon, claimActionPoints }) {
  return (
    <Pressable
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
      <View style={[styles.mowgliRewardsInlineCta, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
        <Text style={[styles.mowgliRewardsInlineCtaText, { color: theme.accent }]}>Öffnen</Text>
      </View>
    </Pressable>
  );
}

function HistoryRow({ styles, theme, entry, formatDate, formatPrice }) {
  const isPoints = 'points' in entry;
  const positive = isPoints ? entry.points >= 0 : true;

  return (
    <View style={[styles.mowgliRewardsHistoryRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View
        style={[
          styles.mowgliRewardsHistoryIcon,
          { backgroundColor: theme.input, borderColor: theme.border },
        ]}
      >
        <Ionicons
          name={isPoints ? (positive ? 'add-outline' : 'remove-outline') : 'wallet-outline'}
          size={16}
          color={positive ? theme.accent : '#B86A5D'}
        />
      </View>
      <View style={styles.mowgliRewardsHistoryCopy}>
        <Text style={[styles.mowgliRewardsHistoryTitle, { color: theme.text }]}>{entry.title}</Text>
        <Text style={[styles.mowgliRewardsHistoryMeta, { color: theme.textMuted }]}>{formatDate(entry.createdAt)}</Text>
      </View>
      <Text style={[styles.mowgliRewardsHistoryValue, { color: positive ? theme.accent : '#B86A5D' }]}>
        {isPoints ? `${positive ? '+' : ''}${entry.points}` : formatPrice(entry.amount)}
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
  const availableRewards = Array.isArray(rewardRedeems) ? rewardRedeems : [];
  const actions = Array.isArray(rewardActions) ? rewardActions : [];
  const historyItems = Array.isArray(rewardHistoryItems) ? rewardHistoryItems : [];

  return (
    <View style={[styles.mowgliScreenShell, { backgroundColor: theme.page }]}>
      <View style={styles.mowgliRewardsHeader}>
        <Text style={[styles.mowgliHeaderSmallLabel, { color: theme.textMuted }]}>Wallet</Text>
        <Text style={[styles.mowgliRewardsHeaderTitle, { color: theme.text }]}>Rewards</Text>
        <Text style={[styles.mowgliRewardsHeaderSubtitle, { color: theme.textMuted }]}>
          Punkte sammeln, einlösen und deinen aktuellen Wert im Blick behalten.
        </Text>
      </View>

      <View style={[styles.mowgliRewardsBalancePanel, { backgroundColor: theme.shell, borderColor: theme.borderStrong }]}>
        <View pointerEvents="none" style={[styles.mowgliRewardsBalanceGlow, { backgroundColor: theme.heroGlow }]} />
        <View style={[styles.mowgliRewardsBalanceIcon, { backgroundColor: theme.accent }]}>
          <Ionicons name="diamond-outline" size={22} color={theme.primaryButtonText} />
        </View>
        <Text style={[styles.mowgliRewardsBalanceLabel, { color: theme.accent }]}>Ihr Punktestand</Text>
        <Text style={[styles.mowgliRewardsBalanceValue, { color: theme.text }]}>{points}</Text>
        <Text style={[styles.mowgliRewardsBalanceSubtext, { color: theme.textSoft }]}>
          {clinicProfile.name || 'Klinik'} • Wallet {formatPrice(walletCents)}
        </Text>

        <View style={styles.mowgliRewardsStatsRow}>
          <View style={[styles.mowgliRewardsStatCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.mowgliRewardsStatLabel, { color: theme.textMuted }]}>Wallet</Text>
            <Text style={[styles.mowgliRewardsStatValue, { color: theme.text }]}>{formatPrice(walletCents)}</Text>
          </View>
          <View style={[styles.mowgliRewardsStatCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.mowgliRewardsStatLabel, { color: theme.textMuted }]}>Status</Text>
            <Text style={[styles.mowgliRewardsStatValue, { color: theme.accent }]}>
              {points >= 1000 ? 'Aktiv' : 'Im Aufbau'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Verfügbar</Text>
      </View>
      {availableRewards.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mowgliRewardCardRow}>
          {availableRewards.map((item) => (
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
      ) : (
        <View style={[styles.mowgliEmptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="gift-outline" size={18} color={theme.textMuted} />
          <Text style={[styles.mowgliEmptyTitle, { color: theme.text }]}>Noch keine Rewards verfügbar</Text>
          <Text style={[styles.mowgliEmptyBody, { color: theme.textMuted }]}>
            Neue Einlösungen erscheinen hier, sobald die Klinik Rewards konfiguriert hat.
          </Text>
        </View>
      )}

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Punkte sammeln</Text>
      </View>
      <View style={styles.mowgliRewardsActionList}>
        {actions.map((action) => (
          <ActionRow
            key={action.id}
            styles={styles}
            theme={theme}
            action={action}
            rewardActionIcon={rewardActionIcon}
            claimActionPoints={claimActionPoints}
          />
        ))}
      </View>

      <View style={styles.mowgliSectionHeaderRow}>
        <Text style={[styles.mowgliSectionTitleSmall, { color: theme.text }]}>Historie</Text>
      </View>
      <View style={styles.mowgliRewardsHistoryList}>
        {historyItems.length === 0 && (
          <View style={[styles.mowgliEmptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time-outline" size={18} color={theme.textMuted} />
            <Text style={[styles.mowgliEmptyTitle, { color: theme.text }]}>Noch keine Rewards-Historie</Text>
            <Text style={[styles.mowgliEmptyBody, { color: theme.textMuted }]}>
              Sobald Punkte gesammelt oder eingelöst wurden, erscheinen sie hier.
            </Text>
          </View>
        )}
        {historyItems.map((entry) => (
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
