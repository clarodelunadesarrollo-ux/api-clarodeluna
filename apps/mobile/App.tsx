import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders } from './src/providers';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
