import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type PlaceholderProps = {
  title: string;
  subtitle: string;
};

export function Placeholder({ title, subtitle }: PlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: { ...typography.title, color: colors.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
