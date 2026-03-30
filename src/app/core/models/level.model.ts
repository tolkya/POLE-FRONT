import { UserRef } from './api.model';

export type LevelValue =
  | 'NOVICE'
  | 'INITIATION'
  | 'DEBUTANT'
  | 'INTERMEDIAIRE'
  | 'CONFIRME'
  | 'AVANCE'
  | 'MASTER';

export const LEVEL_VALUES: { label: string; value: LevelValue }[] = [
  { label: 'Novice',         value: 'NOVICE' },
  { label: 'Initiation',    value: 'INITIATION' },
  { label: 'Débutant',      value: 'DEBUTANT' },
  { label: 'Intermédiaire', value: 'INTERMEDIAIRE' },
  { label: 'Confirmé',      value: 'CONFIRME' },
  { label: 'Avancé',        value: 'AVANCE' },
  { label: 'Master',        value: 'MASTER' },
];

export interface Level {
  id: number;
  value: LevelValue;
  description: string | null;
  createdAt: string;
  createdBy: UserRef;
}

export interface LevelCreateDto {
  value: LevelValue;
  description?: string;
}
