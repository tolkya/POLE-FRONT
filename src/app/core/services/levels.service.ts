import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HydraCollection } from '../models/api.model';
import { Level, LevelCreateDto, LevelUpdateDto } from '../models/level.model';

@Injectable({ providedIn: 'root' })
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

  updateLevel(levelId: number, dto: LevelUpdateDto): Observable<Level> {
    return this.http.patch<Level>(
      `${environment.api.baseUrl}/levels/${levelId}`,
      dto,
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }

  deleteLevel(levelId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/levels/${levelId}`
    );
  }

  reorder(activityId: number, levelIds: number[]): Observable<void> {
    return this.http.post<void>(
      `${environment.api.baseUrl}/activities/${activityId}/levels/reorder`,
      { levelIds }
    );
  }
}