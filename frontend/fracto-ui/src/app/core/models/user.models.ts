export interface UserListItem {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  city?: string | null;
  isActive: boolean;
  createdAtUtc: string;
}
