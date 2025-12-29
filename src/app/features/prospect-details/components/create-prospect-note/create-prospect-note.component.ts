import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, mergeMap, of } from 'rxjs';

import { CustomInputComponent, FormErrorMessageComponent } from '@/components';
import { Note } from '@/interfaces';
import { LeadsService, MeService } from '@/services';
import { BusinessConfigService, ObjectId } from '@/utils';

import { ProspectDetailsService } from '../../prospect-details.service';

@Component({
  selector: 'app-create-prospect-note',
  imports: [ReactiveFormsModule, FormErrorMessageComponent, CustomInputComponent],
  templateUrl: './create-prospect-note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProspectNoteComponent {
  public readonly loading = signal(false);

  public readonly minDate = computed(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  });

  constructor(
    public readonly config: BusinessConfigService,
    public readonly _fb: FormBuilder,
    private readonly meService: MeService,
    private readonly leadService: LeadsService,
    private readonly details: ProspectDetailsService,
  ) {}

  public form = this._fb.group({
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
    follow_up_call: [new Date().toDateString().split('T')[0]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const note = {
      id: ObjectId(),
      description: this.form.value.description,
      author: this.meService.user()!,
      created_at: new Date().toISOString().split('T')[0],
      level: 'INFO',
    } as Note;

    if (this.form.value.follow_up_call) {
      Object.assign(note, { follow_up_call: this.form.value.follow_up_call });
      this.details.prospect.set({
        ...this.details.prospect()!,
        follow_up_call: this.form.value.follow_up_call!,
      });
    }

    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.leadService.addProspectNote(this.details.leadId()!, this.details.prospect()!.id!, note)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.details.prospect.set({
          ...this.details.prospect()!,
          notes: [note, ...this.details.prospect()!.notes],
        });

        this.form.reset();
        this.form.updateValueAndValidity();
      });
  }
}
