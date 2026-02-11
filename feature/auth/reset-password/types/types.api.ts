export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  access_token?: string;
  token_type?: "bearer";
  expires_in?: number;
  refresh_token?: string | null;
}


export interface ChangePasswordPayload {
  password: string;
}

export interface ChangePasswordResponse {
  message?: string;
  access_token?: string;
  token_type?: "bearer";
  expires_in?: number;
  refresh_token?: string | null;
}
