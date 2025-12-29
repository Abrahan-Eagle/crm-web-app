import { ChangeDetectionStrategy, Component, computed, Input, OnChanges, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { CustomDatePipe, FormatPhonePipe } from '@/pipes';
import { LeadsService, MeService, VoIPService } from '@/services';
import { NotificationService } from '@/utils';

import { CreateProspectNoteComponent, ProspectActivityComponent } from './components';
import { ProspectDetailsService } from './prospect-details.service';

@Component({
  selector: 'app-prospect-details',
  imports: [CreateProspectNoteComponent, ProspectActivityComponent, FormatPhonePipe, CustomDatePipe],
  templateUrl: './prospect-details.component.html',
  providers: [ProspectDetailsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectDetailsComponent implements OnChanges {
  @Input({ required: true }) leadId!: string;

  @Input({ required: true }) prospectId!: string;

  public readonly loading = signal(false);

  public readonly calling = signal(false);

  public readonly prospect = computed(() => this.prospectService.prospect());

  constructor(
    private readonly meService: MeService,
    private readonly leadService: LeadsService,
    private readonly prospectService: ProspectDetailsService,
    private readonly notification: NotificationService,
    private readonly voip: VoIPService,
  ) {}

  ngOnChanges(): void {
    this.getProspect();
  }

  getProspect(): void {
    this.loading.set(true);

    this.leadService
      .getProspect(this.leadId, this.prospectId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((prospect) => {
        this.prospectService.prospect.set(prospect);
        this.prospectService.leadId.set(this.leadId);
      });
  }

  requestACall() {
    this.calling.set(true);
    this.voip
      .makeACall({ entity_id: this.prospectId, entity_type: 'PROSPECT', phone_hint: '', phone_index: 0 })
      .pipe(finalize(() => this.calling.set(false)))
      .subscribe(() => {
        this.prospectService.prospect.set({
          ...this.prospectService.prospect()!,
          call_history: [
            { created_at: new Date().toISOString(), created_by: this.meService.user()! },
            ...this.prospectService.prospect()!.call_history,
          ],
        });
        this.notification.push({
          message: 'Call requested successfully',
          type: 'info',
        });
      });
  }
}
