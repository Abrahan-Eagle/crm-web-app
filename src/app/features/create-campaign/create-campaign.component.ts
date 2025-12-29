import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Editor, NgxEditorModule } from 'ngx-editor';
import { finalize } from 'rxjs';

import {
  CustomInputComponent,
  FileHandlerComponent,
  FilePickerComponent,
  FormErrorMessageComponent,
} from '@/components';
import { CreateCampaign } from '@/interfaces';
import { CampaignService } from '@/services';
import { NotificationService, ObjectId } from '@/utils';

@Component({
  selector: 'app-create-campaign',
  imports: [
    FilePickerComponent,
    ReactiveFormsModule,
    FormErrorMessageComponent,
    FileHandlerComponent,
    CustomInputComponent,
    NgxEditorModule,
  ],
  templateUrl: './create-campaign.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCampaignComponent implements OnInit, OnDestroy {
  public editor!: Editor;

  public readonly form = this._fb.group({
    sender: ['info@businessmarketfindersllc.com', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.maxLength(100)]],
    file: [null as File | null, [Validators.required]],
    message: ['', [Validators.required, Validators.maxLength(2500)]],
  });

  public readonly loading = signal(false);

  constructor(
    private readonly _fb: FormBuilder,
    private readonly campaignService: CampaignService,
    private readonly notification: NotificationService,
    private readonly router: Router,
  ) {}

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const value = this.form.value;

    const campaign: CreateCampaign = {
      id: ObjectId(),
      message: value.message!.trim(),
      sender: value.sender!.trim(),
      subject: value.subject!.trim(),
    };

    this.campaignService
      .createCampaign(campaign, value.file!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.notification.push({
          message: 'Campaign created successfully',
          type: 'success',
        });

        this.router.navigate(['/campaigns']);
      });
  }

  public addFile(files: File[]): void {
    const file = files.at(0);

    this.form.controls.file.setValue(file ?? null);
    this.form.controls.file.updateValueAndValidity();
  }
}
