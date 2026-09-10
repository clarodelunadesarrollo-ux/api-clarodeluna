import type { ItineraryMilestone } from '@claro-de-luna/shared';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

const MAP_IMAGE = require('../../../assets/map/venue-map.png');
const PIN_SIZE = 30;

type ItineraryMapProps = {
  milestones: ItineraryMilestone[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ItineraryMap({ milestones, selectedId, onSelect }: ItineraryMapProps) {
  return (
    <View style={styles.container}>
      <ImageBackground source={MAP_IMAGE} style={styles.image} imageStyle={styles.imageInner}>
        {milestones.map((milestone) => {
          const active = milestone.id === selectedId;
          return (
            <Pressable
              key={milestone.id}
              onPress={() => onSelect(milestone.id)}
              hitSlop={10}
              style={[
                styles.pin,
                { left: `${milestone.x * 100}%`, top: `${milestone.y * 100}%` },
              ]}
            >
              <View style={[styles.pinBubble, active && styles.pinBubbleActive]}>
                <Text style={styles.pinText}>{milestone.order}</Text>
              </View>
            </Pressable>
          );
        })}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { flex: 1 },
  imageInner: { borderRadius: 12 },
  pin: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    // Center the pin on its coordinate instead of anchoring the top-left corner.
    marginLeft: -PIN_SIZE / 2,
    marginTop: -PIN_SIZE / 2,
  },
  pinBubble: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  pinBubbleActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.accent,
    transform: [{ scale: 1.25 }],
  },
  pinText: { color: colors.surface, fontWeight: '700', fontSize: 14 },
});
