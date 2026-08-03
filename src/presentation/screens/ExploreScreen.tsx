import { Typography } from '@ds/atoms';
import { Container, Header } from '@ds/molecules';

export function ExploreScreen() {
  return (
    <Container bg="background">
      <Header safe title="Explore" />
      <Typography variant="body" color="muted" testID="explore-screen">
        Repos em alta — em breve.
      </Typography>
    </Container>
  );
}
