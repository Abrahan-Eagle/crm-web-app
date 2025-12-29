import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { Note } from '@/interfaces';
import { CustomDatePipe } from '@/pipes';
import { BusinessConfigService } from '@/utils';

@Component({
  selector: 'app-prospect-note',
  imports: [CustomDatePipe, NgClass],
  templateUrl: './prospect-note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProspectNoteComponent {
  @Input({ required: true }) note!: Note;

  public readonly expanded = signal(false);

  constructor(public readonly config: BusinessConfigService) {}
}
