import { Component, input, output, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { Level } from '../../../../../core/models/level.model';

@Component({
  selector: 'app-level-form-dialog',
  imports: [DialogModule, ButtonModule, FormsModule, TextareaModule],
  templateUrl: './level-form-dialog.html',
  styleUrl: './level-form-dialog.scss',
})
export class LevelFormDialog {
  readonly level  = input<Level | null>(null);
  readonly saving = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  readonly save          = output<{ name: string; description: string | null }>();

  readonly visible$    = signal(false);
  readonly showContent = signal(false);

  levelName   = signal<string>('');
  description = signal<string>('');

  @Input() set visible(v: boolean) {
    if (v) {
      const l = this.level();
      this.levelName.set(l?.name ?? '');
      this.description.set(l?.description ?? '');
      this.showContent.set(true);
    }
    this.visible$.set(v);
  }

  get isEdit(): boolean { return this.level() !== null; }

  get isValid(): boolean {
    return this.levelName().trim().length > 0 && this.levelName().trim().length <= 100;
  }

  onSave(): void {
    if (!this.isValid) return;
    this.save.emit({
      name:        this.levelName().trim(),
      description: this.description().trim() || null,
    });
  }

  onHide(): void {
    this.showContent.set(false);
    this.visibleChange.emit(false);
  }
}