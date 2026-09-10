import {
    MAX_ACTIVE_RESERVATIONS,
    createReservationSchema,
    type Reservation,
} from '@claro-de-luna/shared';
import DateTimePicker, {
    type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { colors, spacing, typography } from '../../theme';
import { ReservationReminder } from '../notifications/ReservationReminder';
import {
    createReservation,
    deleteReservation,
    getMyReservations,
    updateReservation,
} from './api';

const statusLabels: Record<Reservation['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  no_show: 'No asististe',
};

const ACTIVE_STATUSES: Reservation['status'][] = ['pending', 'confirmed'];


// Format a Date as YYYY-MM-DD in local time (avoids the UTC shift of toISOString).
function toISODate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Backend contract is 24h HH:mm; the picker only feeds valid times.
function toHHmm(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Human-friendly 12h label with AM/PM for display only.
function formatTime12h(hhmm: string): string {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function ReservationScreen() {
  const queryClient = useQueryClient();
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: getMyReservations,
  });

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setDate('');
    setTime('');
    setPartySize('');
    setErrors({});
    setEditingId(null);
  };

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      resetForm();
      Alert.alert('¡Listo!', 'Tu reserva quedó registrada como pendiente.');
    },
    onError: () => Alert.alert('Ups', 'No pudimos crear la reserva. Revisá los datos.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: { date: string; time: string; partySize: number } }) =>
      updateReservation(payload.id, payload.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      resetForm();
      Alert.alert('¡Listo!', 'Actualizamos tu reserva.');
    },
    onError: () => Alert.alert('Ups', 'No pudimos actualizar la reserva.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReservation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      if (editingId) {
        resetForm();
      }
      Alert.alert('Eliminada', 'Tu reserva fue eliminada.');
    },
    onError: () => Alert.alert('Ups', 'No pudimos eliminar la reserva.'),
  });

  const startEditing = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setDate(reservation.date);
    setTime(reservation.time);
    setPartySize(String(reservation.partySize));
    setErrors({});
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Eliminar reserva', '¿Seguro que querés eliminar esta reserva?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const handleDateChange = (_event: DateTimePickerChangeEvent, selected: Date) => {
    setShowDatePicker(false);
    setDate(toISODate(selected));
  };

  const handleTimeChange = (_event: DateTimePickerChangeEvent, selected: Date) => {
    setShowTimePicker(false);
    setTime(toHHmm(selected));
  };

  const onSubmit = () => {
    const parsed = createReservationSchema.safeParse({
      date,
      time,
      partySize: Number(partySize),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join('.')] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, body: parsed.data });
    } else {
      mutation.mutate(parsed.data);
    }
  };

  const activeCount =
    reservations?.filter((reservation) => ACTIVE_STATUSES.includes(reservation.status)).length ?? 0;
  const atLimit = activeCount >= MAX_ACTIVE_RESERVATIONS;
  const isEditing = editingId !== null;
  const showForm = isEditing || !atLimit;
  const isSaving = mutation.isPending || updateMutation.isPending;


  return (
    <Screen title="Tu reserva" subtitle="Consultá o creá tu próxima visita.">
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : reservations && reservations.length > 0 ? (
        <View style={styles.list}>
          {reservations.map((reservation) => (
            <View key={reservation.id} style={styles.card}>
              <Text style={styles.cardDate}>
                {reservation.date} · {reservation.time}
              </Text>
              <Text style={styles.cardMeta}>
                {reservation.partySize} {reservation.partySize === 1 ? 'persona' : 'personas'}
              </Text>
              <Text style={styles.badge}>{statusLabels[reservation.status]}</Text>
              {reservation.status === 'confirmed' ? (
                <ReservationReminder
                  reservation={{
                    id: reservation.id,
                    date: reservation.date,
                    time: reservation.time,
                  }}
                />
              ) : null}
              {reservation.status === 'pending' ? (
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => startEditing(reservation)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(reservation.id)}
                    style={styles.actionButton}
                    disabled={deleteMutation.isPending}
                  >
                    <Text style={styles.actionTextDanger}>Eliminar</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Todavía no tenés una reserva. Creá una abajo.</Text>
      )}

      {!showForm ? (
        <Text style={styles.limitNote}>
          Llegaste al máximo de {MAX_ACTIVE_RESERVATIONS} reservas activas. Editá o eliminá una
          para crear otra.
        </Text>
      ) : (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{isEditing ? 'Editar reserva' : 'Nueva reserva'}</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.dateInput, errors.date ? styles.dateInputError : null]}
            >
              <Text style={date ? styles.dateValue : styles.datePlaceholder}>
                {date || 'Seleccioná una fecha'}
              </Text>
            </Pressable>
            {errors.date ? <Text style={styles.fieldError}>{errors.date}</Text> : null}
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={date ? new Date(`${date}T00:00:00`) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              onValueChange={handleDateChange}
              onDismiss={() => setShowDatePicker(false)}
            />
          ) : null}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Hora</Text>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={[styles.dateInput, errors.time ? styles.dateInputError : null]}
            >
              <Text style={time ? styles.dateValue : styles.datePlaceholder}>
                {time ? formatTime12h(time) : 'Seleccioná una hora'}
              </Text>
            </Pressable>
            {errors.time ? <Text style={styles.fieldError}>{errors.time}</Text> : null}
          </View>
          {showTimePicker ? (
            <DateTimePicker
              value={time ? new Date(`1970-01-01T${time}:00`) : new Date()}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={handleTimeChange}
              onDismiss={() => setShowTimePicker(false)}
            />
          ) : null}
          <TextField
            label="Cantidad de personas"
            placeholder="2"
            keyboardType="number-pad"
            value={partySize}
            onChangeText={setPartySize}
            error={errors.partySize}
          />
          <Button
            title={isEditing ? 'Guardar cambios' : 'Crear reserva'}
            loading={isSaving}
            onPress={onSubmit}
          />
          {isEditing ? (
            <Button title="Cancelar" variant="secondary" onPress={resetForm} />
          ) : null}
        </View>
      )}
    </Screen>
  );
}


const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardDate: { ...typography.subtitle, color: colors.primary },
  cardMeta: { ...typography.body, color: colors.text },
  badge: { ...typography.caption, color: colors.accent },
  cardActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  actionButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  actionText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  actionTextDanger: { ...typography.caption, color: '#B44B4B', fontWeight: '600' },
  empty: { ...typography.body, color: colors.textMuted },
  limitNote: { ...typography.body, color: colors.textMuted, marginTop: spacing.lg },
  form: { gap: spacing.md, marginTop: spacing.lg },
  formTitle: { ...typography.subtitle, color: colors.text },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.textMuted },
  dateInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dateInputError: { borderColor: '#B44B4B' },
  dateValue: { fontSize: 16, color: colors.text },
  datePlaceholder: { fontSize: 16, color: colors.textMuted },
  fieldError: { ...typography.caption, color: '#B44B4B' },
});
