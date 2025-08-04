export interface BaseResponse<T = any> {
  status: boolean;
  data: T | null;
  error: ErrorResponse | null;
}

export interface ErrorResponse {
  message: string;
  code: number;
}

export interface TemplateListItem {
  id: string;
  imageUrl: string;
  price: number;
  imageOnly: boolean;
}
