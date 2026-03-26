export interface UserListItem {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  city?: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface UserDetail {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'User' | 'Admin';
  phoneNumber?: string | null;
  city?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
}

export interface UserFormValue {
  firstName: string;
  lastName: string;
  email: string;
  role: 'User' | 'Admin';
  phoneNumber?: string | null;
  city?: string | null;
  isActive: boolean;
  password?: string | null;
}
