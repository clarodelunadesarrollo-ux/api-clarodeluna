import { verifyOtpSchema, type VerifyOtpDto } from '@claro-de-luna/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AuthBackground } from '../../components/AuthBackground';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { notifyOtpCode } from '../../lib/notifications';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing, typography } from '../../theme';
import { requestOtp, verifyOtp } from './api';
import { useAuthStore } from './authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({ route }: Props) {
  const { email, devCode } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  const { control, handleSubmit, setValue, formState } = useForm<VerifyOtpDto>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, code: devCode ?? '' },
  });

  // MVP: notify the code and pre-fill it so the user only taps "Verificar".
  useEffect(() => {
    if (devCode) {
      setValue('code', devCode);
      notifyOtpCode(devCode);
    }
  }, [devCode, setValue]);

  const onSubmit = async (values: VerifyOtpDto) => {
    setSubmitting(true);
    try {
      const session = await verifyOtp(values);
      await setSession(session);
      // Navigation switches to the authenticated stack automatically.
    } catch {
      Alert.alert('Código inválido', 'El código no es correcto o venció. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    try {
      const { devCode: newCode } = await requestOtp({ email });
      if (newCode) {
        setValue('code', newCode);
        notifyOtpCode(newCode);
      }
      Alert.alert('Listo', 'Te enviamos un nuevo código.');
    } catch {
      Alert.alert('Ups', 'No pudimos reenviar el código.');
    }
  };

  return (
    <AuthBackground>
      <View style={styles.header}>
        <Text style={styles.title}>Verificá tu correo</Text>
        <Text style={styles.subtitle}>Enviamos un código de 6 dígitos a {email}</Text>
      </View>

      <View style={styles.card}>
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Código de acceso"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={formState.errors.code ? 'Ingresá los 6 dígitos' : undefined}
            />
          )}
        />
        <Button title="Verificar" loading={submitting} onPress={handleSubmit(onSubmit)} />
        <Text style={styles.resend} onPress={resend}>
          ¿No te llegó? Reenviar código
        </Text>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs },
  title: {
    ...typography.title,
    color: colors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(245, 241, 232, 0.8)',
    textShadowRadius: 10,
  },
  subtitle: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(245, 241, 232, 0.8)',
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: '#2A2A2A',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  resend: { ...typography.body, color: colors.primary, textAlign: 'center' },
});
