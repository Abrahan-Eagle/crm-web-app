import { ScrollingModule } from '@angular/cdk/scrolling';
import { KeyValuePipe, NgClass, NgOptimizedImage } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { AsYouType, CountryCode, isValidPhoneNumber, ParseError, parsePhoneNumber } from 'libphonenumber-js';

import { Country, Phone } from '@/interfaces';
import { DemographicService } from '@/utils';

import { FormErrorMessageComponent } from '../form-error-message.component';

@Component({
  selector: 'app-phone-input',
  imports: [NgClass, KeyValuePipe, ScrollingModule, NgOptimizedImage, FormErrorMessageComponent, ReactiveFormsModule],
  templateUrl: './phone-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneInputComponent implements ControlValueAccessor, AfterViewChecked {
  @ViewChild('phone') input!: ElementRef<HTMLInputElement>;

  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (!this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
    }
  }

  public value: Phone = {
    intl_prefix: '+1',
    region_code: 'US',
    number: '',
  };

  public readonly open = signal(false);

  public readonly search = signal<string>('');

  public readonly countries = computed(() => {
    return Object.fromEntries(
      Object.entries(this.demographics.allCountries() ?? {}).filter(([, value]) =>
        value.toLowerCase().includes(this.search().toLowerCase()),
      ),
    ) as Country;
  });

  constructor(
    public control: NgControl,
    public readonly demographics: DemographicService,
    private ref: ElementRef,
  ) {
    this.control.valueAccessor = this;
  }

  ngAfterViewChecked(): void {
    this._formatInput();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (event: any) => {};

  onTouched = () => {};

  writeValue(phone: Phone | null): void {
    this.value = phone ?? this.value;
    if (phone) {
      this.validateAndFormat();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private _formatInput() {
    const formatted = new AsYouType(this.value.region_code as CountryCode).input(this.value.number);
    if (formatted) {
      this.input.nativeElement.value = formatted;
    }
  }

  updateValue(value: Event) {
    const number = (value.target as HTMLInputElement).value;
    this.value.number = number;
    this.validateAndFormat();

    if (isNaN(Number(this.input.nativeElement.value.slice(-1)))) {
      const end = this.input.nativeElement.value.length - 1;
      this.input.nativeElement.setSelectionRange(end, end);
    }
  }

  public setCountry(countryCode: string) {
    this.open.set(false);
    this.value.region_code = countryCode;
    this.validateAndFormat();
  }

  validateAndFormat() {
    if (!this.control.control) return;

    this.control.control!.markAsTouched();

    try {
      const parsed = parsePhoneNumber(this.value.number, this.value.region_code as CountryCode);
      this.value = {
        intl_prefix: `+${parsed.countryCallingCode}`,
        region_code: parsed.country ?? this.value.region_code,
        number: parsed.nationalNumber,
      };

      this._formatInput();

      if (!isValidPhoneNumber(this.value.number, this.value.region_code as CountryCode)) {
        return this.control.control!.setErrors({ PHONE_NOT_VALID: true });
      }

      this.onChange(this.value);
    } catch (e) {
      if (e instanceof ParseError) {
        this.control.control!.setErrors({ [`PHONE_${(e as ParseError).message}`]: true });
      } else {
        console.error(e);
      }
    }
  }
}
