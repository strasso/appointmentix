import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMowgliTheme } from '../theme/tokens';

function formatDateParts(ts) {
  if (!ts) {
    return { day: '—', month: 'Offen' };
  }
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) {
    return { day: '—', month: 'Offen' };
  }
  const day = new Intl.DateTimeFormat('de-DE', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(date).replace('.', '');
  return { day, month };
}

function formatTimeLabel(ts) {
  if (!ts) return 'Termin wird von der Klinik bestätigt';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return 'Termin wird von der Klinik bestätigt';
  return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function statusLabel(status) {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'Bestätigt';
    case 'reschedule_requested':
      return 'Verschiebung';
    case 'rescheduled':
      return 'Verschoben';
    case 'completed':
      return 'Abgeschlossen';
    case 'canceled':
      return 'Storniert';
    default:
      return 'Ausstehend';
  }
}

function statusTone(theme, status, segment) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'canceled') {
    return {
      backgroundColor: 'rgba(184,106,93,0.12)',
      borderColor: 'rgba(184,106,93,0.28)',
      color: '#B86A5D',
    };
  }
  if (segment === 'past' || normalized === 'completed') {
    return {
      backgroundColor: theme.surface,
      borderColor: theme.borderStrong,
      color: theme.textMuted,
    };
  }
  return {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
    color: theme.textInverse,
  };
}

function AppointmentCard({ theme, appointment, onPress }) {
  const segment = appointment?.segment || 'upcoming';
  const { day, month } = formatDateParts(appointment?.startsAt);
  const tone = statusTone(theme, appointment?.status, segment);

  return (
    <Pressable
      onPress={() => onPress(appointment)}
      style={({ pressed }) => [
        localStyles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        pressed && localStyles.cardPressed,
      ]}
    >
      <View style={[localStyles.cardGlow, { backgroundColor: theme.heroGlow }]} />
      <View style={[localStyles.dateBox, { backgroundColor: theme.page, borderColor: theme.border }]}>
        <Text style={[localStyles.dateMonth, { color: theme.textMuted }]}>{month}</Text>
        <Text style={[localStyles.dateDay, { color: theme.text }]}>{day}</Text>
      </View>

      <View style={localStyles.cardCopy}>
        <Text style={[localStyles.cardTitle, { color: theme.text }]} numberOfLines={1}>
          {appointment?.treatmentName || 'Termin'}
        </Text>
        <View style={localStyles.metaRow}>
          <Ionicons name="time-outline" size={13} color={theme.textMuted} />
          <Text style={[localStyles.metaText, { color: theme.textMuted }]}>{formatTimeLabel(appointment?.startsAt)}</Text>
        </View>
        <View style={localStyles.metaRow}>
          <Ionicons name="location-outline" size={13} color={theme.textMuted} />
          <Text style={[localStyles.metaText, { color: theme.textMuted }]} numberOfLines={1}>
            {appointment?.locationLabel || 'Deine Klinik'}
          </Text>
        </View>
      </View>

      <View style={[localStyles.statusPill, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
        <Text style={[localStyles.statusText, { color: tone.color }]}>{statusLabel(appointment?.status)}</Text>
      </View>
    </Pressable>
  );
}

export default function AppointmentsScreen({
  mowgliTheme,
  appointments,
  appointmentsLoading,
  appointmentSegment,
  setAppointmentSegment,
  openAppointment,
  backToProfile,
  openShopBrowse,
}) {
  const theme = mowgliTheme || createMowgliTheme({ mode: 'dark' });
  const filteredAppointments = useMemo(
    () => (Array.isArray(appointments) ? appointments.filter((item) => (item?.segment || 'upcoming') === appointmentSegment) : []),
    [appointmentSegment, appointments]
  );

  return (
    <View style={[localStyles.screen, { backgroundColor: theme.page }]}>
      <View style={[localStyles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
        <View style={localStyles.headerTop}>
          <Pressable onPress={backToProfile} style={({ pressed }) => [localStyles.iconButton, pressed && localStyles.iconButtonPressed]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={[localStyles.headerTitle, { color: theme.text }]}>Meine Termine</Text>
          <View style={localStyles.headerSpacer} />
        </View>
        <View style={[localStyles.segmentRow, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setAppointmentSegment('upcoming')} style={localStyles.segmentButton}>
            <Text
              style={[
                localStyles.segmentText,
                {
                  color: appointmentSegment === 'upcoming' ? theme.accent : theme.textMuted,
                  borderBottomColor: appointmentSegment === 'upcoming' ? theme.accent : 'transparent',
                },
              ]}
            >
              Kommende
            </Text>
          </Pressable>
          <Pressable onPress={() => setAppointmentSegment('past')} style={localStyles.segmentButton}>
            <Text
              style={[
                localStyles.segmentText,
                {
                  color: appointmentSegment === 'past' ? theme.accent : theme.textMuted,
                  borderBottomColor: appointmentSegment === 'past' ? theme.accent : 'transparent',
                },
              ]}
            >
              Vergangene
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={localStyles.body}>
        {appointmentsLoading ? (
          <View style={localStyles.loadingWrap}>
            <ActivityIndicator size="small" color={theme.accent} />
            <Text style={[localStyles.loadingText, { color: theme.textMuted }]}>Termine werden geladen ...</Text>
          </View>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={String(appointment?.id || Math.random())}
              theme={theme}
              appointment={appointment}
              onPress={openAppointment}
            />
          ))
        ) : (
          <View style={localStyles.emptyState}>
            <View style={[localStyles.emptyIcon, { backgroundColor: theme.accentSurface, borderColor: theme.accentBorder }]}>
              <Ionicons name={appointmentSegment === 'upcoming' ? 'calendar-clear-outline' : 'time-outline'} size={26} color={theme.accent} />
            </View>
            <Text style={[localStyles.emptyTitle, { color: theme.text }]}>
              {appointmentSegment === 'upcoming' ? 'Keine kommenden Termine' : 'Noch keine vergangenen Termine'}
            </Text>
            <Text style={[localStyles.emptyBody, { color: theme.textMuted }]}>
              {appointmentSegment === 'upcoming'
                ? 'Sobald du eine Behandlung kaufst oder einen Termin abstimmst, erscheint er hier.'
                : 'Abgeschlossene oder stornierte Termine werden hier gesammelt.'}
            </Text>
            {appointmentSegment === 'upcoming' && (
              <Pressable
                onPress={openShopBrowse}
                style={({ pressed }) => [
                  localStyles.cta,
                  { backgroundColor: theme.primaryButtonBg },
                  pressed && localStyles.cardPressed,
                ]}
              >
                <Text style={[localStyles.ctaText, { color: theme.primaryButtonText }]}>Treatment auswählen</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    opacity: 0.88,
  },
  headerTitle: {
    fontFamily: 'Georgia',
    fontSize: 27,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
  },
  segmentButton: {
    paddingBottom: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    paddingBottom: 14,
    borderBottomWidth: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 130,
    gap: 14,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ translateY: -1 }],
    opacity: 0.96,
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.55,
  },
  dateBox: {
    width: 56,
    height: 66,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
  },
  dateMonth: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 5,
  },
  dateDay: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 23,
  },
  cardCopy: {
    flex: 1,
    gap: 7,
    paddingTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 76,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 290,
  },
  cta: {
    marginTop: 8,
    minWidth: 210,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
