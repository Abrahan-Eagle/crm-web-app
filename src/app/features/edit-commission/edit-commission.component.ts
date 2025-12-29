import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, mergeMap, of } from 'rxjs';

import { CustomInputComponent, FormErrorMessageComponent } from '@/components';
import { Commission, Distribution, FormCommission, User } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { CommissionsService } from '@/services';
import { BusinessConfigService, ErrorHandlerService, NotificationService, onlyNumbersDecimalsValidator } from '@/utils';

import { SearchUserComponent } from './components';

@Component({
  selector: 'app-edit-commission',
  imports: [
    CustomInputComponent,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    NgOptimizedImage,
    TextInitialsPipe,
    SearchUserComponent,
    FormErrorMessageComponent,
    DecimalPipe,
  ],
  templateUrl: './edit-commission.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCommissionComponent implements OnInit {
  @Input({ required: true }) id!: string;

  public readonly loading = signal(true);

  public readonly commission = signal<Commission | null>(null);

  public readonly userToAdd = signal<Partial<User> | null>(null);

  public form;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _commissionService: CommissionsService,
    public readonly config: BusinessConfigService,
    public readonly notificationService: NotificationService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly router: Router,
  ) {
    this.form = this._fb.group({
      commission_distribution: this._fb.array<
        FormGroup<{
          user: FormControl<Partial<User> | null>;
          amount: FormControl<number | null>;
        }>
      >([]),
      psf_amount: [0, [Validators.min(0), Validators.required, onlyNumbersDecimalsValidator()]],
      psf_distribution: this._fb.array<
        FormGroup<{
          user: FormControl<Partial<User> | null>;
          amount: FormControl<number | null>;
        }>
      >([]),
    });

    this.form.setValidators((data) => {
      const form = data.getRawValue();
      const totalPSF = Number(form.psf_amount);
      if (!isNaN(totalPSF)) {
        const totalPSFDistribution = (form.psf_distribution as { amount: number }[])
          .filter((item) => !isNaN(Number(item.amount)))
          .reduce((prev, curr) => prev + Number(curr.amount), 0);

        if (totalPSFDistribution > totalPSF) {
          this.form.controls.psf_distribution.setErrors({ AMOUNT_EXCEEDS_TOTAL: true });
          this.form.controls.psf_distribution.markAsTouched();
        } else {
          this.form.controls.psf_distribution.setErrors(null);
          this.form.controls.psf_distribution.markAsTouched();
        }
      }

      const totalCommissionDistribution = (form.commission_distribution as { amount: number }[])
        .filter((item) => !isNaN(Number(item.amount)))
        .reduce((prev, curr) => prev + Number(curr.amount), 0);

      if (totalCommissionDistribution > (this.commission()?.commission?.total ?? 0)) {
        this.form.controls.commission_distribution.setErrors({ AMOUNT_EXCEEDS_TOTAL: true });
        this.form.controls.commission_distribution.markAsTouched();
      } else {
        this.form.controls.commission_distribution.setErrors(null);
        this.form.controls.commission_distribution.markAsTouched();
      }

      return null;
    });
  }

  ngOnInit(): void {
    this.getCommision();
  }

  public getCommision(): void {
    this.loading.set(true);
    this._commissionService
      .getCommission(this.id, true)
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) =>
          this.errorHandlerService.resolveNotFound(error, '/commissions', 'Commission not found'),
        ),
      )
      .subscribe((commission) => {
        this.commission.set(commission);
        this.form.controls.psf_amount.setValue(commission.psf.total);

        commission.psf.distribution.forEach((item: Distribution) => {
          this.form.controls.psf_distribution.push(this._distributionItem(item.user, item.amount));
        });

        commission.commission.distribution.forEach((item: Distribution) => {
          this.form.controls.commission_distribution.push(this._distributionItem(item.user, item.amount));
        });
      });
  }

  public addUserToCommission(e: Event, type: 'psf' | 'commission'): void {
    e.preventDefault();
    if (!this.userToAdd()) return;
    const control = this._distributionItem(this.userToAdd()!);
    if (
      type === 'commission' &&
      !this.form.controls.commission_distribution.value!.some((control) => control!.user!.id === this.userToAdd()!.id)
    ) {
      this.form.controls.commission_distribution.push(control);
    } else if (
      type === 'psf' &&
      !this.form.controls.psf_distribution.value!.some((control) => control!.user!.id === this.userToAdd()!.id)
    ) {
      this.form.controls.psf_distribution.push(control);
    }
  }

  private _distributionItem(user: Partial<User>, amount?: number): FormGroup {
    return this._fb.group({
      user: [(user ?? null) as null | Partial<User>, [Validators.required]],
      amount: [amount ?? 0, [Validators.required, Validators.min(0), onlyNumbersDecimalsValidator()]],
    });
  }

  public saveDraft(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const update = {
      psf: {
        total: this.form.controls.psf_amount.value,
        distribution: this.form.controls.psf_distribution.value.map((item) => ({
          amount: Number(item.amount!),
          user_id: item.user!.id,
        })),
      },
      commission: {
        distribution: this.form.controls.commission_distribution.value.map((item) => ({
          amount: Number(item.amount!),
          user_id: item.user!.id,
        })),
      },
    } as FormCommission;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this._commissionService.saveCommission(this.id, update)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.notificationService.push({ message: 'Draft updated successfully!', type: 'success' }));
  }

  public publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this._commissionService.publishCommission(this.id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.notificationService.push({ message: 'Commission published successfully!', type: 'success' }),
          this.router.navigate(['/commissions', this.id, 'details']);
      });
  }
}
