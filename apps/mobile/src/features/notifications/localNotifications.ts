import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

// Reminders are scheduled relative to the reservation datetime.
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const TEST_DELAY_SECONDS = 10;

type NotificationsModule = typeof import('expo-notifications');

type ReservationReminderInput = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
};

export type ReminderScheduleResult = {
  available: boolean;
  scheduledOneDay: boolean;
  scheduledTwoHours: boolean;
};

// In Expo Go on Android, importing expo-notifications THROWS: remote push
// auto-registration was removed in SDK 53 and the module registers a push token
// listener on import. Local notifications there require a development build.
// On iOS Expo Go it only warns, so notifications remain usable.
export function areLocalNotificationsAvailable(): boolean {
  return !(isRunningInExpoGo() && Platform.OS === 'android');
}

let cachedModule: NotificationsModule | null = null;

// Dynamically import expo-notifications only where it is safe to load.
async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!areLocalNotificationsAvailable()) {
    return null;
  }
  if (cachedModule) {
    return cachedModule;
  }
  try {
    cachedModule = await import('expo-notifications');
    return cachedModule;
  } catch {
    return null;
  }
}

// Deterministic identifiers let us re-schedule idempotently and cancel per reservation.
function oneDayId(reservationId: string): string {
  return `reminder-${reservationId}-1d`;
}

function twoHoursId(reservationId: string): string {
  return `reminder-${reservationId}-2h`;
}

// Build the reservation Date in LOCAL time (avoids the UTC shift of new Date('...Z')).
function toLocalDate(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Configure how notifications behave while the app is in the foreground.
// Call once on app startup. No-op where notifications are unavailable.
export async function configureNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android requires an explicit channel for notifications to surface.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

// Ensure the user granted notification permission, requesting it if needed.
export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelIfPresent(
  Notifications: NotificationsModule,
  identifier: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // No-op: identifier may not be scheduled yet.
  }
}

// Schedule the 1-day-before and 2-hours-before reminders for a reservation.
// Only future triggers are scheduled; returns which ones were set.
export async function scheduleReservationReminders(
  reservation: ReservationReminderInput,
): Promise<ReminderScheduleResult> {
  const Notifications = await loadNotifications();
  const result: ReminderScheduleResult = {
    available: Notifications !== null,
    scheduledOneDay: false,
    scheduledTwoHours: false,
  };
  if (!Notifications) {
    return result;
  }

  await cancelIfPresent(Notifications, oneDayId(reservation.id));
  await cancelIfPresent(Notifications, twoHoursId(reservation.id));

  const reservationDate = toLocalDate(reservation.date, reservation.time);
  const now = Date.now();
  const timeLabel = formatTime12h(reservation.time);

  const oneDayBefore = new Date(reservationDate.getTime() - ONE_DAY_MS);
  if (oneDayBefore.getTime() > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: oneDayId(reservation.id),
      content: {
        title: 'Tu reserva en Claro de Luna es mañana',
        body: `Mañana a las ${timeLabel} te esperamos. ¡Preparate para la experiencia!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: oneDayBefore,
      },
    });
    result.scheduledOneDay = true;
  }

  const twoHoursBefore = new Date(reservationDate.getTime() - TWO_HOURS_MS);
  if (twoHoursBefore.getTime() > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: twoHoursId(reservation.id),
      content: {
        title: 'Tu experiencia es hoy',
        body: `Hoy a las ${timeLabel} comienza tu visita a Claro de Luna. ¡Te esperamos!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: twoHoursBefore,
      },
    });
    result.scheduledTwoHours = true;
  }

  return result;
}

// Cancel both reminders for a reservation.
export async function cancelReservationReminders(reservationId: string): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }
  await cancelIfPresent(Notifications, oneDayId(reservationId));
  await cancelIfPresent(Notifications, twoHoursId(reservationId));
}

// Whether either reminder is currently scheduled for a reservation.
export async function hasScheduledReminders(reservationId: string): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = new Set(scheduled.map((item) => item.identifier));
  return ids.has(oneDayId(reservationId)) || ids.has(twoHoursId(reservationId));
}

// Fire a local notification in a few seconds so the user can verify it works.
// Returns false where notifications are unavailable.
export async function sendTestNotification(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorios activados',
      body: 'Así vas a ver los avisos de tu reserva en Claro de Luna.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: TEST_DELAY_SECONDS,
      repeats: false,
    },
  });
  return true;
}
