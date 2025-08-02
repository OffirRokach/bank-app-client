// Client-side type definitions

export interface SignupFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
}

export type AccessToken = string;

export interface JwtPayload {
  userId: string;
  email: string;
  firstName: string;
  iat?: number;
  exp?: number;
}

export interface AccountResponse {
  id: string;
  accountNumber: string;
  isDefault: boolean;
  balance: number;
}

export interface LoginResponse {
  authToken: AccessToken;
  defaultAccount: AccountResponse | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export type UserUpdatableFields = Partial<
  Omit<User, "id" | "createdAt" | "lastLoginAt" | "status" | "birthDate">
>;

export interface TransactionResponse {
  id: string;
  transactionReference: string;
  fromAccountId: string;
  fromAccount: {
    id: string;
    accountNumber: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  toAccountId: string;
  toAccount: {
    id: string;
    accountNumber: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  amount: number;
  description?: string;
  createdAt: string;
}

// Wrapper for the transactions response from the API
export interface TransactionResponseWrapper {
  accountId: string;
  accountNumber: string;
  defaultAccount: boolean;
  transactions: TransactionResponse[];
}
