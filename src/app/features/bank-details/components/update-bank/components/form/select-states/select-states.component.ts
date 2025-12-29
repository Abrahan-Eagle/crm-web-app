import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';

import { FormErrorMessageComponent } from '@/components';
import { DemographicService, ObjectId } from '@/utils';

@Component({
  selector: 'app-select-states',
  imports: [NgClass, ScrollingModule, FormErrorMessageComponent, FormsModule],
  templateUrl: './select-states.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStatesComponent implements ControlValueAccessor, OnInit {
  @HostListener('document:click', ['$event.target'])
  onClick(btn: any) {
    if (this.open() && !this.ref.nativeElement.contains(btn)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  public readonly seed = ObjectId();

  public readonly open = signal(false);

  @Input() label = '';

  @Input({ required: true }) country!: string;

  public readonly search = signal<string>('');

  public readonly selectedState = signal<Map<string, { name: string; code: string }>>(new Map());

  value: string[] = [];

  public readonly states = signal<{ name: string; code: string }[]>([]);

  public readonly statesFiltered = computed(() => {
    const filtered = !this.search()
      ? this.states()
      : this.states().filter((state) => state!.name!.toLowerCase().includes(this.search().toLowerCase()));
    return filtered;
  });

  constructor(
    private readonly ref: ElementRef,
    public readonly control: NgControl,
    private readonly _cd: ChangeDetectorRef,
    public readonly demographics: DemographicService,
  ) {
    this.control.valueAccessor = this;
  }

  ngOnInit(): void {
    this.demographics
      .getStates((this.demographics.allCountries() as Record<string, string>)[this.country])
      .subscribe((data) =>
        this.states.set(
          Object.entries(data || {}).map(([code, name]) => ({
            name,
            code,
          })),
        ),
      );
  }

  isChecked(stateId: string): boolean {
    return this.selectedState().has(stateId);
  }

  onCheckChange(event: Event, state: { name: string; code: string }) {
    const target = event.target as HTMLInputElement;
    const stateId = target.id.replaceAll(this.seed, '');
    if (target.checked) {
      if (!this.selectedState().has(stateId)) {
        this.selectedState.update((current) => current.set(stateId, state));
      }
    } else {
      this.selectedState.update((current) => {
        current.delete(stateId);
        return current;
      });
    }
    this.writeValue(Array.from(this.selectedState().values()));
  }

  getSelectedText(): string {
    return Array.from(this.selectedState().values())
      .map((value) => value.name)
      .join(', ');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange = (_: any) => {};

  public onTouched() {}

  writeValue(value: { name: string; code: string }[]): void {
    if (!value) {
      this.selectedState.set(new Map());
      return;
    }
    this.selectedState.set(new Map(value.map((state) => [state.code, state])));
    this.onChange(value);
    this._cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
