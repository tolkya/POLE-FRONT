import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SkillMediaTuto } from '../models';

@Injectable({ providedIn: 'root' })
export class SkillMediaTutosService {
  constructor(private http: HttpClient) {}

  upload(skillId: number, file: File): Observable<SkillMediaTuto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SkillMediaTuto>(
      `${environment.api.baseUrl}/skills/${skillId}/tutos`,
      formData
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.api.baseUrl}/skill-media-tutos/${id}`
    );
  }
}
