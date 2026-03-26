export interface UserSummary {
  userId: number;
  fullName: string;
  email: string;
  role: 'User' | 'Admin';
  city?: string | null;
  profileImagePath?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  expiresAtUtc: string;
  user: UserSummary;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  city?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  city?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
