export type DataSource = 'github' | 'gitlab';

export function isDataSource(value: unknown): value is DataSource {
  return value === 'github' || value === 'gitlab';
}
