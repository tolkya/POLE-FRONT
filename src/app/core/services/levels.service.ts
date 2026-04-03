import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HydraCollection, Level, LevelCreateDto, LEVEL_VALUES } from '../models';

export { LEVEL_VALUES };

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

  deleteLevel(levelId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/levels/${levelId}`
    );
  }

  patchLevel(levelId: number, description: string | null): Observable<Level> {
    return this.http.patch<Level>(
      `${environment.api.baseUrl}/levels/${levelId}`,
      { description },
      { headers: new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' }) }
    );
  }
}
