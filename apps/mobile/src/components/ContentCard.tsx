import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type ContentCardProps = {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
};

export function ContentCard({ title, description, imageUrl, tags }: ContentCardProps) {
  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : null}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {tags && tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.map((tag, index) => (
              <View key={`${tag}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 160 },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { ...typography.subtitle, color: colors.primary },
  description: { ...typography.body, color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  tagText: { ...typography.caption, color: colors.surface, fontWeight: '600' },
});
