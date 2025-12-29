import { Pipe, PipeTransform } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Address } from '@/interfaces';
import { DemographicService } from '@/utils';

@Pipe({
  name: 'address',
  standalone: true,
})
export class AddressPipe implements PipeTransform {
  constructor(private readonly demographics: DemographicService) {}

  async transform(value: Address): Promise<string> {
    if (!value) return '';

    let address = `${value.address_line_1}`;
    if (value.address_line_2) {
      address += `, ${value.address_line_2}`;
    }

    let country = value.country_iso_code_2;
    let state = value.state;

    const countries = (await firstValueFrom(this.demographics._allCountries()).catch(() => {})) as Record<
      string,
      string
    >;

    if (countries[value.country_iso_code_2]) {
      country = countries[value.country_iso_code_2];

      const states = (await firstValueFrom(this.demographics.getStates(country)).catch(() => {})) as Record<
        string,
        string
      >;
      if (states[state]) {
        state = states[state];
      }
    }

    return `${address}, ${value.city}, ${value.zip_code}, ${state}, ${country}`;
  }
}
