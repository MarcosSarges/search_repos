import { Typography } from '@ds/atoms';
import { Container, Header } from '@ds/molecules';

export function FavoritosScreen() {
  return (
    <Container tone="background">
      <Header safe title="Favoritos" />
      <Typography variant="body" color="muted" testID="favoritos-screen">
        Em breve — seus repositórios favoritos (AsyncStorage).
      </Typography>
    </Container>
  );
}
