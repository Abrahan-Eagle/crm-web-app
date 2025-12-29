import { ChangeDetectionStrategy, Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, iif, mergeMap, of } from 'rxjs';

import { Note } from '@/interfaces';
import { CompanyService, ContactService, MeService } from '@/services';
import { BusinessConfigService, ObjectId } from '@/utils';

import { CustomSelectComponent, FormErrorMessageComponent } from '../inputs';

@Component({
  selector: 'app-create-note',
  imports: [ReactiveFormsModule, CustomSelectComponent, FormErrorMessageComponent],
  templateUrl: './create-note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateNoteComponent {
  public readonly loading = signal(false);

  @Output() note = new EventEmitter<Note | null>();

  @Input({ required: true }) entityId!: string;

  @Input({ required: true }) entityType!: 'contact' | 'company';

  public readonly levelNote = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.levelNote()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    public readonly config: BusinessConfigService,
    public readonly _fb: FormBuilder,
    private readonly meService: MeService,
    private readonly contactService: ContactService,
    private readonly companyService: CompanyService,
  ) {}

  public form = this._fb.group({
    level: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const note = {
      id: ObjectId(),
      description: this.form.value.description,
      level: this.form.value.level,
      author: this.meService.user()!,
      created_at: new Date().toISOString().split('T')[0],
    } as Note;

    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          iif(
            () => this.entityType === 'contact',
            this.contactService.createNote(this.entityId, note),
            this.companyService.createNote(this.entityId, note),
          ),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.note.emit(note);
        this.form.reset();
        this.form.controls.level.setValue('');
        this.form.updateValueAndValidity();
      });
  }
}
