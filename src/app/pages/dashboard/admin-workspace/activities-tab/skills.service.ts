import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SkillMediaTuto } from './skill-media-tutos.service';

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  skillMediaTutos: SkillMediaTuto[];
  createdBy: { id: number; firstName: string; lastName: string };
}

export type { SkillMediaTuto };

export interface SkillCreateDto {
  name: string;
  description?: string;
}

interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  constructor(private http: HttpClient) {}

  getSkills(levelId: number): Observable<Skill[]> {
    return this.http
      .get<HydraCollection<Skill>>(
        `${environment.api.baseUrl}/levels/${levelId}/skills`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  createSkill(levelId: number, dto: SkillCreateDto): Observable<Skill> {
    return this.http.post<Skill>(
      `${environment.api.baseUrl}/levels/${levelId}/skills`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/ld+json' }) }
    );
  }

  updateSkill(skillId: number, dto: Partial<SkillCreateDto>): Observable<Skill> {
    return this.http.patch<Skill>(
      `${environment.api.baseUrl}/skills/${skillId}`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }

  deleteSkill(skillId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/skills/${skillId}`
    );
  }
}