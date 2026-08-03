import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Brand } from '@ds/theme';
import { Header } from '@ds/molecules';

import { DataSourceLogo } from '../DataSourceLogo';
import { BrandToggle, SourceHeaderRoot } from './styles';

export type SourceHeaderProps = {
  title: string;
  brand: Brand;
  onToggleBrand: () => void;
  leading?: ReactNode;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function SourceHeader({
  title,
  brand,
  onToggleBrand,
  leading,
  safe,
  style,
  testID = 'ds-source-header',
}: SourceHeaderProps) {
  return (
    <SourceHeaderRoot testID={testID}>
      <Header
        title={title}
        leading={leading}
        safe={safe}
        style={style}
        trailing={
          <BrandToggle
            accessibilityRole="button"
            accessibilityLabel="Alternar fonte de dados"
            onPress={onToggleBrand}
            testID="ds-source-header-toggle">
            <DataSourceLogo brand={brand} size="lg" />
          </BrandToggle>
        }
      />
    </SourceHeaderRoot>
  );
}
