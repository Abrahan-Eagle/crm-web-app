import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { CustomInputComponent } from '@/components';
import { DraftDetails, UpdateDraft } from '@/interfaces';
import { DraftsService } from '@/services';
import { NotificationService } from '@/utils';

import { ApplicationDocumentComponent } from '../file-documents';

@Component({
  selector: 'app-update-documents',
  imports: [CustomInputComponent, ReactiveFormsModule, DatePipe, ApplicationDocumentComponent],
  templateUrl: './update-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateDocumentsComponent implements OnChanges {
  @Input({ required: true }) draft!: DraftDetails;

  ngOnChanges(): void {
    this.form.removeAt(0);
    this.draft.bank_statements.forEach((statement) =>
      this.form.push(
        this.addPeriod(statement.period, {
          amount: statement.amount,
          negative_days: statement.negative_days,
          transactions: statement.transactions,
        }) as any,
      ),
    );
  }

  public readonly form;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly notification: NotificationService,
    private readonly draftsService: DraftsService,
  ) {
    this.form = this._fb.array([
      this._fb.group({
        amount: [null as number | null, [Validators.required, Validators.pattern(/^\d*(\.\d{0,2})?$/)]],
        negative_days: [null as number | null, [Validators.pattern(/^\d+$/), Validators.max(31)]],
        transactions: [null as number | null, [Validators.required, Validators.pattern(/^\d+$/), Validators.max(500)]],
        period: ['', [Validators.required]],
      }),
    ]);
  }

  public readonly loading = signal(false);

  public updateDraft() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const update = this.form.value!.map((value) => ({
      amount: value!.amount,
      transactions: value!.transactions,
      negative_days: value!.negative_days,
      period: value!.period,
    })) as UpdateDraft[];

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.draftsService.updateDrat(this.draft.id, update)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => this.notification.push({ message: 'Draft updated', type: 'success' }));
  }

  addPeriod(
    period: string,
    document?: {
      amount?: number;
      negative_days?: number;
      transactions?: number;
    },
  ) {
    return this._fb.group({
      amount: [document?.amount, [Validators.required, Validators.pattern(/^\d*(\.\d{0,2})?$/)]],
      negative_days: [document?.negative_days, [Validators.pattern(/^\d+$/), Validators.max(31)]],
      transactions: [document?.transactions, [Validators.required, Validators.pattern(/^\d+$/), Validators.max(500)]],
      period: [period, [Validators.required]],
    });
  }
}
