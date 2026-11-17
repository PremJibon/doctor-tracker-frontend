export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
      [key: string]: unknown;
    }>;
  };
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiMeta;
}
