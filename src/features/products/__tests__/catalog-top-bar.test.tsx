import { fireEvent, render, screen } from '@testing-library/react-native';

import CatalogTopBar from '../components/catalog-top-bar';

jest.mock('@/features/auth', () => ({
  useConfirmSignOut: () => ({ confirmSignOut: jest.fn(), isSigningOut: false }),
}));

describe('CatalogTopBar', () => {
  it('keeps the search field and sign out in the pinned bar', async () => {
    const onQueryChange = jest.fn();
    await render(
      <CatalogTopBar
        query=""
        onQueryChange={onQueryChange}
        searchBusy={false}
        searchHeight={56}
        onSearchLayout={jest.fn()}
        inlineTitleStyle={{}}
        searchStyle={{}}
        backdropStyle={{}}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText('Search products'), 'lip');

    expect(onQueryChange).toHaveBeenCalledWith('lip');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeOnTheScreen();
  });
});
