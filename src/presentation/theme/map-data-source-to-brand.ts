import type { DataSource } from '@/application';
import type { Brand } from '@ds/theme';

/** Maps application DataSource to lib Brand at the presentation boundary. */
export function mapDataSourceToBrand(dataSource: DataSource): Brand {
  return dataSource;
}
