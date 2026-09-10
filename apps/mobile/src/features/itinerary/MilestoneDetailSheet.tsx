import type { ItineraryMilestone } from '@claro-de-luna/shared';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';

type MilestoneDetailSheetProps = {
  milestone: ItineraryMilestone | null;
  onClose: () => void;
};

export function MilestoneDetailSheet({ milestone, onClose }: MilestoneDetailSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={milestone !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Tapping the dimmed backdrop closes the sheet. */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop propagation so taps inside the card don't close it. */}
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}
          onPress={() => {}}
        >
          {milestone ? (
            <>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{milestone.order}</Text>
                </View>
                <Text style={styles.time}>{milestone.time}</Text>
              </View>
              <Text style={styles.name}>{milestone.name}</Text>
              <Text style={styles.description}>{milestone.description}</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const BADGE_SIZE = 36;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.surface, fontWeight: '700', fontSize: 16 },
  time: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  name: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
  closeButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  closeButtonText: { ...typography.body, color: colors.surface, fontWeight: '700' },
});
