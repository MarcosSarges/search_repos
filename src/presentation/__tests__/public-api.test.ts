import * as presentation from '@/presentation';

describe('presentation barrel', () => {
  it('exports queryKeys, mapper, query provider, product hooks, and debounce API', () => {
    expect(presentation.queryKeys).toBeDefined();
    expect(typeof presentation.mapAppErrorToMessage).toBe('function');
    expect(typeof presentation.AppQueryProvider).toBe('function');
    expect(typeof presentation.createQueryClient).toBe('function');
    expect(typeof presentation.useAppContainer).toBe('function');
    expect(presentation).not.toHaveProperty('AppContainerProvider');
    expect(typeof presentation.useSearchRepos).toBe('function');
    expect(typeof presentation.useRepoDetails).toBe('function');
    expect(typeof presentation.useRepoIssues).toBe('function');
    expect(typeof presentation.useDebouncedValue).toBe('function');
    expect(presentation.SEARCH_DEBOUNCE_MS).toBe(350);
  });
});
