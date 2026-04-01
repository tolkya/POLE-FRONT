import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Club } from '../../../core/models/club.model';

@Component({
  selector: 'app-club-hero',
  imports: [CommonModule, AvatarModule, TagModule, ButtonModule, ChipModule, ColorPickerModule, DialogModule, FormsModule],
  templateUrl: './club-hero.html',
  styleUrl: './club-hero.scss',
})
export class ClubHero {
  @Input({ required: true }) club!: Club;
  @Input() activityTypes: { id: number; name: string }[] = [];
  @Input() userRole: 'ADMIN' | 'TEACHER' | 'MEMBRE' | null = null;
  @Input() logoUrl: string | null = null;

  /** Émis quand l'admin valide un changement de couleur */
  @Output() themeColorChange = new EventEmitter<string>();
  /** Émis quand l'utilisateur veut quitter le club */
  @Output() leaveClub = new EventEmitter<void>();
  /** Émis quand l'utilisateur non-membre veut s'inscrire */
  @Output() joinClub = new EventEmitter<void>();

  @Output() editClub = new EventEmitter<void>();

  showColorPicker = signal(false);
  showLeaveConfirm = signal(false);
  pendingColor = '';

  get initials(): string {
    return this.club.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  get address(): string | null {
    const { street, postalCode, city } = this.club;
    if (!street && !city) return null;
    return [street, postalCode, city].filter(Boolean).join(', ');
  }

  get addressLine1(): string | null {
    return this.club.street?.trim() || null;
  }

  get addressLine2(): string | null {
    const line = [this.club.postalCode, this.club.city].filter(Boolean).join(' ');
    return line || null;
  }

  get themeColor(): string {
    return this.club.themeColor ?? '#7c3aed';
  }

  get roleSeverity(): 'contrast' | 'info' | 'success' | 'warn' {
    if (this.userRole === 'ADMIN') return 'contrast';
    if (this.userRole === 'TEACHER') return 'info';
    if (this.userRole === 'MEMBRE') return 'success';
    return 'warn';
  }

  requestLeave(): void {
    this.showLeaveConfirm.set(true);
  }

  confirmLeave(): void {
    this.showLeaveConfirm.set(false);
    this.leaveClub.emit();
  }

  cancelLeave(): void {
    this.showLeaveConfirm.set(false);
  }

  openColorPicker(): void {
    this.pendingColor = this.themeColor;
    this.showColorPicker.set(true);
  }

  confirmTheme(): void {
    const color = this.pendingColor.startsWith('#') ? this.pendingColor : '#' + this.pendingColor;
    this.themeColorChange.emit(color);
    this.showColorPicker.set(false);
  }

  cancelTheme(): void {
    this.showColorPicker.set(false);
  }
}
