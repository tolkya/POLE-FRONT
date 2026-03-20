import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Club {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  clubCode: string;
}

export interface ClubUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ClubCreateDto {
  name: string;
  email?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClubService {
  constructor(private http: HttpClient) {}

  getClub(id: number): Observable<Club> {
    return this.http.get<Club>(`${environment.api.baseUrl}/clubs/${id}`);
  }

  updateClub(id: number, data: ClubUpdateDto): Observable<Club> {
    return this.http.patch<Club>(
      `${environment.api.baseUrl}/clubs/${id}`,
      data,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    );
  }

  createClub(data: ClubCreateDto): Observable<Club> {
    return this.http.post<Club>(`${environment.api.baseUrl}/clubs`, data);
  }
}