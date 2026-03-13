import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  imports: [],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.scss',
})
export class StatsCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly variant = input<'default' | 'alert'>('default');
}