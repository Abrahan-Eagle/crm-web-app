import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { FormErrorMessageComponent } from '@/components';
import { DocumentPickerComponent } from '@/features/applications';
import { CreateApplicationService } from '@/features/create-application';
import { DraftDocument } from '@/interfaces';
import { appDocumentValidator, BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-additional-statements',
  imports: [NgOptimizedImage, ReactiveFormsModule, DocumentPickerComponent, FormErrorMessageComponent, DatePipe],
  templateUrl: './additional-statements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalStatementsComponent {
  public readonly form = this.formService.form.controls.step_3;

  constructor(
    public readonly formService: CreateApplicationService,
    private readonly _fb: FormBuilder,
    public readonly config: BusinessConfigService,
  ) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formService.next();
  }

  addAdditional(): void {
    this.form.controls.additional_statements.push(
      this._fb.group({
        statement: [null as null | DraftDocument, [appDocumentValidator()]],
      }),
    );
  }

  removeAdditional(index: number): void {
    this.form.controls.additional_statements.removeAt(index);
  }

  toggle(event: any, control: 'mtd_statements' | 'credit_card_statements' | 'additional_statements') {
    if (event.target.checked) {
      this.form.controls[control].enable();
      if (control === 'additional_statements' && this.form.controls.additional_statements.length === 0) {
        this.addAdditional();
      }
    } else {
      this.form.controls[control].disable();
    }
  }
}
