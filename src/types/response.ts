export interface PaginationResponse<T> {
  pageSize: number;
  page: number;
  total: number;
  totalPage: number;
  items: T[];
}
