import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, computed, ElementRef, EventEmitter, Input, Output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BusinessConfigService, InputErrorLocatorService, ObjectId } from '@/utils';

import { CustomSelectComponent } from '../../custom-select.component';
import { FileHandlerComponent } from '../file-handler';

@Component({
  selector: 'app-file-picker',
  imports: [NgOptimizedImage, FileHandlerComponent, CustomSelectComponent, FormsModule, NgClass],
  templateUrl: './file-picker.component.html',
})
export class FilePickerComponent {
  public readonly seed = ObjectId();

  @ViewChild('filePicker') public filePicker!: ElementRef<HTMLInputElement>;

  @Input() public validExtensions: string[] = ['.jpg', '.jpeg', '.png', '.pdf'];

  @Input() public maxFiles: number = 4;

  @Input() public maxSizeInBytes: number = 1e7;

  @Input() public withType: boolean = false;

  @Input() public manualHandled: boolean = false;

  @Input() public hideDescription: boolean = false;

  @Input() public fileTypes: Record<string, string> | null = null;

  public selectedType = '';

  @Output() public selectFiles = new EventEmitter<
    (File & {
      docType?: string;
    })[]
  >();

  public types = computed<{ options: string[]; labels: string[] }>(() => {
    const options: string[] = [];
    const labels: string[] = [];

    if (!this.fileTypes) {
      return { options, labels };
    }

    Object.keys(this.fileTypes).forEach((key) => {
      labels.push(this.fileTypes![key]);
      options.push(key);
    });

    return { options, labels };
  });

  public readonly errors = signal<any[]>([]);

  kbFormatter = Intl.NumberFormat('en', {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
  });

  @Input() files: (File & { docType?: string })[] = [];

  constructor(
    public readonly errorLocator: InputErrorLocatorService,
    private readonly config: BusinessConfigService,
  ) {}

  public pickFile(event: any): void {
    if (
      !(event instanceof Event) &&
      !(event instanceof File) &&
      event instanceof Event &&
      (event.target as any).files.length == 0
    )
      return;

    this.errors.set([]);

    if (this.withType && !this.selectedType) {
      return;
    }

    const files: File[] = (event.target as any).files;
    if (this.manualHandled) {
      this.files = [];
    }

    if (files.length > this.maxFiles || files.length + this.files.length > this.maxFiles) {
      this.errors().push({ FILE_MAX_FILES: this.maxFiles });
      return;
    }

    for (let index = 0; index < files.length; index++) {
      const file: File = files[index];

      if (
        !this.validExtensions.map((ext) => ext.slice(1)).includes((file.name.split('.')?.pop() ?? '').toLowerCase())
      ) {
        this.errors().push({ FILE_INVALID_FORMAT: file.name });
        return;
      }

      if (this.files.length >= this.maxFiles) {
        this.errors().push({ FILE_MAX_FILES: this.maxFiles });
        return;
      }

      if (file.size > this.maxSizeInBytes) {
        this.errors().push({ FILE_INVALID_SIZE: [file.name, this.kbFormatter.format(this.maxSizeInBytes)] });
        return;
      }

      if (this.files.some((f) => f.name == file.name && f.size == file.size && f.lastModified == file.lastModified)) {
        this.errors().push({ FILE_DUPLICATED: file.name });
        return;
      }

      if (this.selectedType && this.withType) {
        Object.assign(file, { docType: this.selectedType });
      }

      this.files.push(file);
    }
    this.filePicker.nativeElement.value = '';
    this.selectedType = '';
    if (this.manualHandled) {
      this.selectFiles.emit(this.files);
    }
  }

  removeFile(pos: number): void {
    this.files.splice(pos, 1);
  }

  public ondragover(event: Event): void {
    event.preventDefault();
  }
}
