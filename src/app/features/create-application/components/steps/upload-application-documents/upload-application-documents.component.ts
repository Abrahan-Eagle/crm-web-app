import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormErrorMessageComponent } from '@/components';
import { DocumentPickerComponent } from '@/features/applications';
import { CreateApplicationService } from '@/features/create-application';

@Component({
  selector: 'app-upload-application-documents',
  imports: [ReactiveFormsModule, DocumentPickerComponent, DatePipe, NgOptimizedImage, FormErrorMessageComponent],
  templateUrl: './upload-application-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadApplicationDocumentsComponent {
  public readonly form = this.formService.form.controls.step_2;

  constructor(public readonly formService: CreateApplicationService) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }
}
