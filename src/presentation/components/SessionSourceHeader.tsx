import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { SourceHeader } from '@ds/organisms';
import { mapDataSourceToBrand } from '@/presentation/theme/map-data-source-to-brand';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

export type SessionSourceHeaderProps = {
  title: string;
  leading?: ReactNode;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Presentation adapter: session store dataSource ↔ DS SourceHeader (AD-029).
 * Screens use this for source chrome — not raw molecule Header + store.
 */
export function SessionSourceHeader({
  title,
  leading,
  safe,
  style,
  testID,
}: SessionSourceHeaderProps) {
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const toggleDataSource = useSessionPreferencesStore((state) => state.toggleDataSource);

  return (
    <SourceHeader
      title={title}
      brand={mapDataSourceToBrand(dataSource)}
      onToggleBrand={toggleDataSource}
      leading={leading}
      safe={safe}
      style={style}
      testID={testID}
    />
  );
}
