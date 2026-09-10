import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const isSecondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : colors.surface} />
      ) : (
        <Text style={[styles.label, isSecondary ? styles.labelSecondary : styles.labelPrimary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { ...typography.subtitle },
  labelPrimary: { color: colors.surface },
  labelSecondary: { color: colors.primary },
});
