import { UserRef } from './api.model';

export interface Level {
  id: number;
  name: string;
  position: number;
  description: string | null;
  createdAt: string;
  createdBy: UserRef;
}

export interface LevelCreateDto {
  name: string;
  description?: string;
}

export interface LevelUpdateDto {
  name?: string;
  description?: string | null;
}