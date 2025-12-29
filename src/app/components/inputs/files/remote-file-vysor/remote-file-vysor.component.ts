import { Component, Input } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-remote-file-vysor',
  imports: [PdfViewerModule],
  templateUrl: './remote-file-vysor.component.html',
})
export class RemoteFileVysorComponent {
  @Input({ required: true }) public source!: string;

  @Input({ required: true }) public type!: string;
}
