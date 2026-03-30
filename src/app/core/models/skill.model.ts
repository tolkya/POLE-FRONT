import { UserRef } from './api.model';

export interface SkillMediaTuto {
  id: number;
  mediaUrl: string | null;
  mimetype: string | null;
  originalName: string | null;
  createdBy: UserRef;
  createdAt: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  skillMediaTutos: SkillMediaTuto[];
  createdBy: UserRef;
}

export interface SkillCreateDto {
  name: string;
  description?: string;
}

export interface SkillUpdateDto {
  name?: string;
  description?: string;
}
