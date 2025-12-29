import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  BankAddressComponent,
  BankBasicInformationComponent,
  BankContactInformationComponent,
  BankCreatedComponent,
  BankDocumentsComponent,
  BankFiltersComponent,
  FiltersComponent,
} from './components';
import { CreateBankService } from './create-bank.service';

@Component({
  selector: 'app-create-bank',
  imports: [
    NgClass,
    BankAddressComponent,
    BankBasicInformationComponent,
    BankContactInformationComponent,
    FiltersComponent,
    BankFiltersComponent,
    BankDocumentsComponent,
    BankCreatedComponent,
  ],
  templateUrl: './create-bank.component.html',
  providers: [CreateBankService, CreateBankService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBankComponent {
  constructor(public readonly formService: CreateBankService) {}
}
