import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomSelectComponent } from '@/components';
import { BusinessConfigService } from '@/utils';

import { CreateContactService } from '../../../create-contact.service';

@Component({
  selector: 'app-contact-notes',
  imports: [NgOptimizedImage, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './contact-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactNotesComponent {
  public readonly form = this.formService.form().controls.step_3;

  public readonly charCount = signal(0);

  public readonly noteLevel = computed<{ values: string[]; labels: string[] }>(() => {
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
    public readonly formService: CreateContactService,
    public readonly config: BusinessConfigService,
  ) {
    this.updateCharacterCount();
  }

  updateCharacterCount(): void {
    const descriptionValue = this.form.controls.description.value || '';
    this.charCount.set(descriptionValue.length);
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }
}
