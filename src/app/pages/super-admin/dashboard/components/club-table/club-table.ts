import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface Club {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-club-table',
  imports: [DatePipe],
  templateUrl: './club-table.html',
  styleUrl: './club-table.scss',
})
export class ClubTable {
  readonly clubs = input.required<Club[]>();
}