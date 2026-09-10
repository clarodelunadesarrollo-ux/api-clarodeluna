import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureNotifications } from './features/notifications/localNotifications';

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    void configureNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
