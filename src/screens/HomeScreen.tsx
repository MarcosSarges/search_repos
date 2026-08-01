import { Button, Icon, Typography } from '@/components/ds/atoms';
import { Container, Header } from '@/components/ds/molecules';
import { DataSourceLogo } from '@/components/ds/organisms';
import { useAppTheme } from '@/components/ds/theme';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

export function HomeScreen() {
  const { mode } = useAppTheme();
  const toggleMode = useSessionPreferencesStore((state) => state.toggleMode);
  const toggleDataSource = useSessionPreferencesStore((state) => state.toggleDataSource);
  const themeIconName = mode === 'light' ? 'moon-outline' : 'sunny-outline';
  const themeA11yLabel = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Container tone="background">
      <Header
        safe
        title="Search Repos"
        leading={
          <Button
            variant="ghost"
            accessibilityRole="button"
            accessibilityLabel="Switch data source"
            onPress={() => toggleDataSource()}
            testID="home-data-source-toggle">
            <DataSourceLogo size="lg" />
          </Button>
        }
        trailing={
          <Button
            variant="ghost"
            accessibilityRole="button"
            accessibilityLabel={themeA11yLabel}
            onPress={() => toggleMode()}
            testID="home-theme-toggle">
            <Icon name={themeIconName} variant="lg" />
          </Button>
        }
      />
      <Typography variant="body" tone="muted">
        Choose GitHub or GitLab from the header, then search repositories.
      </Typography>
    </Container>
  );
}
