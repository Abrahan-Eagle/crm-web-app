import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FileHandlerComponent, FilePickerComponent, FormErrorMessageComponent } from '@/components';
import { CreateCompanyService } from '@/features/create-company';
import { BusinessConfigService, NotificationService } from '@/utils';

@Component({
  selector: 'app-company-documents',
  imports: [
    FilePickerComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    FilePickerComponent,
    FileHandlerComponent,
    FormErrorMessageComponent,
  ],
  templateUrl: './company-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDocumentsComponent {
  constructor(
    public readonly formService: CreateCompanyService,
    public readonly config: BusinessConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  public addDocumentMessage = signal<string>('');

  public readonly filesByType = computed(() => {
    const documents = this.formService.form().controls.documents.value || [];
    const filesByType: Record<string, number> = {};

    documents.forEach((doc) => {
      if (doc.type) {
        filesByType[doc.type] = (filesByType[doc.type] || 0) + 1;
      }
    });

    return filesByType;
  });

  private canAddMoreFiles(): boolean {
    const documentsArray = this.formService.form().controls.documents;
    const documents = documentsArray.getRawValue();

    // If no documents exist yet, allow adding the first one
    if (documents.length === 0) {
      this.addDocumentMessage.set('');
      return true;
    }

    // Check if we haven't reached the maximum total documents
    const maxTotalDocuments = Object.keys(this.config.companyFileTypes()).length * this.config.maxCompanyFilePerType;
    if (documents.length >= maxTotalDocuments) {
      this.addDocumentMessage.set('Max number of documents reached');
      return false;
    }

    // Check if the last document control is valid (has both file and type)
    const lastControl = documentsArray.at(documents.length - 1);
    const lastDoc = lastControl.value;

    if (!(lastDoc && lastDoc.file && lastDoc.type)) {
      this.addDocumentMessage.set('Complete the previous document before adding a new one');
      return false;
    }

    return true;
  }

  public prev(): void {
    this.formService.currentStep.set(this.formService.currentStep() - 1);
  }

  public next(): void {
    if (this.formService.form().controls.documents.invalid) {
      this.formService.form().controls.documents.markAllAsTouched();
      return;
    }

    this.formService.next();
  }

  public setFile(event: (File & { docType?: string | undefined })[], index: number): void {
    const file = event.at(0);
    const fileType = file!.docType;

    const control = this.formService.form().controls.documents.at(index);
    control.patchValue({
      file: file,
      type: fileType,
    });

    control.updateValueAndValidity();
  }

  public removeFile(index: number): void {
    this.formService.form().controls.documents.removeAt(index);
  }

  addFile() {
    if (this.canAddMoreFiles()) {
      this.formService.addFileGroup();
      this.addDocumentMessage.set('');
    }
  }
}
