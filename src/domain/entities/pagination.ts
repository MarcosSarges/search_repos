export type PaginatedResult<T> = {
  items: T[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
};
