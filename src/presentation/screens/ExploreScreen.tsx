import { Typography } from '@/components/ds/atoms';
import { Container, Header } from '@/components/ds/molecules';

export function ExploreScreen() {
  return (
    <Container tone="background">
      <Header safe title="Explore" />
      <Typography variant="body" tone="muted" testID="explore-screen">
        Repos em alta — em breve.
      </Typography>
    </Container>
  );
}
