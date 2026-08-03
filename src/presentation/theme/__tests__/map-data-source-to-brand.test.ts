import { mapDataSourceToBrand } from '../map-data-source-to-brand';

describe('mapDataSourceToBrand (DSLIB-05)', () => {
  it('WHEN dataSource is github THEN brand is github', () => {
    expect(mapDataSourceToBrand('github')).toBe('github');
  });

  it('WHEN dataSource is gitlab THEN brand is gitlab', () => {
    expect(mapDataSourceToBrand('gitlab')).toBe('gitlab');
  });
});
