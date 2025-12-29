import { Component, ElementRef, Input, OnChanges, signal, SimpleChanges, ViewChild } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-file-vysor',
  imports: [PdfViewerModule],
  templateUrl: './file-vysor.component.html',
})
export class FileVysorComponent implements OnChanges {
  public readonly file = signal<Uint8Array | string | null>(null);

  public show = signal(false);

  public readonly img = signal<MediaImage | null>(null);

  @Input({ required: false }) public source: File | string | null = null;

  @Input({ required: true }) public type!: string;

  fileReader = new FileReader();

  @ViewChild('viewer') viewer!: ElementRef<HTMLDivElement>;

  constructor() {
    this.fileReader.onload = (e: any) => {
      if (this.type === 'application/pdf') {
        this.file.set(e.target.result);
      } else {
        this.img.set(document.createElement('img'));
        this.img()!.src = e.target.result;
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source'].currentValue && changes['source'].currentValue instanceof File) {
      if (this.type === 'application/pdf') {
        this.fileReader.readAsArrayBuffer(this.source as File);
      } else {
        this.fileReader.readAsDataURL(this.source as File);
      }
    }
  }
}
