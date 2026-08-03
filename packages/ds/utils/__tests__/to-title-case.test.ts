import { toTitleCase } from '../to-title-case';
import * as utils from '../index';
import * as ds from '../../index';

describe('toTitleCase (RITEM-03)', () => {
  it("WHEN value is multi-word THEN it returns Title Case ('react native' → 'React Native')", () => {
    expect(toTitleCase('react native')).toBe('React Native');
  });

  it('WHEN value is a single token THEN it uppercases the first character', () => {
    expect(toTitleCase('react')).toBe('React');
  });

  it('WHEN value is empty or whitespace THEN it returns empty string', () => {
    expect(toTitleCase('')).toBe('');
    expect(toTitleCase('   ')).toBe('');
  });

  it('WHEN utils barrel is inspected THEN toTitleCase is exported', () => {
    expect(utils.toTitleCase).toBe(toTitleCase);
  });

  it('WHEN DS root barrel is inspected THEN toTitleCase is exported', () => {
    expect(ds.toTitleCase).toBe(toTitleCase);
  });
});
