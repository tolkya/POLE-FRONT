import { Pipe, PipeTransform } from '@angular/core';
import { LEVEL_VALUES } from '../../core/models/level.model';

@Pipe({ name: 'levelLabel', standalone: true })
export class LevelLabelPipe implements PipeTransform {
  transform(value: string): string {
    return LEVEL_VALUES.find(l => l.value === value)?.label ?? value;
  }
}
