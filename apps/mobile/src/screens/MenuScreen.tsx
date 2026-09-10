import type { MenuItem, MenuSection } from '@claro-de-luna/shared';
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
    createMenuItem,
    createMenuSection,
    deleteMenuItem,
    deleteMenuSection,
    getMenu,
    updateMenuItem,
    updateMenuSection,
} from '../features/content/api';
import { colors, spacing, typography } from '../theme';

const MENU_KEY = ['content', 'menu'];

interface SectionForm {
  mode: 'create' | 'edit';
  id?: string;
  title: string;
  order: string;
}

interface ItemForm {
  mode: 'create' | 'edit';
  id?: string;
  sectionId: string;
  name: string;
  description: string;
  tags: string;
  imageUrl?: string;
  order: string;
}

export function MenuScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const greetingName = user?.name ?? user?.email?.split('@')[0] ?? 'viajero';
  const queryClient = useQueryClient();

  const { data: menu, isLoading, isError } = useQuery({ queryKey: MENU_KEY, queryFn: getMenu });

  const [sectionForm, setSectionForm] = useState<SectionForm | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MENU_KEY });

  const saveSection = useMutation({
    mutationFn: (form: SectionForm) => {
      const order = Number.parseInt(form.order, 10) || 0;
      return form.mode === 'create'
        ? createMenuSection({ title: form.title, order })
        : updateMenuSection(form.id!, { title: form.title, order });
    },
    onSuccess: () => {
      setSectionForm(null);
      void invalidate();
    },
  });

  const removeSection = useMutation({
    mutationFn: deleteMenuSection,
    onSuccess: () => void invalidate(),
  });

  const saveItem = useMutation({
    mutationFn: (form: ItemForm) => {
      const order = Number.parseInt(form.order, 10) || 0;
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      return form.mode === 'create'
        ? createMenuItem({
            sectionId: form.sectionId,
            name: form.name,
            description: form.description,
            imageUrl: form.imageUrl,
            tags,
            order,
          })
        : updateMenuItem(form.id!, {
            name: form.name,
            description: form.description,
            imageUrl: form.imageUrl,
            tags,
            order,
          });
    },
    onSuccess: () => {
      setItemForm(null);
      void invalidate();
    },
  });

  const removeItem = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => void invalidate(),
  });

  function confirmDeleteSection(section: MenuSection) {
    Alert.alert('Eliminar sección', `¿Eliminar "${section.title}" y todos sus platos?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeSection.mutate(section.id) },
    ]);
  }

  function confirmDeleteItem(item: MenuItem) {
    Alert.alert('Eliminar plato', `¿Eliminar "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeItem.mutate(item.id) },
    ]);
  }

  return (
    <Screen title="Menú" subtitle={`¡Hola, ${greetingName}! Esta es nuestra carta.`}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.error}>No pudimos cargar la carta. Intentá de nuevo.</Text>
      ) : (
        <>
          {isAdmin ? (
            <Pressable
              style={styles.addSection}
              onPress={() => setSectionForm({ mode: 'create', title: '', order: '0' })}
            >
              <Text style={styles.addSectionText}>+ Nueva sección</Text>
            </Pressable>
          ) : null}

          {menu?.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay platos cargados.</Text>
          ) : null}

          {menu?.map((section) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {isAdmin ? (
                  <View style={styles.adminRow}>
                    <Pressable
                      onPress={() =>
                        setSectionForm({
                          mode: 'edit',
                          id: section.id,
                          title: section.title,
                          order: String(section.order),
                        })
                      }
                    >
                      <Text style={styles.editLink}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDeleteSection(section)}>
                      <Text style={styles.deleteLink}>Eliminar</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              {section.items.map((item) => (
                <View key={item.id}>
                  <ContentCard
                    title={item.name}
                    description={item.description}
                    imageUrl={item.imageUrl}
                    tags={item.tags}
                  />
                  {isAdmin ? (
                    <View style={styles.adminRow}>
                      <Pressable
                        onPress={() =>
                          setItemForm({
                            mode: 'edit',
                            id: item.id,
                            sectionId: section.id,
                            name: item.name,
                            description: item.description,
                            tags: item.tags?.join(', ') ?? '',
                            imageUrl: item.imageUrl,
                            order: String(item.order),
                          })
                        }
                      >
                        <Text style={styles.editLink}>Editar</Text>
                      </Pressable>
                      <Pressable onPress={() => confirmDeleteItem(item)}>
                        <Text style={styles.deleteLink}>Eliminar</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ))}

              {isAdmin ? (
                <Pressable
                  style={styles.addItem}
                  onPress={() =>
                    setItemForm({
                      mode: 'create',
                      sectionId: section.id,
                      name: '',
                      description: '',
                      tags: '',
                      order: '0',
                    })
                  }
                >
                  <Text style={styles.addItemText}>+ Agregar plato</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </>
      )}

      {sectionForm ? (
        <FormModal
          visible
          title={sectionForm.mode === 'create' ? 'Nueva sección' : 'Editar sección'}
          saving={saveSection.isPending}
          submitDisabled={!sectionForm.title.trim()}
          onCancel={() => setSectionForm(null)}
          onSubmit={() => saveSection.mutate(sectionForm)}
        >
          <TextField
            label="Título"
            value={sectionForm.title}
            onChangeText={(title) => setSectionForm({ ...sectionForm, title })}
            placeholder="Entradas, Principales…"
          />
          <TextField
            label="Orden"
            value={sectionForm.order}
            onChangeText={(order) => setSectionForm({ ...sectionForm, order })}
            keyboardType="numeric"
          />
          {saveSection.isError ? (
            <Text style={styles.error}>No se pudo guardar la sección.</Text>
          ) : null}
        </FormModal>
      ) : null}

      {itemForm ? (
        <FormModal
          visible
          title={itemForm.mode === 'create' ? 'Nuevo plato' : 'Editar plato'}
          saving={saveItem.isPending}
          submitDisabled={!itemForm.name.trim() || !itemForm.description.trim()}
          onCancel={() => setItemForm(null)}
          onSubmit={() => saveItem.mutate(itemForm)}
        >
          <TextField
            label="Nombre"
            value={itemForm.name}
            onChangeText={(name) => setItemForm({ ...itemForm, name })}
          />
          <TextField
            label="Descripción"
            value={itemForm.description}
            onChangeText={(description) => setItemForm({ ...itemForm, description })}
            multiline
            style={styles.multiline}
          />
          <TextField
            label="Etiquetas (separadas por coma)"
            value={itemForm.tags}
            onChangeText={(tags) => setItemForm({ ...itemForm, tags })}
            placeholder="vegano, de la huerta"
          />
          <ImagePickerField
            label="Imagen"
            value={itemForm.imageUrl}
            onChange={(imageUrl) => setItemForm({ ...itemForm, imageUrl })}
          />
          {saveItem.isError ? (
            <Text style={styles.error}>No se pudo guardar el plato.</Text>
          ) : null}
        </FormModal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: '#B00020', textAlign: 'center', marginTop: spacing.md },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  section: { gap: spacing.md, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.subtitle, color: colors.primaryLight },
  adminRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
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
  addItem: { paddingVertical: spacing.sm, alignItems: 'center' },
  addItemText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
});
