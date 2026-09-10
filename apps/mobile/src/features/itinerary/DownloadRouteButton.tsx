import type { ItineraryResponse } from '@claro-de-luna/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { hasSavedItinerary, saveItinerary } from './offlineStore';

type Status = 'idle' | 'saving' | 'saved';

type DownloadRouteButtonProps = {
  data: ItineraryResponse;
};

export function DownloadRouteButton({ data }: DownloadRouteButtonProps) {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    let active = true;
    void hasSavedItinerary().then((saved) => {
      if (active && saved) setStatus('saved');
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePress = async () => {
    setStatus('saving');
    try {
      await saveItinerary(data);
      setStatus('saved');
    } catch {
      setStatus('idle');
    }
  };

  const saved = status === 'saved';

  return (
    <Pressable
      style={[styles.button, saved && styles.buttonSaved]}
      onPress={handlePress}
      disabled={status === 'saving'}
    >
      {status === 'saving' ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={[styles.label, saved && styles.labelSaved]}>
          {saved ? 'Ruta guardada · Tocá para actualizar' : 'Descargar ruta'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonSaved: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  label: { ...typography.body, color: colors.surface, fontWeight: '700' },
  labelSaved: { color: colors.primary },
});
