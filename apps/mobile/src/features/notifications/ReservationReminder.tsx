import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import {
    areLocalNotificationsAvailable,
    ensureNotificationPermission,
    hasScheduledReminders,
    scheduleReservationReminders,
    sendTestNotification,
    type ReminderScheduleResult,
} from './localNotifications';

type ReservationReminderProps = {
  reservation: { id: string; date: string; time: string };
};

type Status = 'checking' | 'idle' | 'active' | 'unavailable';

function scheduledMessage(result: ReminderScheduleResult): string {
  if (result.scheduledOneDay && result.scheduledTwoHours) {
    return 'Te vamos a avisar el día anterior y 2 horas antes de tu reserva.';
  }
  if (result.scheduledOneDay) {
    return 'Te vamos a avisar el día anterior a tu reserva.';
  }
  if (result.scheduledTwoHours) {
    return 'Te vamos a avisar 2 horas antes de tu reserva.';
  }
  return 'Tu reserva es muy pronto para programar avisos, pero podés probar la notificación.';
}

export function ReservationReminder({ reservation }: ReservationReminderProps) {
  const [status, setStatus] = useState<Status>('checking');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!areLocalNotificationsAvailable()) {
      setStatus('unavailable');
      return;
    }
    void hasScheduledReminders(reservation.id).then((scheduled) => {
      if (active) setStatus(scheduled ? 'active' : 'idle');
    });
    return () => {
      active = false;
    };
  }, [reservation.id]);

  const handleActivate = async () => {
    setBusy(true);
    try {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permiso necesario',
          'Activá las notificaciones para recibir el recordatorio de tu reserva.',
        );
        return;
      }
      const result = await scheduleReservationReminders(reservation);
      setStatus('active');
      Alert.alert('Recordatorio activado', scheduledMessage(result));
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    try {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permiso necesario',
          'Activá las notificaciones para probar el recordatorio.',
        );
        return;
      }
      await sendTestNotification();
      Alert.alert('Notificación de prueba', 'En unos segundos vas a recibir una notificación.');
    } finally {
      setBusy(false);
    }
  };

  const active = status === 'active';

  if (status === 'unavailable') {
    return (
      <Text style={styles.unavailable}>
        Los recordatorios necesitan la app instalada (no disponibles en Expo Go).
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, active && styles.buttonActive]}
        onPress={handleActivate}
        disabled={busy || status === 'checking'}
      >
        {busy ? (
          <ActivityIndicator color={active ? colors.primary : colors.surface} />
        ) : (
          <Text style={[styles.label, active && styles.labelActive]}>
            {active ? 'Recordatorio activo · Tocá para actualizar' : 'Activar recordatorio'}
          </Text>
        )}
      </Pressable>
      <Pressable style={styles.testButton} onPress={handleTest} disabled={busy}>
        <Text style={styles.testLabel}>Probar notificación</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, marginTop: spacing.xs },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  buttonActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  label: { ...typography.body, color: colors.surface, fontWeight: '700' },
  labelActive: { color: colors.primary },
  testButton: { alignItems: 'center', paddingVertical: spacing.xs },
  testLabel: { ...typography.caption, color: colors.accent, fontWeight: '600' },
  unavailable: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
