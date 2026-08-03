import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('App product wiring (PRES-17)', () => {
  it('WHEN App product entry is inspected THEN Query wraps RootNavigator without AppContainer Context; Storybook branch unchanged', () => {
    const appSource = readFileSync(join(__dirname, '../App.tsx'), 'utf8');

    expect(appSource).toMatch(/AppQueryProvider/);
    expect(appSource).not.toMatch(/AppContainerProvider/);
    expect(appSource).toMatch(/RootNavigator/);

    const queryIdx = appSource.indexOf('<AppQueryProvider>');
    const navIdx = appSource.indexOf('<RootNavigator');
    expect(queryIdx).toBeGreaterThan(-1);
    expect(navIdx).toBeGreaterThan(queryIdx);

    expect(appSource).toMatch(/storybookEnabled/);
    expect(appSource).toMatch(/\.rnstorybook/);
  });
});
