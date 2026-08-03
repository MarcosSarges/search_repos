import { Typography } from '@/components/ds/atoms';
import { Container, Header } from '@/components/ds/molecules';

export function FavoritosScreen() {
  return (
    <Container tone="background">
      <Header safe title="Favoritos" />
      <Typography variant="body" tone="muted" testID="favoritos-screen">
        Em breve — seus repositórios favoritos (AsyncStorage).
      </Typography>
    </Container>
  );
}
