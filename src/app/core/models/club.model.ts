export interface Club {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
  clubCode: string;
  joinPolicy: 'AUTO_ACCEPT' | 'MANUAL_VALIDATION';
  createdAt: string;
  logoUrl: string | null;
  themeColor: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  updatedAt: string | null;
}

export interface UserClub {
  id: number;
  club: Club;
  roles: string[];
  validatedAt: string | null;
  createdAt: string;
}

export interface ClubCreateDto {
  name: string;
  email?: string;
  phone?: string;
}

export interface ClubUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface MemberUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ClubMember {
  id: number;
  member: MemberUser;
  roles: string[];
  validatedAt: string | null;
  createdAt: string;
}
