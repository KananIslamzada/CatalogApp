import { SearchX } from 'lucide-react-native';
import { memo } from 'react';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useTheme } from '@/theme';

function ProductNotFound() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <StateView
      icon={<SearchX size={48} color={colors.textMuted} />}
      title={t('product.notFound')}
      message={t('product.notFoundMessage')}
    />
  );
}

export default memo(ProductNotFound);
