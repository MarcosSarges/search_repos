import { Button, Icon } from '@ds/atoms';
import { Container, Header, SettingsRow } from '@ds/molecules';
import { useAppTheme } from '@/presentation/theme';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

const sourceLabelByDataSource = {
  github: 'GitHub',
  gitlab: 'GitLab',
} as const;

export function ConfigScreen() {
  const { mode } = useAppTheme();
  const toggleMode = useSessionPreferencesStore((state) => state.toggleMode);
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const themeIconName = mode === 'light' ? 'moon-outline' : 'sunny-outline';
  const themeA11yLabel = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <Container bg="background" gap="sm">
      <Header safe title="Config" />

      <SettingsRow
        icon={themeIconName}
        title="Tema"
        subtitle="Alternar entre claro e escuro"
        testID="config-theme-section"
        trailing={
          <Button
            variant="text"
            accessibilityRole="button"
            accessibilityLabel={themeA11yLabel}
            onPress={() => toggleMode()}
            testID="config-theme-toggle">
            <Icon name={themeIconName} size="lg" />
          </Button>
        }
      />

      <SettingsRow
        icon="git-branch-outline"
        title="Fonte ativa"
        subtitle={sourceLabelByDataSource[dataSource]}
        testID="config-source-section"
      />

      <SettingsRow
        icon="key-outline"
        title="Token de API"
        subtitle="Em breve — configure seu token com segurança"
        testID="config-token-section"
      />
    </Container>
  );
}
