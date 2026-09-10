import type { GardenSection } from '@claro-de-luna/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { FormModal } from '../components/FormModal';
import { ImagePickerField } from '../components/ImagePickerField';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useAuthStore } from '../features/auth/authStore';
import {
    createGardenSection,
    deleteGardenSection,
    getGarden,
    updateGardenSection,
} from '../features/content/api';
import { colors, spacing, typography } from '../theme';

const GARDEN_KEY = ['content', 'garden'];

interface SectionForm {
  mode: 'create' | 'edit';
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  order: string;
}

export function HuertaScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role) === 'admin';
  const queryClient = useQueryClient();

  const { data: garden, isLoading, isError } = useQuery({
    queryKey: GARDEN_KEY,
    queryFn: getGarden,
  });

  const [form, setForm] = useState<SectionForm | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GARDEN_KEY });

  const save = useMutation({
    mutationFn: (data: SectionForm) => {
      const order = Number.parseInt(data.order, 10) || 0;
      return data.mode === 'create'
        ? createGardenSection({
            title: data.title,
            body: data.body,
            imageUrl: data.imageUrl,
            order,
          })
        : updateGardenSection(data.id!, {
            title: data.title,
            body: data.body,
            imageUrl: data.imageUrl,
            order,
          });
    },
    onSuccess: () => {
      setForm(null);
      void invalidate();
    },
  });

  const remove = useMutation({ mutationFn: deleteGardenSection, onSuccess: () => void invalidate() });

  function confirmDelete(section: GardenSection) {
    Alert.alert('Eliminar sección', `¿Eliminar "${section.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate(section.id) },
    ]);
  }

  return (
    <Screen title="Huerta" subtitle="De la tierra a tu mesa: huerta, riego y compostaje.">
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.error}>No pudimos cargar la huerta. Intentá de nuevo.</Text>
      ) : (
        <>
          {isAdmin ? (
            <Pressable
              style={styles.addSection}
              onPress={() => setForm({ mode: 'create', title: '', body: '', order: '0' })}
            >
              <Text style={styles.addSectionText}>+ Nueva sección</Text>
            </Pressable>
          ) : null}

          {garden?.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay contenido cargado.</Text>
          ) : null}

          {garden?.map((section) => (
            <View key={section.id}>
              <ContentCard
                title={section.title}
                description={section.body}
                imageUrl={section.imageUrl}
              />
              {isAdmin ? (
                <View style={styles.adminRow}>
                  <Pressable
                    onPress={() =>
                      setForm({
                        mode: 'edit',
                        id: section.id,
                        title: section.title,
                        body: section.body,
                        imageUrl: section.imageUrl,
                        order: String(section.order),
                      })
                    }
                  >
                    <Text style={styles.editLink}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(section)}>
                    <Text style={styles.deleteLink}>Eliminar</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </>
      )}

      {form ? (
        <FormModal
          visible
          title={form.mode === 'create' ? 'Nueva sección' : 'Editar sección'}
          saving={save.isPending}
          submitDisabled={!form.title.trim() || !form.body.trim()}
          onCancel={() => setForm(null)}
          onSubmit={() => save.mutate(form)}
        >
          <TextField
            label="Título"
            value={form.title}
            onChangeText={(title) => setForm({ ...form, title })}
          />
          <TextField
            label="Descripción"
            value={form.body}
            onChangeText={(body) => setForm({ ...form, body })}
            multiline
            style={styles.multiline}
          />
          <ImagePickerField
            label="Imagen"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
          />
          {save.isError ? <Text style={styles.error}>No se pudo guardar la sección.</Text> : null}
        </FormModal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: '#B00020', textAlign: 'center', marginTop: spacing.md },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  adminRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs, marginBottom: spacing.md },
  editLink: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  deleteLink: { ...typography.caption, color: '#B00020', fontWeight: '600' },
  addSection: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addSectionText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
});
