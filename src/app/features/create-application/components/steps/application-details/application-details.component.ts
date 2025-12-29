import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CustomInputComponent, CustomSelectComponent, FormErrorMessageComponent } from '@/components';
import { CreateApplicationService } from '@/features/create-application';
import { CustomDatePipe, TextInitialsPipe, YearsAgoPipe } from '@/pipes';
import { BusinessConfigService } from '@/utils';

import { SearchCompanyComponent } from './components';

@Component({
  selector: 'app-application-details',
  imports: [
    ReactiveFormsModule,
    FormErrorMessageComponent,
    NgOptimizedImage,
    CustomInputComponent,
    CustomSelectComponent,
    TextInitialsPipe,
    CustomDatePipe,
    SearchCompanyComponent,
    YearsAgoPipe,
    RouterLink,
  ],
  templateUrl: './application-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationDetailsComponent {
  public readonly form = this.formService.form.controls.step_1;

  public readonly company = computed(() => this.form.controls.company.value ?? []);

  public readonly productType = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.productType()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  public readonly referralSources = computed<{ values: string[]; labels: string[] }>(() => {
    return Object.entries(this.config.referralSources()).reduce(
      (prev, [value, key]) => {
        prev.labels.push(key);
        prev.values.push(value);

        return prev;
      },
      { values: [] as string[], labels: [] as string[] },
    );
  });

  constructor(
    public readonly formService: CreateApplicationService,
    public readonly config: BusinessConfigService,
  ) {}

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formService.next();
  }
}
