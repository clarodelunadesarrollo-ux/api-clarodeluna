import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { colors, spacing, typography } from '../../theme';
import { logout } from '../auth/api';
import { useAuthStore } from '../auth/authStore';
import { useCheckinStore } from '../checkin/checkinStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const heroImage = require('../../../assets/imgs/login.png');
const brandLogo = require('../../../assets/imgs/Logo.png');

export function WelcomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const resetCheckin = useCheckinStore((state) => state.reset);

  const greetingName = user?.name ?? user?.email?.split('@')[0] ?? 'viajero';

  const onLogout = async () => {
    if (refreshToken) {
      await logout(refreshToken).catch(() => undefined);
    }
    await clearSession();
    resetCheckin();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.hero}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(245, 241, 232, 0.65)', colors.background]}
            locations={[0.45, 0.8, 1]}
            style={styles.heroFade}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.greeting}>¡Hola, {greetingName}!</Text>
          <Text style={styles.subtitle}>
            Estamos felices de que nos visites. Hoy te espera una experiencia única, de la huerta a
            la mesa.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button title="Comenzar" onPress={() => navigation.navigate('Main')} />
          <Text style={styles.link} onPress={() => navigation.navigate('Reservation')}>
            Ver mi reserva
          </Text>
          <Text style={styles.logout} onPress={onLogout}>
            Cerrar sesión
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
  brand: { alignItems: 'center', marginTop: spacing.sm },
  logo: { width: 150, height: 144, alignSelf: 'center' },
  hero: { borderRadius: 20, overflow: 'hidden', height: 240 },
  heroImage: { width: '100%', height: '100%' },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' },
  copy: { alignItems: 'center', gap: spacing.sm },
  greeting: { ...typography.title, fontSize: 26, color: colors.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
  actions: { gap: spacing.md, marginTop: spacing.sm },
  link: { ...typography.body, color: colors.primary, fontWeight: '600', textAlign: 'center' },
  logout: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
