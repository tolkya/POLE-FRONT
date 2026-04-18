import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'levelLabel', standalone: true })
export class LevelLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}