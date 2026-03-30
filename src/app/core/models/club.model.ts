export interface Club {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
  joinPolicy: 'AUTO_ACCEPT' | 'MANUAL_VALIDATION';
  createdAt: string;
}

export interface UserClub {
  id: number;
  club: Club;
  roles: string[];
  validatedAt: string | null;
  createdAt: string;
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
