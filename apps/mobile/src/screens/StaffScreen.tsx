import type { GuideQuestion } from '@claro-de-luna/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormModal } from '../components/FormModal';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { guideIntro } from '../content/guide';
import { useAuthStore } from '../features/auth/authStore';
import {
    createGuideQuestion,
    deleteGuideQuestion,
    getGuide,
    updateGuideQuestion,
} from '../features/content/api';
import { colors, spacing, typography } from '../theme';

type ChatMessage = { id: string; role: 'bot' | 'user'; text: string };

const GUIDE_KEY = ['content', 'guide'];

interface QuestionForm {
  mode: 'create' | 'edit';
  id?: string;
  question: string;
  answer: string;
}

export function StaffScreen() {
  const isAdmin = useAuthStore((state) => state.user?.role) === 'admin';
  const queryClient = useQueryClient();

  const { data: questions, isLoading, isError } = useQuery({
    queryKey: GUIDE_KEY,
    queryFn: getGuide,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', role: 'bot', text: guideIntro },
  ]);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [form, setForm] = useState<QuestionForm | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GUIDE_KEY });

  const save = useMutation({
    mutationFn: (data: QuestionForm) =>
      data.mode === 'create'
        ? createGuideQuestion({
            question: data.question,
            answer: data.answer,
            order: questions?.length ?? 0,
          })
        : updateGuideQuestion(data.id!, { question: data.question, answer: data.answer }),
    onSuccess: () => {
      setForm(null);
      void invalidate();
    },
  });

  const remove = useMutation({ mutationFn: deleteGuideQuestion, onSuccess: () => void invalidate() });

  const askQuestion = (id: string, question: string, answer: string) => {
    setAskedIds((prev) => [...prev, id]);
    setMessages((prev) => [
      ...prev,
      { id: `${id}-q`, role: 'user', text: question },
      { id: `${id}-a`, role: 'bot', text: answer },
    ]);
  };

  function confirmDelete(item: GuideQuestion) {
    Alert.alert('Eliminar pregunta', `¿Eliminar "${item.question}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove.mutate(item.id) },
    ]);
  }

  const availableQuestions = (questions ?? []).filter((item) => !askedIds.includes(item.id));
  const hasQuestions = (questions?.length ?? 0) > 0;

  return (
    <Screen title="Guía" subtitle="Tu guía de Claro de Luna. Tocá una pregunta.">
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : isError ? (
        <Text style={styles.error}>No pudimos cargar la guía. Intentá de nuevo.</Text>
      ) : (
        <>
          <View style={styles.chat}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  message.role === 'bot' ? styles.bubbleBot : styles.bubbleUser,
                ]}
              >
                <Text
                  style={message.role === 'bot' ? styles.bubbleBotText : styles.bubbleUserText}
                >
                  {message.text}
                </Text>
              </View>
            ))}
          </View>

          {availableQuestions.length > 0 ? (
            <View style={styles.suggestions}>
              {availableQuestions.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.chip}
                  onPress={() => askQuestion(item.id, item.question, item.answer)}
                >
                  <Text style={styles.chipText}>{item.question}</Text>
                </Pressable>
              ))}
            </View>
          ) : hasQuestions ? (
            <Text style={styles.done}>
              Eso es todo por ahora. Si tenés otra consulta, hablá con tu guía. 🌿
            </Text>
          ) : (
            <Text style={styles.done}>Todavía no hay preguntas cargadas.</Text>
          )}

          {isAdmin ? (
            <View style={styles.adminSection}>
              <Text style={styles.adminTitle}>Administrar preguntas</Text>
              <Pressable
                style={styles.addQuestion}
                onPress={() => setForm({ mode: 'create', question: '', answer: '' })}
              >
                <Text style={styles.addQuestionText}>+ Nueva pregunta</Text>
              </Pressable>
              {questions?.map((item) => (
                <View key={item.id} style={styles.adminRow}>
                  <Text style={styles.adminQuestion} numberOfLines={1}>
                    {item.question}
                  </Text>
                  <View style={styles.adminActions}>
                    <Pressable
                      onPress={() =>
                        setForm({
                          mode: 'edit',
                          id: item.id,
                          question: item.question,
                          answer: item.answer,
                        })
                      }
                    >
                      <Text style={styles.editLink}>Editar</Text>
                    </Pressable>
                    <Pressable onPress={() => confirmDelete(item)}>
                      <Text style={styles.deleteLink}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

      {form ? (
        <FormModal
          visible
          title={form.mode === 'create' ? 'Nueva pregunta' : 'Editar pregunta'}
          saving={save.isPending}
          submitDisabled={!form.question.trim() || !form.answer.trim()}
          onCancel={() => setForm(null)}
          onSubmit={() => save.mutate(form)}
        >
          <TextField
            label="Pregunta"
            value={form.question}
            onChangeText={(question) => setForm({ ...form, question })}
            placeholder="¿Tienen opciones veganas?"
          />
          <TextField
            label="Respuesta"
            value={form.answer}
            onChangeText={(answer) => setForm({ ...form, answer })}
            multiline
            style={styles.multiline}
          />
          {save.isError ? <Text style={styles.error}>No se pudo guardar la pregunta.</Text> : null}
        </FormModal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
  error: { ...typography.body, color: '#B00020', textAlign: 'center', marginTop: spacing.md },
  chat: { gap: spacing.sm },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: spacing.md },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleBotText: { ...typography.body, color: colors.text },
  bubbleUserText: { ...typography.body, color: colors.surface },
  suggestions: { gap: spacing.sm, marginTop: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: { ...typography.body, color: colors.primaryLight, fontWeight: '600' },
  done: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  adminSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  adminTitle: { ...typography.subtitle, color: colors.primaryLight },
  addQuestion: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addQuestionText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adminQuestion: { ...typography.body, color: colors.text, flex: 1 },
  adminActions: { flexDirection: 'row', gap: spacing.md },
  editLink: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  deleteLink: { ...typography.caption, color: '#B00020', fontWeight: '600' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
});
