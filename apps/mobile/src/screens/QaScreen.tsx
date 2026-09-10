import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Screen } from '../components/Screen';
import { useAuthStore } from '../features/auth/authStore';
import { getEntranceCode, rotateEntranceCode } from '../features/checkin/api';
import { colors, spacing, typography } from '../theme';

const ENTRANCE_CODE_KEY = ['entrance-code'];

export function QaScreen() {
  const role = useAuthStore((state) => state.user?.role);
  const isAdmin = role === 'admin';
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ENTRANCE_CODE_KEY,
    queryFn: getEntranceCode,
  });

  const rotate = useMutation({
    mutationFn: rotateEntranceCode,
    onSuccess: (result) => {
      queryClient.setQueryData(ENTRANCE_CODE_KEY, result);
    },
  });

  return (
    <Screen
      title="QA · Código de entrada"
      subtitle="Mostrá el código para que el comensal lo escanee o lo tipee y registre su llegada."
    >
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Text style={styles.error}>No pudimos cargar el código. Intentá de nuevo.</Text>
        </View>
      ) : (
        <View style={styles.qrBox}>
          <View style={styles.qrFrame}>
            <QRCode value={data.code} size={240} backgroundColor="white" color={colors.text} />
          </View>
          <Text style={styles.hint}>Código de entrada</Text>
          <Text style={styles.code}>{data.code}</Text>

          {isAdmin ? (
            <Pressable
              style={[styles.button, rotate.isPending && styles.buttonDisabled]}
              onPress={() => rotate.mutate()}
              disabled={rotate.isPending}
            >
              <Text style={styles.buttonText}>
                {rotate.isPending ? 'Generando…' : 'Generar nuevo código'}
              </Text>
            </Pressable>
          ) : null}
          {rotate.isError ? (
            <Text style={styles.error}>No pudimos generar un código nuevo.</Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  qrBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  qrFrame: {
    padding: spacing.lg,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { ...typography.caption, color: colors.textMuted },
  code: {
    ...typography.title,
    color: colors.text,
    fontSize: 48,
    letterSpacing: 12,
    fontVariant: ['tabular-nums'],
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.body, color: colors.background, fontWeight: '600' },
  error: { ...typography.body, color: colors.text, textAlign: 'center' },
});
