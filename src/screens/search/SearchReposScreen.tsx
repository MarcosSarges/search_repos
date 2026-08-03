import { Typography } from '@/components/ds/atoms';
import { Container, Header } from '@/components/ds/molecules';

/** Thin placeholder until T9 fills SearchRepos UX. */
export function SearchReposScreen() {
  return (
    <Container tone="background">
      <Header safe title="Search" />
      <Typography variant="body" tone="muted" testID="search-repos-placeholder">
        Busca de repositórios em breve.
      </Typography>
    </Container>
  );
}
