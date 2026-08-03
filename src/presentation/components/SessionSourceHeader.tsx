import type { StyleProp, ViewStyle } from 'react-native';

import { mapDataSourceToBrand } from '@/presentation/theme/map-data-source-to-brand';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { SourceHeader } from '@ds/organisms';

export type SessionSourceHeaderProps = {
  title: string;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Presentation adapter: session store dataSource ↔ DS SourceHeader (AD-029).
 * Search / Explore (and other root chrome) use this for source toggle — not Details/Issues.
 */
export function SessionSourceHeader({ title, safe, style, testID }: SessionSourceHeaderProps) {
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const toggleDataSource = useSessionPreferencesStore((state) => state.toggleDataSource);

  return (
    <SourceHeader
      title={title}
      brand={mapDataSourceToBrand(dataSource)}
      onToggleBrand={toggleDataSource}
      safe={safe}
      style={style}
      testID={testID}
    />
  );
}
