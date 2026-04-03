import { Component, input, output, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Level, LevelValue, LEVEL_VALUES } from '../../../../../core/models/level.model';

@Component({
  selector: 'app-level-form-dialog',
  imports: [DialogModule, ButtonModule, FormsModule, SelectModule, TextareaModule],
  templateUrl: './level-form-dialog.html',
  styleUrl: './level-form-dialog.scss',
})
export class LevelFormDialog {
  /** null = création, Level = édition */
  readonly level  = input<Level | null>(null);
  readonly saving = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  readonly save          = output<{ value: LevelValue; description: string | null }>();

  readonly levelValues = LEVEL_VALUES;

  readonly visible$    = signal(false);
  readonly showContent = signal(false);

  selectedValue  = signal<LevelValue | null>(null);
  description    = signal<string>('');

  @Input() set visible(v: boolean) {
    if (v) {
      // Pré-remplit avant d'ouvrir
      const l = this.level();
      this.selectedValue.set(l ? l.value : null);
      this.description.set(l?.description ?? '');
      this.showContent.set(true);
    }
    this.visible$.set(v);
  }

  get isEdit(): boolean { return this.level() !== null; }

  get isValid(): boolean {
    return this.isEdit ? true : this.selectedValue() !== null;
  }

  onSave(): void {
    if (!this.isValid) return;
    this.save.emit({
      value: this.selectedValue()!,
      description: this.description().trim() || null,
    });
  }

  onHide(): void {
    this.showContent.set(false);
    this.visibleChange.emit(false);
  }
}
