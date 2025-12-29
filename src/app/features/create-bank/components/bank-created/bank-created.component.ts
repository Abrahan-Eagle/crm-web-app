import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ModalService } from '@/utils';

import { CreateBankService } from '../../create-bank.service';

@Component({
  selector: 'app-bank-created',
  imports: [NgOptimizedImage],
  template: `<div class="text-center">
    <div class="bg-slate-50 py-4 mb-5">
      <img
        ngSrc="/assets/icons/bank/bank-created.svg"
        alt="Bank created"
        width="242"
        height="242"
        priority
        class="mx-auto"
      />
    </div>
    <h2 class="text-2xl font-bold mb-4">Bank created successfully!</h2>
    <p>
      Efficiently oversee loans for your clients with streamlined processes and exceptional service. Get started now!
    </p>
    <button (click)="reset()" class="w-full p-2 bg-secondary block text-white rounded-lg mt-11 cursor-pointer">
      View banks list
    </button>
  </div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankCreatedComponent {
  constructor(
    public createBank: CreateBankService,
    public readonly modal: ModalService,
  ) {}

  reset() {
    this.modal.closeCurrent();
    this.createBank.reset();
  }
}
