import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeURI',
  standalone: true,
})
export class DecodeUriPipe implements PipeTransform {
  transform(value: string): string {
    return decodeURIComponent(value);
  }
}
