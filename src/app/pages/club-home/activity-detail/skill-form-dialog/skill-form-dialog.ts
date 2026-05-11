import { Component, input, output, signal, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { Skill } from '../../../../core/models/skill.model';

@Component({
  selector: 'app-skill-form-dialog',
  imports: [DialogModule, ButtonModule, FormsModule, TextareaModule, InputTextModule],
  templateUrl: './skill-form-dialog.html',
  styleUrl: './skill-form-dialog.scss',
})
export class SkillFormDialog {
  /** null = création, Skill = édition */
  readonly skill  = input<Skill | null>(null);
  readonly saving = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  readonly save          = output<{ name: string; description: string | null }>();

  readonly visible$    = signal(false);
  readonly showContent = signal(false);

  name        = signal<string>('');
  description = signal<string>('');

  @Input() set visible(v: boolean) {
    if (v) {
      const s = this.skill();
      this.name.set(s?.name ?? '');
      this.description.set(s?.description ?? '');
      this.showContent.set(true);
    }
    this.visible$.set(v);
  }

  get isEdit(): boolean { return this.skill() !== null; }

  get isValid(): boolean { return this.name().trim().length > 0; }

  onSave(): void {
    if (!this.isValid) return;
    this.save.emit({
      name: this.name().trim(),
      description: this.description().trim() || null,
    });
  }

  onHide(): void {
    this.showContent.set(false);
    this.visibleChange.emit(false);
  }
}

