import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

interface FormModalProps {
  visible: boolean;
  title: string;
  saving?: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export function FormModal({
  visible,
  title,
  saving = false,
  submitLabel = 'Guardar',
  submitDisabled = false,
  onCancel,
  onSubmit,
  children,
}: FormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.submit, (saving || submitDisabled) && styles.submitDisabled]}
              onPress={onSubmit}
              disabled={saving || submitDisabled}
            >
              <Text style={styles.submitText}>{saving ? 'Guardando…' : submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
    gap: spacing.md,
  },
  title: { ...typography.subtitle, color: colors.text },
  body: { gap: spacing.md, paddingBottom: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
  cancel: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  cancelText: { ...typography.body, color: colors.textMuted },
  submit: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { ...typography.body, color: colors.background, fontWeight: '600' },
});
