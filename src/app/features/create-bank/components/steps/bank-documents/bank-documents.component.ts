import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';

import { FilePickerComponent } from '@/components';
import { CreateBankService } from '@/features/create-bank';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-bank-documents',
  imports: [NgOptimizedImage, FilePickerComponent],
  templateUrl: './bank-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankDocumentsComponent {
  @ViewChild('filePicker') private filePicker!: FilePickerComponent;

  constructor(
    public readonly formService: CreateBankService,
    public readonly config: BusinessConfigService,
  ) {}

  public prev(): void {
    this.formService.currentStep.set(this.formService.currentStep() - 1);
  }

  public next(): void {
    this.formService.files.set(this.filePicker.files);
    this.formService.next();
  }
}
