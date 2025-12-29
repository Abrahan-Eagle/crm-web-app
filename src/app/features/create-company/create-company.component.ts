import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  CompanyBusinessDetailsComponent,
  CompanyCreatedComponent,
  CompanyDocumentsComponent,
  CompanyMembersComponent,
  CompanyNoteComponent,
} from './components';
import { CreateCompanyService } from './create-company.service';

@Component({
  selector: 'app-create-company',
  imports: [
    CompanyBusinessDetailsComponent,
    CompanyMembersComponent,
    CompanyDocumentsComponent,
    NgClass,
    CompanyCreatedComponent,
    CompanyNoteComponent,
  ],
  templateUrl: './create-company.component.html',
  providers: [CreateCompanyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCompanyComponent {
  constructor(public readonly formService: CreateCompanyService) {}
}
