import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, merge } from 'rxjs';

import { CustomInputComponent, CustomSelectComponent, FormErrorMessageComponent } from '@/components';
import { Offer } from '@/interfaces';
import { ApplicationsService } from '@/services';
import { BusinessConfigService, onlyNumbersDecimalsValidator, onlyNumbersValidator } from '@/utils';

import { ApplicationDetailsService } from '../../applications-details.service';

@Component({
  selector: 'app-update-offer',
  imports: [ReactiveFormsModule, FormsModule, CustomInputComponent, FormErrorMessageComponent, CustomSelectComponent],
  templateUrl: './update-offer.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateOfferComponent implements OnInit {
  public readonly loading = signal(false);

  public readonly purchasedPrice = signal<number>(0);

  public readonly commission = signal<number>(0);

  @Input({ required: true }) public notificationId!: string;

  @Input({ required: true }) offer!: Offer;

  @Output() offerUpdated = new EventEmitter<Offer | null>();

  public readonly paymentPlan = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.paymentPlans()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    public readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
    private readonly applicationsService: ApplicationsService,
    private readonly app: ApplicationDetailsService,
  ) {
    merge(
      this.form.controls.purchased_amount.valueChanges,
      this.form.controls.factor_rate.valueChanges,
      this.form.controls.points.valueChanges,
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateCalculatedFields());
  }

  ngOnInit(): void {
    this.form.patchValue({
      purchased_amount: this.offer.purchased_amount,
      factor_rate: this.offer.factor_rate || 0,
      points: this.offer.points || 0,
      position: this.offer.position || 0,
      payment_plan: this.offer.payment_plan,
      payment_plan_duration: this.offer.payment_plan_duration || 0,
    });

    this.updateCalculatedFields();
  }

  public form = this._fb.group({
    purchased_amount: [0, [Validators.required, Validators.min(200), Validators.max(1000000), onlyNumbersValidator()]],
    factor_rate: [0, [Validators.required, Validators.min(0.01), Validators.max(3), onlyNumbersDecimalsValidator()]],
    points: [0, [Validators.required, Validators.min(0), Validators.max(14), onlyNumbersValidator()]],
    position: [0, [Validators.min(0), Validators.max(100), onlyNumbersValidator()]],
    payment_plan: ['', [Validators.required]],
    payment_plan_duration: [0, [Validators.required, Validators.min(1), onlyNumbersValidator()]],
  });

  private calculatePurchasedPrice(purchasedAmount: number, factorRate: number): number {
    if (purchasedAmount <= 0 || factorRate <= 0) return 0;
    return Number((purchasedAmount * factorRate).toFixed(2));
  }

  private calculateCommission(points: number, purchasedAmount: number): number {
    if (points < 0 || points > 14 || purchasedAmount <= 0) return 0;
    return Number(((points / 100) * purchasedAmount).toFixed(2));
  }

  private updateCalculatedFields(): void {
    const purchasedAmount = Number(this.form.get('purchased_amount')?.value) || 0;
    const factorRate = Number(this.form.get('factor_rate')?.value) || 0;
    const points = Number(this.form.get('points')?.value) || 0;

    const purchasedPrice = this.calculatePurchasedPrice(purchasedAmount, factorRate);
    const commission = this.calculateCommission(points, purchasedAmount);

    this.purchasedPrice.set(purchasedPrice);
    this.commission.set(commission);
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const offer = {
      purchased_amount: Number(this.form.value.purchased_amount),
      factor_rate: Number(this.form.value.factor_rate),
      points: Number(this.form.value.points),
      purchased_price: this.purchasedPrice(),
      commission: this.commission(),
      position: ((this.form.value?.position || 0) > 0 && Number(this.form.value.position)) || null,
      payment_plan_duration: Number(this.form.value.payment_plan_duration),
      payment_plan: this.form.value.payment_plan,
    } as Offer;

    this.loading.set(true);
    this.applicationsService
      .updateOffer(this.app.application()!.id, this.notificationId, this.offer.id, offer)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.offerUpdated.emit({ ...offer, id: this.offer.id, status: this.offer.status });
      });
  }
}
