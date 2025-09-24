export interface IPagination {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export class IResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;

  constructor(
    success = true,
    message: string,
    data?: T,
    pagination?: IPagination,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }

  // Optional static helpers
  static success<T>(message: string, data?: T, pagination?: IPagination) {
    return new IResponse<T>(true, message, data, pagination);
  }
}
