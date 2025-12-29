import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';

import { CustomDatePipe } from '@/pipes';

import { ProspectDetailsComponent } from '../../prospect-details.component';
import { ProspectNoteComponent } from '../prospect-note';

@Component({
  selector: 'app-prospect-activity',
  imports: [NgClass, CustomDatePipe, ProspectNoteComponent],
  templateUrl: './prospect-activity.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectActivityComponent implements OnInit {
  public readonly selectedTab = signal<'calls' | 'notes'>('calls');

  public readonly prospect = computed(() => this.details.prospect()!);

  constructor(private readonly details: ProspectDetailsComponent) {}

  ngOnInit(): void {
    if (this.prospect().notes.length > 0) {
      this.selectedTab.set('notes');
    }
  }
}
