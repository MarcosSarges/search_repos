import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';

import { TabsNavigator } from '@/navigation/TabsNavigator';
import { act, fireEvent, render, screen } from '@/test';

function pressTabLabel(label: string) {
  const matches = screen.getAllByText(label);
  // Prefer the last match — typically the tab bar label under the screen content.
  fireEvent.press(matches[matches.length - 1]!);
}

describe('TabsNavigator product shell (NAV-01, NAV-03)', () => {
  it('WHEN tabs mount THEN Search, Favoritos, Explore, and Config are reachable', async () => {
    await render(
      <NavigationContainer>
        <TabsNavigator />
      </NavigationContainer>,
    );

    expect(screen.getAllByText('Search').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Favoritos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Explore').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Config').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByTestId('search-repos-idle')).toBeTruthy();
    expect(screen.getByTestId('ds-input-field')).toBeTruthy();

    await act(async () => {
      pressTabLabel('Favoritos');
    });
    expect(screen.getByTestId('favoritos-screen')).toBeTruthy();

    await act(async () => {
      pressTabLabel('Explore');
    });
    expect(screen.getByTestId('explore-screen')).toBeTruthy();

    await act(async () => {
      pressTabLabel('Config');
    });
    expect(screen.getByTestId('config-data-source-section')).toBeTruthy();
  });

  it('WHEN navigation types and RootNavigator are inspected THEN Modal is gone', () => {
    const typesSource = readFileSync(join(__dirname, '../types.ts'), 'utf8');
    const rootSource = readFileSync(join(__dirname, '../RootNavigator.tsx'), 'utf8');

    expect(typesSource).not.toMatch(/Modal/);
    expect(typesSource).not.toMatch(/Home/);
    expect(typesSource).toMatch(/Search:/);
    expect(typesSource).toMatch(/Favoritos:/);
    expect(typesSource).toMatch(/Explore:/);
    expect(typesSource).toMatch(/Config:/);

    expect(rootSource).not.toMatch(/Modal/);
    expect(rootSource).toMatch(/TabsNavigator/);
  });

  it('WHEN ModalScreen path is checked THEN the Expo Modal template file is deleted', () => {
    let exists = true;
    try {
      readFileSync(join(__dirname, '../../screens/ModalScreen.tsx'), 'utf8');
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });
});
