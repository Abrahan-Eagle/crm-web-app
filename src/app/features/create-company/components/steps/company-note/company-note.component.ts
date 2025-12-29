import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomSelectComponent } from '@/components';
import { BusinessConfigService } from '@/utils';

import { CreateCompanyService } from '../../../create-company.service';

@Component({
  selector: 'app-company-note',
  imports: [CustomSelectComponent, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './company-note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyNoteComponent {
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
    public readonly formService: CreateCompanyService,
    public readonly config: BusinessConfigService,
  ) {}

  updateCharacterCount(): void {
    const descriptionValue = this.form.controls.description.value || '';
    this.charCount.set(descriptionValue.length);
  }

  public submit() {
    this.formService.next();
  }
}
