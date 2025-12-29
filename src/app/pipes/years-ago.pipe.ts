import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yearsAgo',
  standalone: true,
})
export class YearsAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    const today = new Date();
    const birthDate = new Date(value);
    const yearsAgo = today.getFullYear() - birthDate.getFullYear();
    return `${yearsAgo}`;
  }
}
