import { useMutation } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Screen } from '../components/Screen';
import { postCheckin } from '../features/checkin/api';
import { useCheckinStore } from '../features/checkin/checkinStore';
import { ApiError } from '../lib/apiClient';
import { colors, spacing, typography } from '../theme';

export function CheckinScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const markCheckedIn = useCheckinStore((state) => state.markCheckedIn);
  const acknowledgeArrival = useCheckinStore((state) => state.acknowledgeArrival);

  const mutation = useMutation({
    mutationFn: postCheckin,
    onSuccess: (data) => markCheckedIn(data.checkedInAt),
    onError: () => setScanned(false),
  });

  const submit = (qrToken: string) => {
    const value = qrToken.trim();
    if (!value || mutation.isPending) return;
    mutation.mutate(value);
  };

  const reset = () => {
    mutation.reset();
    setScanned(false);
    setManualCode('');
    acknowledgeArrival();
  };

  if (mutation.isSuccess) {
    return (
      <Screen title="Llegada">
        <CheckinSuccess data={mutation.data} onDone={reset} />
      </Screen>
    );
  }

  const errorMessage =
    mutation.error instanceof ApiError ? mutation.error.message : mutation.isError
      ? 'No pudimos registrar tu llegada. Intentá de nuevo.'
      : null;

  return (
    <Screen title="Llegada" subtitle="Escaneá el código QR de la entrada para registrar tu llegada.">
      {manualMode ? (
        <ManualCheckin
          code={manualCode}
          onChangeCode={setManualCode}
          onSubmit={() => submit(manualCode)}
          onUseCamera={() => setManualMode(false)}
          submitting={mutation.isPending}
        />
      ) : (
        <ScannerSection
          permission={permission}
          onRequestPermission={requestPermission}
          scanned={scanned}
          submitting={mutation.isPending}
          onScan={(value) => {
            setScanned(true);
            submit(value);
          }}
          onUseManual={() => setManualMode(true)}
        />
      )}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

type ScannerSectionProps = {
  permission: ReturnType<typeof useCameraPermissions>[0];
  onRequestPermission: () => void;
  scanned: boolean;
  submitting: boolean;
  onScan: (value: string) => void;
  onUseManual: () => void;
};

function ScannerSection({
  permission,
  onRequestPermission,
  scanned,
  submitting,
  onScan,
  onUseManual,
}: ScannerSectionProps) {
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>
          Para escanear el código necesitamos acceso a la cámara.
        </Text>
        <Pressable style={styles.primaryButton} onPress={onRequestPermission}>
          <Text style={styles.primaryButtonText}>Permitir cámara</Text>
        </Pressable>
        <Pressable style={styles.linkButton} onPress={onUseManual}>
          <Text style={styles.linkButtonText}>Activar sin cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.scannerWrapper}>
      <View style={styles.cameraFrame}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            scanned || submitting ? undefined : ({ data }) => onScan(data)
          }
        />
        {submitting ? (
          <View style={styles.cameraOverlay}>
            <ActivityIndicator color={colors.surface} />
          </View>
        ) : null}
      </View>
      <Pressable style={styles.linkButton} onPress={onUseManual}>
        <Text style={styles.linkButtonText}>No puedo escanear, usar código</Text>
      </Pressable>
    </View>
  );
}

type ManualCheckinProps = {
  code: string;
  onChangeCode: (value: string) => void;
  onSubmit: () => void;
  onUseCamera: () => void;
  submitting: boolean;
};

function ManualCheckin({
  code,
  onChangeCode,
  onSubmit,
  onUseCamera,
  submitting,
}: ManualCheckinProps) {
  const isComplete = code.length === 4;
  return (
    <View style={styles.manualBox}>
      <Text style={styles.manualLabel}>Ingresá los 4 dígitos que ves en la pantalla de la entrada</Text>
      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={(value) => onChangeCode(value.replace(/\D/g, '').slice(0, 4))}
        placeholder="0000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={4}
        autoCorrect={false}
        editable={!submitting}
      />
      <Pressable
        style={[styles.primaryButton, (!isComplete || submitting) && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!isComplete || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryButtonText}>Registrar mi llegada</Text>
        )}
      </Pressable>
      <Pressable style={styles.linkButton} onPress={onUseCamera}>
        <Text style={styles.linkButtonText}>Volver a la cámara</Text>
      </Pressable>
    </View>
  );
}

function CheckinSuccess({
  data,
  onDone,
}: {
  data: { welcomeMessage: string; checkedInAt: string; alreadyCheckedIn: boolean };
  onDone: () => void;
}) {
  const time = formatLocalTime(data.checkedInAt);
  return (
    <View style={styles.successBox}>
      <Text style={styles.successTitle}>
        {data.alreadyCheckedIn ? 'Ya habías registrado tu llegada' : '¡Check-in confirmado!'}
      </Text>
      <Text style={styles.successMessage}>{data.welcomeMessage}</Text>
      <Text style={styles.successMeta}>Llegada registrada a las {time}.</Text>
      <Pressable style={styles.primaryButton} onPress={onDone}>
        <Text style={styles.primaryButtonText}>Listo</Text>
      </Pressable>
    </View>
  );
}

function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  scannerWrapper: { gap: spacing.md },
  cameraFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.text,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  permissionBox: { gap: spacing.md, paddingVertical: spacing.lg },
  permissionText: { ...typography.body, color: colors.text, textAlign: 'center' },
  manualBox: { gap: spacing.md },
  manualLabel: { ...typography.body, color: colors.text },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.title,
    fontSize: 40,
    textAlign: 'center',
    letterSpacing: 12,
    fontVariant: ['tabular-nums'],
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { ...typography.body, color: colors.surface, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
  linkButton: { alignItems: 'center', paddingVertical: spacing.sm },
  linkButtonText: { ...typography.body, color: colors.primary, fontWeight: '700' },
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#FBEAEA',
    borderWidth: 1,
    borderColor: '#E4B4B4',
  },
  errorText: { ...typography.body, color: '#9B2C2C', textAlign: 'center' },
  successBox: { gap: spacing.md, paddingVertical: spacing.lg },
  successTitle: { ...typography.title, color: colors.primary },
  successMessage: { ...typography.body, color: colors.text },
  successMeta: { ...typography.caption, color: colors.textMuted },
});
