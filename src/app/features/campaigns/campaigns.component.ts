import { NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ModalComponent } from '@/components';
import { Campaign } from '@/interfaces';
import { CampaignService } from '@/services';

import { CampaignsNotFoundComponent, ToggleCampaignComponent } from './components';

@Component({
  selector: 'app-campaigns',
  imports: [NgOptimizedImage, RouterLink, CampaignsNotFoundComponent, ModalComponent, NgClass, ToggleCampaignComponent],
  templateUrl: './campaigns.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsComponent implements OnInit {
  public readonly loading = signal(true);

  public readonly campaigns = signal<Campaign[]>([]);

  public readonly selected = signal<Campaign | null>(null);

  constructor(private readonly campaign: CampaignService) {}

  ngOnInit(): void {
    this.getCampaigns();
  }

  public getCampaigns(): void {
    this.loading.set(true);
    this.campaign
      .getCampaigns()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((campaigns) => this.campaigns.set(campaigns));
  }
}
