import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export const LEVEL_VALUES = [
  { label: 'Novice',        value: 'NOVICE' },
  { label: 'Initiation',   value: 'INITIATION' },
  { label: 'Débutant',     value: 'DEBUTANT' },
  { label: 'Intermédiaire',value: 'INTERMEDIAIRE' },
  { label: 'Confirmé',     value: 'CONFIRME' },
  { label: 'Avancé',       value: 'AVANCE' },
  { label: 'Master',       value: 'MASTER' },
];

export interface Level {
  id: number;
  value: string;
  description: string | null;
  createdAt: string;
}

export interface LevelCreateDto {
  value: string;
  description?: string;
}

interface HydraCollection<T> {
  member: T[];
  totalItems: number;
}

@Injectable({
  providedIn: 'root',
})
export class LevelsService {
  constructor(private http: HttpClient) {}

  getLevels(activityId: number): Observable<Level[]> {
    return this.http
      .get<HydraCollection<Level>>(
        `${environment.api.baseUrl}/activities/${activityId}/levels`,
        { headers: new HttpHeaders({ Accept: 'application/ld+json' }) }
      )
      .pipe(map((r) => r.member));
  }

  createLevel(activityId: number, dto: LevelCreateDto): Observable<Level> {
    return this.http.post<Level>(
      `${environment.api.baseUrl}/activities/${activityId}/levels`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/ld+json' }) }
    );
  }

  deleteLevel(levelId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/levels/${levelId}`
    );
  }
}