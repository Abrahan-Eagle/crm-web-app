import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FileHandlerComponent, FilePickerComponent, FormErrorMessageComponent } from '@/components';
import { CreateContactService } from '@/features/create-contact';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-upload-contact-documents',
  imports: [
    FilePickerComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    FileHandlerComponent,
    FormErrorMessageComponent,
  ],
  templateUrl: './upload-contact-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadContactDocumentsComponent {
  constructor(
    public readonly formService: CreateContactService,
    public readonly config: BusinessConfigService,
  ) {}

  public addDocumentMessage = signal<string>('');

  private canAddMoreFiles(): boolean {
    const documentsArray = this.formService.form().controls.documents;
    const documents = documentsArray.getRawValue();

    // If no documents exist yet, allow adding the first one
    if (documents.length === 0) {
      this.addDocumentMessage.set('');
      return true;
    }

    // Check if we haven't reached the maximum total documents
    const maxTotalDocuments = Object.keys(this.config.contactFileTypes()).length * this.config.contactMaxFilePerType;
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
