import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { uploadImage } from '../features/content/api';
import { colors, spacing, typography } from '../theme';

interface ImagePickerFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndUpload() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos permiso para acceder a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) {
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(result.assets[0].uri);
      onChange(url);
    } catch (cause) {
      console.warn('[ImagePickerField] upload failed', cause);
      setError(cause instanceof Error ? cause.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {value ? <Image source={{ uri: value }} style={styles.preview} /> : null}
      <View style={styles.row}>
        <Pressable
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={pickAndUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={styles.buttonText}>{value ? 'Cambiar imagen' : 'Elegir imagen'}</Text>
          )}
        </Pressable>
        {value ? (
          <Pressable style={styles.removeButton} onPress={() => onChange(undefined)}>
            <Text style={styles.removeText}>Quitar</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.textMuted },
  preview: { width: '100%', height: 160, borderRadius: 12, backgroundColor: colors.border },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.primary,
    minWidth: 130,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.body, color: colors.background, fontWeight: '600' },
  removeButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  removeText: { ...typography.body, color: colors.textMuted },
  error: { ...typography.caption, color: '#B00020' },
});
