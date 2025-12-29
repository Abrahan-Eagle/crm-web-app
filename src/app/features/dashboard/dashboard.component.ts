import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { SafePipe } from '@/pipes';
import { DashboardService } from '@/services';

@Component({
  selector: 'app-users',
  templateUrl: './dashboard.component.html',
  imports: [SafePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly loading = signal(true);

  public readonly iframe = signal<string | null>(null);

  public readonly service = inject(DashboardService);

  constructor() {
    this.loading.set(true);
    this.service
      .getDashboard()
      .pipe(
        takeUntilDestroyed(),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((iframe) => this.iframe.set(iframe));
  }
}
