import { requestOtpSchema, type RequestOtpDto } from '@claro-de-luna/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { AuthBackground } from '../../components/AuthBackground';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing, typography } from '../../theme';
import { requestOtp } from './api';

type Props = NativeStackScreenProps<RootStackParamList, 'Email'>;

const brandLogo = require('../../../assets/imgs/Nombre.png');

export function EmailScreen({ navigation }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState } = useForm<RequestOtpDto>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: RequestOtpDto) => {
    setSubmitting(true);
    try {
      const { devCode } = await requestOtp({ email });
      navigation.navigate('Otp', { email, devCode });
    } catch {
      Alert.alert('Ups', 'No pudimos enviar el código. Intentá de nuevo en un momento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View style={styles.hero}>
        <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.card}>
        <Text style={styles.prompt}>Ingresá tu correo y te enviamos un código de acceso.</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Correo electrónico"
              placeholder="tu@correo.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={formState.errors.email ? 'Ingresá un correo válido' : undefined}
            />
          )}
        />
        <Button title="Enviar código" loading={submitting} onPress={handleSubmit(onSubmit)} />
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  logo: { width: 260, height: 120, alignSelf: 'center' },
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
  prompt: { ...typography.body, color: colors.text },
});
