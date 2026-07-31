import { getTheme } from '../theme';
import { colors } from '../../tokens/colors';

describe('getTheme primary by dataSource (DS-02)', () => {
  it('WHEN dataSource is github and mode is light THEN primary is #0FBF3E', () => {
    expect(getTheme('light', 'github').colors.primary).toBe('#0FBF3E');
  });

  it('WHEN dataSource is github and mode is dark THEN primary is #5FED83', () => {
    expect(getTheme('dark', 'github').colors.primary).toBe('#5FED83');
  });

  it('WHEN dataSource is gitlab and mode is light THEN primary is #FC6D26', () => {
    expect(getTheme('light', 'gitlab').colors.primary).toBe('#FC6D26');
  });

  it('WHEN dataSource is gitlab and mode is dark THEN primary is #FCA326', () => {
    expect(getTheme('dark', 'gitlab').colors.primary).toBe('#FCA326');
  });

  it('WHEN dataSource is undefined THEN defaults to github primary for the mode', () => {
    expect(getTheme('light').colors.primary).toBe('#0FBF3E');
    expect(getTheme('dark').colors.primary).toBe('#5FED83');
  });

  it('WHEN mode is light THEN non-primary colors come from the light palette only', () => {
    const theme = getTheme('light', 'gitlab');
    const { primary: _p, ...modeColors } = colors.light;
    expect(theme.colors).toEqual(expect.objectContaining(modeColors));
    expect(theme.mode).toBe('light');
    expect(theme.dataSource).toBe('gitlab');
  });

  it('WHEN mode is dark THEN non-primary colors come from the dark palette only', () => {
    const theme = getTheme('dark', 'github');
    const { primary: _p, ...modeColors } = colors.dark;
    expect(theme.colors).toEqual(expect.objectContaining(modeColors));
    expect(theme.mode).toBe('dark');
    expect(theme.dataSource).toBe('github');
  });
});
