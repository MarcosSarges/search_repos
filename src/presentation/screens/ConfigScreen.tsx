import { Button, Icon, Typography } from '@ds/atoms';
import { Container, Header } from '@ds/molecules';
import { DataSourceLogo } from '@ds/organisms';
import { useAppTheme } from '@/presentation/theme';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

export function ConfigScreen() {
  const { mode } = useAppTheme();
  const toggleMode = useSessionPreferencesStore((state) => state.toggleMode);
  const toggleDataSource = useSessionPreferencesStore((state) => state.toggleDataSource);
  const themeIconName = mode === 'light' ? 'moon-outline' : 'sunny-outline';
  const themeA11yLabel = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Container bg="background">
      <Header safe title="Config" />

      <Typography variant="heading" testID="config-data-source-section">
        Fonte de dados
      </Typography>
      <Typography variant="body" color="muted">
        Escolha GitHub ou GitLab.
      </Typography>
      <Button
        variant="text"
        accessibilityRole="button"
        accessibilityLabel="Switch data source"
        onPress={() => toggleDataSource()}
        testID="config-data-source-toggle">
        <DataSourceLogo size="lg" />
      </Button>

      <Typography variant="heading" testID="config-theme-section">
        Tema
      </Typography>
      <Typography variant="body" color="muted">
        Alternar entre claro e escuro.
      </Typography>
      <Button
        variant="text"
        accessibilityRole="button"
        accessibilityLabel={themeA11yLabel}
        onPress={() => toggleMode()}
        testID="config-theme-toggle">
        <Icon name={themeIconName} size="lg" />
      </Button>

      <Typography variant="heading" testID="config-token-section">
        Token de API
      </Typography>
      <Typography variant="body" color="muted" testID="config-token-placeholder">
        Em breve — configure seu token com segurança.
      </Typography>
    </Container>
  );
}
