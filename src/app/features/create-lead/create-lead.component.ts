import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CustomInputComponent,
  FileHandlerComponent,
  FilePickerComponent,
  FormErrorMessageComponent,
} from '@/components';
import { User } from '@/interfaces';
import { TextInitialsPipe } from '@/pipes';
import { LeadsService } from '@/services';
import { NotificationService, ObjectId } from '@/utils';

import { SearchUserComponent } from './components';

@Component({
  selector: 'app-create-lead',
  imports: [
    FilePickerComponent,
    ReactiveFormsModule,
    SearchUserComponent,
    TextInitialsPipe,
    FormErrorMessageComponent,
    FileHandlerComponent,
    CustomInputComponent,
  ],
  templateUrl: './create-lead.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLeadComponent {
  public readonly form;

  public readonly loading = signal(false);

  public readonly failedRows = signal<number[]>([]);

  constructor(
    private readonly _fb: FormBuilder,
    private readonly leadsService: LeadsService,
    private readonly notification: NotificationService,
    private readonly router: Router,
  ) {
    this.form = this._fb.group({
      assigned_to: [null as null | User, [Validators.required]],
      file: [null as File | null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)]],
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const value = this.form.value;

    const group = {
      id: ObjectId(),
      name: value.name!,
      assigned_to: value.assigned_to!.id,
    };

    this.leadsService
      .createLead(group, value.file!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((result) => {
        this.notification.push({
          message: 'Lead created successfully',
          type: 'success',
        });
        if (result.skipped.length > 0) {
          this.failedRows.set(result.skipped);
        } else {
          this.router.navigate(['/leads']);
        }
      });
  }

  public addFile(files: File[]): void {
    const file = files.at(0);

    this.form.controls.file.setValue(file ?? null);
    this.form.controls.file.updateValueAndValidity();
  }
}
