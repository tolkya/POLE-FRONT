import { Component, input, output, signal, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Club } from '../../../core/models/club.model';
import { ClubUpdateDto } from '../../../core/models';

@Component({
  selector: 'app-club-edit-dialog',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './club-edit-dialog.html',
  styleUrl: './club-edit-dialog.scss',
})
export class ClubEditDialog implements OnChanges {
  readonly club    = input.required<Club>();
  readonly visible = input.required<boolean>();

  readonly visibleChange = output<boolean>();
  readonly save          = output<ClubUpdateDto>();

  // Copie locale des champs pour éviter de muter l'input directement
  name        = '';
  phone       = '';
  email       = '';
  street      = '';
  postalCode  = '';
  city        = '';
  description = '';

  /** Synchronise les champs locaux quand le club change */
  ngOnChanges(): void {
    const c = this.club();
    this.name        = c.name        ?? '';
    this.phone       = c.phone       ?? '';
    this.email       = c.email       ?? '';
    this.street      = c.street      ?? '';
    this.postalCode  = c.postalCode  ?? '';
    this.city        = c.city        ?? '';
    this.description = c.description ?? '';
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  onSubmit(): void {
    this.save.emit({
      name:        this.name        || undefined,
      phone:       this.phone       || undefined,
      email:       this.email       || undefined,
      street:      this.street      || undefined,
      postalCode:  this.postalCode  || undefined,
      city:        this.city        || undefined,
      description: this.description || undefined,
    });
  }
}