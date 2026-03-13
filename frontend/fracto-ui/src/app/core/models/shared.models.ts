export interface PagedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  items: T[];
}
