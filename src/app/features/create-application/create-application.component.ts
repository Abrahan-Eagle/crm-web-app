import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  AdditionalStatementsComponent,
  ApplicationCreatedComponent,
  ApplicationDetailsComponent,
  UploadApplicationDocumentsComponent,
} from './components';
import { CreateApplicationService } from './create-application.service';

@Component({
  selector: 'app-create-applications',
  imports: [
    ApplicationCreatedComponent,
    ApplicationDetailsComponent,
    UploadApplicationDocumentsComponent,
    AdditionalStatementsComponent,
    NgClass,
  ],
  providers: [CreateApplicationService],
  templateUrl: './create-application.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateApplicationsComponent {
  constructor(public readonly formService: CreateApplicationService) {}
}
