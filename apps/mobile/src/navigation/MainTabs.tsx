import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../features/auth/authStore';
import { useCheckinStore } from '../features/checkin/checkinStore';
import { CheckinScreen } from '../screens/CheckinScreen';
import { HuertaScreen } from '../screens/HuertaScreen';
import { MapScreen } from '../screens/MapScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { QaScreen } from '../screens/QaScreen';
import { StaffScreen } from '../screens/StaffScreen';
import { VrScreen } from '../screens/VrScreen';
import { colors } from '../theme';

export type MainTabsParamList = {
  Llegada: undefined;
  QA: undefined;
  Mapa: undefined;
  Menu: undefined;
  Huerta: undefined;
  VR: undefined;
  Staff: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

// Custom tab button: clean circular ripple + a gentle bounce when selected,
// replacing Android's default clipped ripple.
function TabBarButton({
  children,
  style,
  onPress,
  onLongPress,
  testID,
  accessibilityLabel,
  accessibilityState,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!focused) return;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.18,
        duration: 130,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  }, [focused, scale]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      android_ripple={{ borderless: true, radius: 26, color: 'rgba(46, 74, 46, 0.12)' }}
      style={[style, styles.tabButton]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

export function MainTabs() {
  const role = useAuthStore((state) => state.user?.role);
  const status = useCheckinStore((state) => state.status);
  const checkedIn = useCheckinStore((state) => state.checkedIn);
  const justCheckedIn = useCheckinStore((state) => state.justCheckedIn);
  const hydrate = useCheckinStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const isStaff = role === 'qa' || role === 'admin';
  // Staff (qa/admin) bypasses the gate; guests unlock the rest only after check-in.
  const hasFullAccess = isStaff || checkedIn;
  // Hide "Llegada" once checked in, but keep it right after check-in so the
  // guest can read the welcome screen before it disappears.
  const showArrival = !checkedIn || justCheckedIn;

  if (status === 'unknown') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}
    >
      {showArrival ? (
        <Tab.Screen
          name="Llegada"
          component={CheckinScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text> }}
        />
      ) : null}
      {isStaff ? (
        <Tab.Screen
          name="QA"
          component={QaScreen}
          options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🧪</Text> }}
        />
      ) : null}
      {hasFullAccess ? (
        <>
          <Tab.Screen
            name="Mapa"
            component={MapScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text> }}
          />
          <Tab.Screen
            name="Menu"
            component={MenuScreen}
            options={{ title: 'Menú', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍃</Text> }}
          />
          <Tab.Screen
            name="Huerta"
            component={HuertaScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🌱</Text> }}
          />
          <Tab.Screen
            name="VR"
            component={VrScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🥽</Text> }}
          />
          <Tab.Screen
            name="Staff"
            component={StaffScreen}
            options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>👥</Text> }}
          />
        </>
      ) : null}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
