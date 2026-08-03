import { render, screen } from '@/test';

import { FavoritosScreen } from '../FavoritosScreen';

describe('FavoritosScreen (NAV-02)', () => {
  it('WHEN Favoritos mock opens THEN it shows title, placeholder copy, and stable testID without fetching', async () => {
    await render(<FavoritosScreen />);

    expect(screen.getByText('Favoritos')).toBeTruthy();
    expect(screen.getByTestId('favoritos-screen')).toBeTruthy();
    expect(screen.getByText(/Em breve/)).toBeTruthy();
  });
});
