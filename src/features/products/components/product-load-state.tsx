import { CloudOff } from 'lucide-react-native';
import { memo } from 'react';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { errorMessageKey, isApiError } from '@/lib/api';
import { useTheme } from '@/theme';

import ProductDetailsSkeleton from './product-details-skeleton';
import ProductNotFound from './product-not-found';
import ProductTopBar from './product-top-bar';

type ProductLoadStateProps = {
  error: unknown;
  size: number;
  onRetry: () => void;
};

function isNotFound(error: unknown) {
  return isApiError(error) && error.kind === 'http' && error.status === 404;
}

function ProductLoadState({ error, size, onRetry }: ProductLoadStateProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const content = !error ? (
    <ProductDetailsSkeleton size={size} />
  ) : isNotFound(error) ? (
    <ProductNotFound />
  ) : (
    <StateView
      icon={<CloudOff size={48} color={colors.textMuted} />}
      title={t('product.errorTitle')}
      message={t(errorMessageKey(error))}
      actionLabel={t('common.retry')}
      onAction={onRetry}
    />
  );

  return (
    <>
      {content}
      <ProductTopBar />
    </>
  );
}

export default memo(ProductLoadState);
