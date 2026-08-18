/**
 * Account Screen Route Wrapper
 */

import { AccountScreen as AccountScreenComponent } from '../components/AccountScreen';
import { useNavigation } from '../navigation/useNavigation';

export default function AccountScreen() {
  const { navigate } = useNavigation();

  return (
    <AccountScreenComponent
      onBack={() => navigate('Dashboard')}
      onLogin={() => navigate('LoginScreen')}
      onUpgrade={() => {
        // Could open a modal or navigate to upgrade page
      }}
    />
  );
}

