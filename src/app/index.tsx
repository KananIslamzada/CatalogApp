import { PackageOpen } from 'lucide-react-native';

import { Screen, StateView } from '@/components/ui';
import { useTheme } from '@/theme';

export default function Home() {
  const { colors } = useTheme();

  return (
    <Screen>
      <StateView
        icon={<PackageOpen size={48} color={colors.accent} />}
        title="Catalog"
        message="Products are on their way."
      />
    </Screen>
  );
}
