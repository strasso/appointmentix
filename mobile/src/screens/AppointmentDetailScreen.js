import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

const FALLBACK_IMAGE = require('../../_mowgli_export/screens/images/treatment-facial.jpg');

function formatAppointmentDate(ts) {
  if (!ts) return 'Termin wird bestätigt';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return 'Termin wird bestätigt';
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatAppointmentTime(ts) {
  if (!ts) return 'Zeit folgt separat';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return 'Zeit folgt separat';
  return `${new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date)} Uhr`;
}

function statusLabel(status) {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'Bestätigt';
    case 'reschedule_requested':
      return 'Verschiebung angefragt';
    case 'rescheduled':
      return 'Verschoben';
    case 'completed':
      return 'Abgeschlossen';
    case 'canceled':
      return 'Storniert';
    default:
      return 'Termin wird bestätigt';
  }
}

export default function AppointmentDetailScreen({
  mowgliTheme,
  appointment,
  onBack,
  onOpenMaps,
  onCallClinic,
  onRequestReschedule,
  onCancelAppointment,
  actionLoading,
  treatmentImageUrl,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const safeAppointment = appointment || {};
  const actionable = !['completed', 'canceled'].includes(String(safeAppointment.status || '').toLowerCase());

  return (
    <View style={[detailStyles.screen, { backgroundColor: theme.page }]}>
      <View style={[detailStyles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        <Pressable onPress={onBack} style={({ pressed }) => [detailStyles.iconButton, pressed && detailStyles.iconButtonPressed]}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[detailStyles.headerTitle, { color: theme.text }]}>Termin Details</Text>
        <View style={detailStyles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={detailStyles.content} showsVerticalScrollIndicator={false}>
        <View style={detailStyles.heroRow}>
          <Image source={treatmentImageUrl ? { uri: treatmentImageUrl } : FALLBACK_IMAGE} style={detailStyles.heroImage} />
          <View style={detailStyles.heroCopy}>
            <Text style={[detailStyles.heroTitle, { color: theme.text }]}>{safeAppointment.treatmentName || 'Treatment'}</Text>
            <View style={detailStyles.inlineMetaRow}>
              <View style={detailStyles.inlineMeta}>
                <Ionicons name="time-outline" size={12} color={theme.textMuted} />
                <Text style={[detailStyles.inlineMetaText, { color: theme.textMuted }]}>
                  {safeAppointment.treatmentDurationMinutes ? `${safeAppointment.treatmentDurationMinutes} Min` : 'Dauer offen'}
                </Text>
              </View>
              {!!safeAppointment.practitionerName && (
                <View style={detailStyles.inlineMeta}>
                  <Ionicons name="person-outline" size={12} color={theme.textMuted} />
                  <Text style={[detailStyles.inlineMetaText, { color: theme.textMuted }]}>{safeAppointment.practitionerName}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={[detailStyles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[detailStyles.cardGlow, { backgroundColor: theme.heroGlow }]} />
          <View style={detailStyles.cardTopRow}>
            <View>
              <Text style={[detailStyles.eyebrow, { color: theme.accent }]}>Zeitpunkt</Text>
              <Text style={[detailStyles.cardTitle, { color: theme.text }]}>{formatAppointmentDate(safeAppointment.startsAt)}</Text>
              <Text style={[detailStyles.cardAccent, { color: theme.accent }]}>{formatAppointmentTime(safeAppointment.startsAt)}</Text>
            </View>
            <View style={[detailStyles.iconBadge, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}>
              <Ionicons name="calendar-outline" size={18} color={theme.accent} />
            </View>
          </View>
          <Text style={[detailStyles.statusLine, { color: theme.textMuted }]}>
            {statusLabel(safeAppointment.status)}
          </Text>
        </View>

        <View>
          <Text style={[detailStyles.sectionLabel, { color: theme.accent }]}>Standort</Text>
          <View style={detailStyles.locationRow}>
            <View style={[detailStyles.locationBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="location-outline" size={18} color={theme.accent} />
            </View>
            <View style={detailStyles.locationCopy}>
              <Text style={[detailStyles.locationTitle, { color: theme.text }]}>
                {safeAppointment.locationLabel || 'Deine Klinik'}
              </Text>
              <Text style={[detailStyles.locationBody, { color: theme.textMuted }]}>
                {safeAppointment.locationAddress || 'Adresse wird von deiner Klinik bereitgestellt.'}
              </Text>
              <View style={detailStyles.locationActions}>
                <Pressable
                  onPress={onOpenMaps}
                  style={({ pressed }) => [
                    detailStyles.locationButton,
                    { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder },
                    pressed && detailStyles.iconButtonPressed,
                  ]}
                >
                  <Ionicons name="map-outline" size={14} color={theme.accent} />
                  <Text style={[detailStyles.locationButtonText, { color: theme.accent }]}>Maps</Text>
                </Pressable>
                <Pressable
                  onPress={onCallClinic}
                  style={({ pressed }) => [
                    detailStyles.locationButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    pressed && detailStyles.iconButtonPressed,
                  ]}
                >
                  <Ionicons name="call-outline" size={14} color={theme.textMuted} />
                  <Text style={[detailStyles.locationButtonText, { color: theme.textMuted }]}>Anrufen</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {!!safeAppointment.notes && (
          <View style={[detailStyles.noteCard, { backgroundColor: theme.surface, borderLeftColor: theme.accent }]}>
            <Text style={[detailStyles.noteText, { color: theme.textMuted }]}>{safeAppointment.notes}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[detailStyles.footer, { borderTopColor: theme.border, backgroundColor: theme.page }]}>
        <Pressable
          disabled={!actionable || actionLoading}
          onPress={onRequestReschedule}
          style={({ pressed }) => [
            detailStyles.secondaryAction,
            { borderColor: theme.accent, opacity: !actionable || actionLoading ? 0.45 : 1 },
            pressed && actionable && detailStyles.iconButtonPressed,
          ]}
        >
          <Text style={[detailStyles.secondaryActionText, { color: theme.accent }]}>
            {actionLoading ? 'Bitte warten ...' : 'Verschieben'}
          </Text>
        </Pressable>
        <Pressable
          disabled={!actionable || actionLoading}
          onPress={onCancelAppointment}
          style={({ pressed }) => [
            detailStyles.secondaryAction,
            { borderColor: '#B86A5D', opacity: !actionable || actionLoading ? 0.45 : 1 },
            pressed && actionable && detailStyles.iconButtonPressed,
          ]}
        >
          <Text style={[detailStyles.secondaryActionText, { color: '#B86A5D' }]}>Stornieren</Text>
        </Pressable>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  headerTitle: {
    fontFamily: 'Georgia',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 44,
    gap: 28,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 18,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 14,
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  heroTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '600',
  },
  inlineMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineMetaText: {
    fontSize: 13,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    inset: 0,
    top: -34,
    right: -22,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.45,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardAccent: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 14,
  },
  locationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCopy: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 2,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
