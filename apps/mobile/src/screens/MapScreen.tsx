import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { getItineraryWithOfflineFallback } from '../features/itinerary/api';
import { DownloadRouteButton } from '../features/itinerary/DownloadRouteButton';
import { ItineraryMap } from '../features/itinerary/ItineraryMap';
import { MilestoneDetailSheet } from '../features/itinerary/MilestoneDetailSheet';
import { colors, spacing, typography } from '../theme';

export function MapScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['itinerary'],
    queryFn: getItineraryWithOfflineFallback,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Screen title="Tu recorrido">
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen title="Tu recorrido">
        <View style={styles.centered}>
          <Text style={styles.message}>No pudimos cargar tu recorrido. Intentá de nuevo.</Text>
        </View>
      </Screen>
    );
  }

  if (!data?.reservationId || data.milestones.length === 0) {
    return (
      <Screen title="Tu recorrido">
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Todavía no tenés un recorrido</Text>
          <Text style={styles.message}>
            Reservá tu experiencia y acá vas a ver el plan del día, hito por hito.
          </Text>
        </View>
      </Screen>
    );
  }

  const milestones = data.milestones;
  const selectedMilestone = milestones.find((m) => m.id === selectedId) ?? null;

  return (
    <Screen title="Tu recorrido" subtitle="Tocá un punto del mapa para ver el detalle.">
      <ItineraryMap milestones={milestones} selectedId={selectedId} onSelect={setSelectedId} />
      <DownloadRouteButton data={data} />
      <MilestoneDetailSheet milestone={selectedMilestone} onClose={() => setSelectedId(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.subtitle, color: colors.primary, textAlign: 'center' },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
