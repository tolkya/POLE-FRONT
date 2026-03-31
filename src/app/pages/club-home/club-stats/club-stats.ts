import { Component, input } from '@angular/core';

@Component({
  selector: 'app-club-stats',
  imports: [],
  templateUrl: './club-stats.html',
  styleUrl: './club-stats.scss',
})
export class ClubStats {
  readonly membersCount = input.required<number>();
  readonly activitiesCount = input.required<number>();
  readonly teachersCount = input.required<number>();
}
