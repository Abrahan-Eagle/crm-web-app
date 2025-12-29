import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-campaigns-not-found',
  imports: [NgOptimizedImage],
  template: `<div class="text-center py-4 max-w-2xl mx-auto">
    <div class="py-4 mb-5 rounded-xl">
      <img ngSrc="/assets/icons/not-found.svg" alt="Nothing found" width="242" height="242" priority class="mx-auto" />
    </div>
    <h3 class="text-2xl font-bold">No campaigns found</h3>
    <p class="text-balance">You have not created any campaigns.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsNotFoundComponent {}
