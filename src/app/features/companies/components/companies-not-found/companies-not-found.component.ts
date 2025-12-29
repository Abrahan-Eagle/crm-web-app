import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-companies-not-found',
  imports: [NgOptimizedImage],
  template: `<div class="text-center py-4 max-w-2xl mx-auto">
    <div class="bg-slate-50 py-4 mb-5 rounded-xl">
      <img
        ngSrc="/assets/icons/company/no-companies-found.svg"
        alt="Nothing found"
        width="242"
        height="242"
        priority
        class="mx-auto"
      />
    </div>
    <h3 class="text-2xl font-bold">No registered companies found</h3>
    <p class="text-balance">
      No companies have been found with these search terms, try adjusting the filters, or register a new company.
    </p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompaniesNotFoundComponent {}
