import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@/test';

import { RepoItem, type RepoItemProps } from '../RepoItem';

const baseProps: RepoItemProps = {
  name: 'react native',
  description: 'A framework for building native apps',
  languages: [{ label: 'TypeScript', swatch: '3178c6' }],
  ownerName: 'facebook',
  ownerAvatarUrl: 'https://example.com/avatar.png',
  stars: 1000,
  forks: 200,
};

describe('RepoItem organism (RITEM-03–08)', () => {
  it('WHEN name is provided THEN it shows Title Case in the heading', async () => {
    await render(<RepoItem {...baseProps} />);

    expect(screen.getByText('React Native')).toBeTruthy();
    expect(screen.queryByText('react native')).toBeNull();
  });

  it('WHEN description is a non-empty string THEN it shows muted description below the title', async () => {
    await render(<RepoItem {...baseProps} />);

    expect(screen.getByText('A framework for building native apps')).toBeTruthy();
  });

  it('WHEN description is absent THEN the description block does not render', async () => {
    await render(<RepoItem {...baseProps} description={undefined} />);

    expect(screen.queryByText('A framework for building native apps')).toBeNull();
  });

  it('WHEN description is empty or whitespace THEN the description block does not render', async () => {
    await render(<RepoItem {...baseProps} description="" />);
    expect(screen.queryByText('A framework for building native apps')).toBeNull();

    await render(<RepoItem {...baseProps} description="   " />);
    expect(screen.queryByText('A framework for building native apps')).toBeNull();
  });

  it('WHEN languages has items THEN each renders as a Badge', async () => {
    await render(<RepoItem {...baseProps} />);

    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByTestId('ds-badge')).toBeTruthy();
  });

  it('WHEN languages is empty or absent THEN no badges render', async () => {
    await render(<RepoItem {...baseProps} languages={[]} />);
    expect(screen.queryByTestId('ds-badge')).toBeNull();

    await render(<RepoItem {...baseProps} languages={undefined} />);
    expect(screen.queryByTestId('ds-badge')).toBeNull();
  });

  it('WHEN ownerName is provided THEN Avatar renders with that name (and optional uri)', async () => {
    await render(<RepoItem {...baseProps} />);

    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByLabelText('facebook')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar-image')).toBeTruthy();
  });

  it('WHEN body and footer are present THEN a horizontal Divider separates them', async () => {
    await render(<RepoItem {...baseProps} />);

    expect(screen.getByTestId('ds-divider')).toBeTruthy();
  });

  it('WHEN stars is provided THEN footer shows star icon and count with accessible label', async () => {
    await render(<RepoItem {...baseProps} stars={0} forks={undefined} />);

    expect(screen.getByLabelText('0 stars')).toBeTruthy();
    expect(screen.getByTestId('ds-repo-item-stars')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('WHEN forks is a number (including 0) THEN fork stat shows; WHEN undefined THEN it is omitted', async () => {
    await render(<RepoItem {...baseProps} forks={0} />);
    expect(screen.getByLabelText('0 forks')).toBeTruthy();
    expect(screen.getByTestId('ds-repo-item-forks')).toBeTruthy();

    await render(<RepoItem {...baseProps} forks={undefined} />);
    expect(screen.queryByTestId('ds-repo-item-forks')).toBeNull();
    expect(screen.getByLabelText('1000 stars')).toBeTruthy();

    await render(<RepoItem {...baseProps} forks={42} />);
    expect(screen.getByLabelText('42 forks')).toBeTruthy();
  });

  it('WHEN public props are inspected THEN they are primitives (no domain Repo type) and style/testID are accepted', () => {
    type HasName = 'name' extends keyof RepoItemProps ? true : false;
    type HasStyle = 'style' extends keyof RepoItemProps ? true : false;
    type HasTestId = 'testID' extends keyof RepoItemProps ? true : false;
    const hasName: HasName = true;
    const hasStyle: HasStyle = true;
    const hasTestId: HasTestId = true;
    expect(hasName).toBe(true);
    expect(hasStyle).toBe(true);
    expect(hasTestId).toBe(true);
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'RepoItem.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'RepoItem.stories.tsx'))).toBe(true);
  });

  it('WHEN organism sources are inspected THEN they do not import @/domain, @/stores, or app layers', () => {
    const component = readFileSync(join(__dirname, '../RepoItem.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/@\/domain|@\/stores|@\/presentation|from ['"]@\//i);
    expect(styles).not.toMatch(/@\/domain|@\/stores|@\/presentation|from ['"]@\//i);
  });
});
