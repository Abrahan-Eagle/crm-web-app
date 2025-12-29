import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-draft-not-found',
  imports: [NgOptimizedImage],
  template: `<div class="text-center py-4 max-w-2xl mx-auto">
    <div class="bg-slate-50 py-4 mb-5 rounded-xl">
      <img
        ngSrc="/assets/icons/application/no-application-found.svg"
        alt="Nothing found"
        width="242"
        height="242"
        priority
        class="mx-auto"
      />
    </div>
    <h3 class="text-2xl font-bold">There is no draft yet.</h3>
    <p class="text-balance">Drafts are applications received from external sources.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftNotFoundComponent {}
