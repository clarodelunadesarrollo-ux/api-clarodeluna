import { Alert } from 'react-native';

/**
 * MVP: expo-notifications runs a remote-push auto-registration side-effect on
 * import that crashes in Expo Go (removed since SDK 53), so we surface the OTP
 * with a native alert. Swap for a real local notification on a development build.
 */
export function notifyOtpCode(code: string): void {
  Alert.alert(
    'Tu código de acceso 🌙',
    `Código: ${code}\nYa lo dejamos listo en el campo, solo tocá "Verificar".`,
  );
}
