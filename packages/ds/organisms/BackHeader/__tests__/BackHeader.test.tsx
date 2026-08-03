import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen } from '@/test';

import { BackHeader, type BackHeaderProps } from '../BackHeader';

describe('BackHeader organism', () => {
  it('WHEN rendered THEN it shows the title and built-in back control', async () => {
    await render(<BackHeader title="Detalhes" onBack={() => undefined} />);

    expect(screen.getByText('Detalhes')).toBeTruthy();
    expect(screen.getByTestId('ds-back-header')).toBeTruthy();
    expect(screen.getByTestId('ds-back-header-back')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
  });

  it('WHEN back is pressed THEN it calls onBack', async () => {
    const onBack = jest.fn();
    await render(<BackHeader title="Issues" onBack={onBack} />);

    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('WHEN style is passed THEN it is accepted on public props', () => {
    type HasStyle = 'style' extends keyof BackHeaderProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'BackHeader.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'BackHeader.stories.tsx'))).toBe(true);
  });

  it('WHEN organism sources are inspected THEN they do not import navigation or @/ app modules', () => {
    const component = readFileSync(join(__dirname, '../BackHeader.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(
      /zustand|@\/stores|@\/presentation|react-navigation|from ['"]@\//i,
    );
    expect(styles).not.toMatch(/zustand|@\/stores|@\/presentation|from ['"]@\//i);
    expect(component).toMatch(/arrow-back/);
  });
});
