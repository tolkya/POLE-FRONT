import { ClubRole } from './club-role.model';

export interface UserClub {
  id: number;
  club: Club;
  roles: ClubRole[];
  validatedAt: string | null;
  createdAt?: string;
}

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


export interface ClubCreateDto {
  name: string;
  email?: string;
  phone?: string;
}

export interface ClubUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  description?: string;
  themeColor?: string;
  joinPolicy?: 'AUTO_ACCEPT' | 'MANUAL_VALIDATION';
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
  roles: ClubRole[];
  validatedAt: string | null;
  createdAt: string;
}
