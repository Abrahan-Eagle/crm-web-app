import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormBuilder, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CustomInputComponent,
  FileHandlerComponent,
  FilePickerComponent,
  FormErrorMessageComponent,
} from '@/components';
import { DraftDocument } from '@/interfaces';
import { ObjectId } from '@/utils';

@Component({
  selector: 'app-document-picker',
  imports: [
    ReactiveFormsModule,
    CustomInputComponent,
    FilePickerComponent,
    FileHandlerComponent,
    FormErrorMessageComponent,
  ],
  templateUrl: './document-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentPickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  public readonly seed = ObjectId();

  public value: DraftDocument | null = null;

  public readonly withTransactions = input<boolean>(true);

  public readonly withAmount = input<boolean>(true);

  public readonly withNegativeDays = input<boolean>(true);

  public readonly withPeriod = input<boolean>(true);

  public readonly form = this._fb.group({
    amount: [null as null | number, []],
    negative_days: [0 as null | number, []],
    transactions: [null as null | number, []],
    period: [null as null | string, []],
    file: [null as null | File, [Validators.required]],
  });

  constructor(
    public control: NgControl,
    private readonly _fb: FormBuilder,
  ) {
    this.control.valueAccessor = this;

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.writeValue(value as DraftDocument);
      this.onChange(value);
    });
  }

  ngOnChanges(): void {
    this.setValidators();
  }

  ngOnInit(): void {
    this.setValidators();
    const originalMarkAsTouched = this.control.control!.markAsTouched.bind(this.control.control);
    this.control.control!.markAsTouched = () => {
      this.form.markAllAsTouched();
      originalMarkAsTouched();
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (event: any) => {};

  onTouched = () => {};

  writeValue(value: DraftDocument | null): void {
    this.value = value ?? this.value;
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public addFile(files: File[]): void {
    const file = files.at(0);
    if (!file) {
      return;
    }

    this.form.controls.file.setValue(file);
  }

  public removeFile(): void {
    this.form.controls.file.reset();
  }

  setValidators() {
    const amountValidators = [Validators.required, Validators.pattern(/^\d*(\.\d{0,2})?$/)];
    if (this.withAmount()) {
      this.form.controls.amount.addValidators(amountValidators);
      this.form.controls.amount.enable();
    } else {
      this.form.controls.amount.removeValidators(amountValidators);
      this.form.controls.amount.disable();
    }

    const negativeDaysValidators = [Validators.pattern(/^\d+$/), Validators.max(31)];
    if (this.withNegativeDays()) {
      this.form.controls.negative_days.addValidators(negativeDaysValidators);
      this.form.controls.negative_days.enable();
    } else {
      this.form.controls.negative_days.removeValidators(negativeDaysValidators);
      this.form.controls.transactions.disable();
    }

    const transactionsValidators = [Validators.required, Validators.pattern(/^\d+$/), Validators.max(500)];
    if (this.withTransactions()) {
      this.form.controls.transactions.addValidators(transactionsValidators);
      this.form.controls.transactions.enable();
    } else {
      this.form.controls.transactions.removeValidators(transactionsValidators);
      this.form.controls.transactions.disable();
    }

    if (this.withPeriod()) {
      this.form.controls.period.addValidators(Validators.required);
      this.form.controls.period.enable();
    } else {
      this.form.controls.period.removeValidators(Validators.required);
      this.form.controls.period.disable();
    }
  }
}
