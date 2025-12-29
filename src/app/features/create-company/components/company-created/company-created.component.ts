import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-company-created',
  imports: [NgOptimizedImage, RouterLink],
  template: `<div class="text-center">
    <div class="bg-slate-50 py-4 mb-5">
      <img
        ngSrc="/assets/icons/company/company-created.svg"
        alt="Company created successfully"
        width="200"
        height="260"
        priority
        class="mx-auto"
      />
    </div>
    <h2 class="text-2xl font-bold mb-4">Company created successfully!</h2>
    <p>Efficiently monitor loans for your with exceptional processes and service. Start now!</p>
    <a routerLink="/companies" class="w-full p-2 bg-secondary block text-white rounded-lg mt-11 cursor-pointer">
      View companies list
    </a>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCreatedComponent {}
