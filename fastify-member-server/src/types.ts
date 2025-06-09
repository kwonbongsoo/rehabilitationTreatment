export interface MemberInput {
  email: string;
  name: string;
}

export interface MemberOutput {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberResponse {
  success: boolean;
  data?: MemberOutput;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface MemberParams {
  id: string;
}

export interface MemberBody {
  email: string;
  name: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
