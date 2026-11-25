import { Screen } from '@/components/ui';
import {
  CatalogHeader,
  CatalogTopBar,
  ProductList,
  useCatalogSearch,
  useCollapsingHeader,
  useProductSearchQuery,
  useScrollToResults,
  useSearchRowHeight,
} from '@/features/products';

export default function CatalogScreen() {
  const { query, setQuery, term } = useCatalogSearch();
  const { isFetching } = useProductSearchQuery(term);
  const searchRow = useSearchRowHeight();
  const {
    onScroll,
    onTitleLayout,
    resultsTopOffset,
    largeTitleStyle,
    inlineTitleStyle,
    searchStyle,
    backdropStyle,
  } = useCollapsingHeader();
  const listRef = useScrollToResults(term, resultsTopOffset);

  return (
    <Screen edges={['left', 'right']}>
      <ProductList
        listRef={listRef}
        term={term}
        onScroll={onScroll}
        header={
          <CatalogHeader
            searchSpace={searchRow.height}
            largeTitleStyle={largeTitleStyle}
            onTitleLayout={onTitleLayout}
          />
        }
      />
      <CatalogTopBar
        query={query}
        onQueryChange={setQuery}
        searchBusy={term.length > 0 && isFetching}
        searchHeight={searchRow.height}
        onSearchLayout={searchRow.onLayout}
        inlineTitleStyle={inlineTitleStyle}
        searchStyle={searchStyle}
        backdropStyle={backdropStyle}
      />
    </Screen>
  );
}
