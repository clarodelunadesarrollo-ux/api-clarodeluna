import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors, spacing, typography } from '../theme';

type ConnectionStatus = 'idle' | 'searching' | 'connecting' | 'connected';

const DEVICE_NAME = 'Claro de Luna AR';

const STATUS_COPY: Record<ConnectionStatus, { title: string; description: string }> = {
  idle: {
    title: 'Tus gafas no están conectadas',
    description: 'Conectá tus gafas para vivir la experiencia inmersiva de la huerta a la mesa.',
  },
  searching: {
    title: 'Buscando gafas cercanas…',
    description: 'Mantené tus gafas encendidas y cerca del dispositivo.',
  },
  connecting: {
    title: 'Conectando con tus gafas…',
    description: 'Estamos preparando tu experiencia de realidad aumentada.',
  },
  connected: {
    title: '¡Gafas conectadas!',
    description: `${DEVICE_NAME} está lista. Iniciá tu recorrido inmersivo cuando quieras.`,
  },
};

const RING_COUNT = 3;
const RING_PERIOD = 1800;

// Radar-style pulse: concentric rings expand and fade behind the glasses icon.
function PulseRings({ active, connected }: { active: boolean; connected: boolean }) {
  const rings = useRef(
    Array.from({ length: RING_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!active) {
      rings.forEach((value) => value.setValue(0));
      return;
    }
    const loops = rings.map((value) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: RING_PERIOD,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    );
    const starts = rings.map((_, index) =>
      setTimeout(() => loops[index].start(), (index * RING_PERIOD) / RING_COUNT),
    );
    return () => {
      starts.forEach(clearTimeout);
      loops.forEach((loop) => loop.stop());
      rings.forEach((value) => value.setValue(0));
    };
  }, [active, rings]);

  return (
    <View style={styles.pulseWrap}>
      {active
        ? rings.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.ring,
                {
                  opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
                  transform: [
                    { scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.6] }) },
                  ],
                },
              ]}
            />
          ))
        : null}
      <View style={[styles.glassesHalo, connected && styles.glassesHaloConnected]}>
        <Text style={styles.glasses}>🥽</Text>
      </View>
    </View>
  );
}

export function VrScreen() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const isBusy = status === 'searching' || status === 'connecting';

  const connect = () => {
    clearTimers();
    setStatus('searching');
    timers.current.push(setTimeout(() => setStatus('connecting'), 1600));
    timers.current.push(setTimeout(() => setStatus('connected'), 3200));
  };

  const disconnect = () => {
    clearTimers();
    setStatus('idle');
  };

  const startExperience = () => {
    Alert.alert(
      'Experiencia lista',
      'Ponete las gafas para comenzar tu recorrido inmersivo por Claro de Luna.',
    );
  };

  const copy = STATUS_COPY[status];

  return (
    <Screen title="Realidad Virtual" subtitle="Viví Claro de Luna con tus gafas.">
      <View style={styles.card}>
        <PulseRings active={isBusy} connected={status === 'connected'} />
        <Text style={styles.status}>{copy.title}</Text>
        <Text style={styles.description}>{copy.description}</Text>
        {status === 'connected' ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{DEVICE_NAME}</Text>
          </View>
        ) : null}
      </View>

      {status === 'connected' ? (
        <View style={styles.actions}>
          <Button title="Iniciar experiencia" onPress={startExperience} />
          <Button title="Desconectar" variant="secondary" onPress={disconnect} />
        </View>
      ) : (
        <Button
          title={isBusy ? 'Conectando…' : 'Conectar mis gafas'}
          loading={isBusy}
          onPress={connect}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  glasses: { fontSize: 56 },
  pulseWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  glassesHalo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  glassesHaloConnected: {
    backgroundColor: colors.accent,
  },
  status: { ...typography.subtitle, color: colors.primary, textAlign: 'center' },
  description: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  badge: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: { ...typography.caption, color: colors.surface, fontWeight: '600' },
  actions: { gap: spacing.md },
});
