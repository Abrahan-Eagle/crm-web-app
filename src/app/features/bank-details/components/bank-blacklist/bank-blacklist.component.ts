import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { FormErrorMessageComponent, ModalComponent } from '@/components';
import { Bank } from '@/interfaces';
import { BankService } from '@/services';
import { NotificationService, Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-bank-blacklist',
  imports: [ModalComponent, ReactiveFormsModule, DatePipe, NgOptimizedImage, FormErrorMessageComponent],
  templateUrl: './bank-blacklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankBlacklistComponent {
  @Input({ required: true }) bank!: Bank;

  @Output() bankUpdated = new EventEmitter<Bank>();

  @ViewChild('blacklistModal') blacklistModal!: ModalComponent;

  public readonly loading = signal(false);

  public readonly permission = Permissions;

  public readonly blacklistForm = this._fb.group({
    note: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
  });

  constructor(
    private readonly bankService: BankService,
    public readonly permissions: UserPermissionsService,
    private readonly _fb: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

  public openBlacklistModal(): void {
    this.blacklistForm.reset();
    this.blacklistModal.open();
  }

  public addToBlacklist(): void {
    this.loading.set(true);
    const note = this.blacklistForm.get('note')?.value || '';
    this.bankService
      .blacklistBank(this.bank.id, note)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((bank) => {
        this.bankUpdated.emit(bank);
        this.blacklistModal.close();
        this.notificationService.push({
          message: 'Bank successfully added to blacklist',
          type: 'warning',
        });
        this.router.navigate(['/banks']);
      });
  }

  public removeFromBlacklist(): void {
    this.loading.set(true);
    this.bankService
      .removeFromBlacklist(this.bank.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.bankUpdated.emit({ ...this.bank, blacklist: null });
        this.notificationService.push({
          message: 'Bank successfully removed from blacklist',
          type: 'success',
        });
      });
  }
}
