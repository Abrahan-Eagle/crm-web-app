import { Pipe, PipeTransform } from '@angular/core';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

import { Phone } from '@/interfaces';

@Pipe({
  name: 'formatPhone',
  standalone: true,
})
export class FormatPhonePipe implements PipeTransform {
  transform(value?: Phone): string {
    if (!value) return '';

    if (value?.number.startsWith('*')) {
      return value?.number;
    }

    try {
      const number = parsePhoneNumber(value.number, value.region_code as CountryCode);
      return number.formatInternational();
    } catch (error) {
      return '';
    }
  }
}
