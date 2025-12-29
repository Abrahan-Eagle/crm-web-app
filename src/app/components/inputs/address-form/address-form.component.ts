import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormBuilder,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, firstValueFrom, iif, mergeMap, of, tap } from 'rxjs';

import { DemographicService } from '@/utils';

import { AutoCompleteComponent } from '../auto-complete';
import { CustomInputComponent } from '../custom-input.component';
import { FormErrorMessageComponent } from '../form-error-message.component';

@Component({
  selector: 'app-address-form',
  imports: [ReactiveFormsModule, FormsModule, AutoCompleteComponent, FormErrorMessageComponent, CustomInputComponent],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements ControlValueAccessor, OnInit {
  value: any;

  public readonly form = this._fb.group({
    address_line_1: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    address_line_2: ['', [Validators.maxLength(255)]],
    country: [null as null | { name: string; code: string }, [Validators.required]],
    state: [null as null | { name: string; code: string }, [Validators.required]],
    city: ['', [Validators.required]],
    zip_code: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?(?!-)$/)]],
  });

  private readonly _countries = computed<{ name: string; code: string }[]>(() => {
    return Object.entries(this.demographics.allCountries() || {}).map(([code, name]) => ({
      name,
      code,
    }));
  });

  public readonly countries = signal<{ name: string; code: string }[]>([]);

  public readonly _states = signal<{ name: string; code: string }[]>([]);

  public readonly states = signal<{ name: string; code: string }[]>([]);

  public readonly _cities = signal<string[]>([]);

  public readonly cities = signal<string[]>([]);

  // Loaders Indicator
  public readonly loadingStates = signal(false);

  public readonly loadingCities = signal(false);

  private readonly sync = signal(false);

  constructor(
    private readonly _fb: FormBuilder,
    private readonly demographics: DemographicService,
    public readonly control: NgControl,
  ) {
    if (this.control) this.control.valueAccessor = this;
    this.form.controls.country.valueChanges
      .pipe(
        takeUntilDestroyed(),
        mergeMap((country) =>
          iif(
            () => (country as any) !== '' && country !== null && country && country.name !== null,
            of({}).pipe(
              tap(() => this.loadingStates.set(true)),
              mergeMap(() => this.demographics.getStates(country!.name)),
              finalize(() => this.loadingStates.set(false)),
            ),
            of([]),
          ),
        ),
      )
      .subscribe((states) => {
        this._states.set(
          Object.entries(states || {}).map(([code, name]) => ({
            name,
            code,
          })),
        );
        this.searchState('');

        //Reset children fields
        this.form.controls.state.reset();
        this.form.controls.city.reset();
      });

    this.form.controls.state.valueChanges
      .pipe(
        takeUntilDestroyed(),
        mergeMap((state) =>
          iif(
            () =>
              (state as any) !== '' &&
              state !== null &&
              state &&
              state.name !== null &&
              this.form.controls.country.value?.name !== null &&
              this.form.controls.country.value?.name !== undefined,
            of({}).pipe(
              tap(() => this.loadingCities.set(true)),
              mergeMap(() => this.demographics.getCitiesOfState(this.form.controls.country.value!.name, state!.name)),
              finalize(() => this.loadingCities.set(false)),
            ),
            of([]),
          ),
        ),
      )
      .subscribe((cities) => {
        this._cities.set(cities);
      });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((data) => {
      this.writeValue(this.form.valid ? data : null);
    });

    effect(
      () => {
        if (!this.sync()) {
          this.syncForm();
        }
      },
      { allowSignalWrites: true },
    );
  }

  searchCountry(search: string) {
    const countries = this._countries();
    const filtered = !search
      ? countries
      : countries.filter((country) => country.name.toLowerCase().includes(search.toLowerCase()));
    this.countries.set(filtered);
  }

  searchState(search: string) {
    const states = this._states();
    const filtered = !search
      ? states
      : states.filter((state) => state.name.toLowerCase().includes(search.toLowerCase()));
    this.states.set(filtered);
  }

  searchCity(search: string) {
    const cities = this._cities();
    const filtered = !search ? cities : cities.filter((city) => city.toLowerCase().includes(search.toLowerCase()));
    this.cities.set(filtered);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onChange(_: any) {}

  public onTouched() {}

  writeValue(obj: any): void {
    if (!obj) {
      return;
    }

    this.value = obj;
    if (!this.sync()) {
      this.syncForm();
    }

    this.onChange(this.value);
  }

  setCountry(event: { name: string; code: string }) {
    this.form.controls.country.patchValue(event);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
    const originalMarkAsTouched = this.control.control!.markAsTouched.bind(this.control.control);
    this.control.control!.markAsTouched = () => {
      originalMarkAsTouched();
      this.form.markAllAsTouched();
    };
  }

  async syncForm() {
    if (this._countries().length === 0 || !this.value) {
      return;
    }

    this.sync.set(true);

    this.form.controls.address_line_1.patchValue(this.value.address_line_1 ?? '', { emitEvent: false });
    this.form.controls.address_line_2.patchValue(this.value.address_line_2 ?? '', { emitEvent: false });
    const country = this._countries().find((country) => country.code === this.value.country?.code);
    if (country) {
      this.form.controls.country.patchValue(country, { emitEvent: false });
      const states = await firstValueFrom(this.demographics.getStates(country.name))
        .then((states) =>
          Object.entries(states || {}).map(([code, name]) => ({
            name,
            code,
          })),
        )
        .catch(() => []);

      if (states.length > 0) {
        this._states.set(states);
      }

      const state = states.find((state) => state.code === this.value.state?.code);
      if (state) {
        this.form.controls.state.patchValue(state, { emitEvent: false });
      }
    }

    this.form.controls.zip_code.patchValue(this.value?.zip_code ?? '', { emitEvent: false });
    this.form.controls.city.patchValue(this.value?.city ?? '', { emitEvent: false });

    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.onChange(null);
    }
  }
}
