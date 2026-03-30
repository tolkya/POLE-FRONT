import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  imports: [NgClass],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  @Input({ required: true }) label!: string;
  @Input() variant: BadgeVariant = 'neutral';
}
