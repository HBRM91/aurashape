import { Platform } from 'react-native';
import { WebOrganization } from '@/src/web/screens/WebOrganization';

export default function OrganizationScreen() {
  if (Platform.OS === 'web') return <WebOrganization />;
  return null;
}
