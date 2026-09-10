import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../features/auth/authStore';
import { EmailScreen } from '../features/auth/EmailScreen';
import { OtpScreen } from '../features/auth/OtpScreen';
import { ReservationScreen } from '../features/reservations/ReservationScreen';
import { WelcomeScreen } from '../features/welcome/WelcomeScreen';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  Email: undefined;
  Otp: { email: string; devCode?: string };
  Welcome: undefined;
  Reservation: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerWordmark = require('../../assets/imgs/Nombre.png');

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === 'authenticated' ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="Reservation"
              component={ReservationScreen}
              options={{ headerShown: true, title: 'Mi reserva' }}
            />
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{
                headerShown: true,
                headerTitle: () => (
                  <Image source={headerWordmark} style={styles.headerLogo} resizeMode="contain" />
                ),
                headerBackTitle: 'Inicio',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Email" component={EmailScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    width: 140,
    height: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
