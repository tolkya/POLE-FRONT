export type ClubRole = 'ADMIN' | 'TEACHER' | 'SECRETARY' | 'MEMBER' | 'USER';

export const CLUB_ROLE_OPTIONS: { label: string; value: ClubRole }[] = [
  { label: 'Admin',      value: 'ADMIN' },
  { label: 'Professeur', value: 'TEACHER' },
  { label: 'Secrétaire', value: 'SECRETARY' },
  { label: 'Membre',     value: 'MEMBER' },
];

export const CLUB_ROLE_LABELS: Record<ClubRole, string> = {
  ADMIN:     'Admin',
  TEACHER:   'Professeur',
  SECRETARY: 'Secrétaire',
  MEMBER:    'Membre',
  USER:      'En attente',
};