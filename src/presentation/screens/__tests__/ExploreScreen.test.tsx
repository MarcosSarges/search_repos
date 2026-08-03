import { render, screen } from '@/test';

import { ExploreScreen } from '../ExploreScreen';

describe('ExploreScreen (NAV-02)', () => {
  it('WHEN Explore mock opens THEN it shows title, placeholder copy, and stable testID without fetching', async () => {
    await render(<ExploreScreen />);

    expect(screen.getByText('Explore')).toBeTruthy();
    expect(screen.getByTestId('explore-screen')).toBeTruthy();
    expect(screen.getByText(/Repos em alta/i)).toBeTruthy();
  });
});
