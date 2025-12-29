import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { FormErrorMessageComponent, ModalComponent } from '@/components';
import { CustomInputComponent } from '@/components/inputs/custom-input.component';
import { RemoteFileHandlerComponent } from '@/components/inputs/files/remote-file-handler';
import { BankListItem, SelectedAttachment, SendEmailToBanksRequest } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { BankService } from '@/services';
import { NotificationService } from '@/utils/services';

import { AttachmentSelectorComponent } from './components/attachment-selector';
import { BankSelectorComponent } from './components/bank-selector';
import { EmailFacadeService } from './email-facade.service';

@Component({
  selector: 'app-send-email-to-banks',
  imports: [
    ReactiveFormsModule,
    FormErrorMessageComponent,
    CustomInputComponent,
    TextInitialsPipe,
    ModalComponent,
    NgOptimizedImage,
    RemoteFileHandlerComponent,
    BankSelectorComponent,
    AttachmentSelectorComponent,
  ],
  templateUrl: './send-email-to-banks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendEmailBanksComponent {
  public readonly loading = signal(false);

  public readonly form = this.formBuilder.group({
    subject: ['', [Validators.required, Validators.maxLength(35)]],
    banks: [[] as BankListItem[], [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    attachments: [[] as SelectedAttachment[], [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly emailService: EmailFacadeService,
    private readonly bankService: BankService,
    private readonly notificationService: NotificationService,
  ) {}

  public submit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const request: SendEmailToBanksRequest = {
      bank_ids: formValue.banks!.map((bank) => bank.id),
      subject: formValue.subject!,
      message: formValue.message!,
      attachments: formValue.attachments!.map((attachment) => ({
        document_id: attachment.document_id,
        entity_id: attachment.entity_id,
        entity_type: attachment.entity_type,
      })),
    };

    this.loading.set(true);
    this.bankService
      .sendEmailToBanks(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.notificationService.push({
          message: 'Email sent successfully',
          type: 'success',
        });
        this.resetForm();
      });
  }

  public removeBank(bankId: string): void {
    const banks = this.form.controls.banks.value ?? [];

    this.form.controls.banks.setValue(banks.filter((bank) => bank.id !== bankId));
    this.form.controls.banks.updateValueAndValidity();
    this.form.controls.banks.markAllAsTouched();
  }

  public removeAttachment(documentId: string): void {
    const attachments = this.form.controls.attachments.value ?? [];

    this.form.controls.attachments.setValue(attachments.filter((attachment) => attachment.document_id !== documentId));
    this.form.controls.attachments.updateValueAndValidity();
    this.form.controls.banks.markAllAsTouched();
  }

  public resetForm(): void {
    this.form.reset({
      subject: '',
      banks: [],
      message: '',
      attachments: [],
    });
  }

  updateBanks(selected: BankListItem[]): void {
    const banks = [...(this.form.controls.banks.value ?? []), ...selected];
    const bankIds = new Set();

    const update = banks.filter((bank) => {
      const duplicate = bankIds.has(bank.id);
      bankIds.add(bank.id);
      return !duplicate;
    });

    this.form.controls.banks.setValue(update);
    this.form.controls.banks.updateValueAndValidity();
    this.form.controls.banks.markAllAsTouched();
  }

  updateAttachments(selected: SelectedAttachment[]): void {
    const attachments = [...(this.form.controls.attachments.value ?? []), ...selected];
    const attachmentIds = new Set();

    const update = attachments.filter((attachment) => {
      const duplicate = attachmentIds.has(attachment.document_id);
      attachmentIds.add(attachment.document_id);
      return !duplicate;
    });

    this.form.controls.attachments.setValue(update);
    this.form.controls.attachments.updateValueAndValidity();
    this.form.controls.attachments.markAllAsTouched();
  }
}
