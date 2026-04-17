export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roles: string[];
}

export interface UserPasswordChangeDto {
  currentPassword: string;
  plainPassword: string;
}