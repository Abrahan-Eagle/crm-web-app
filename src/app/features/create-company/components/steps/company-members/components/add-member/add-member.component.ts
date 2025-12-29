import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomInputComponent, ModalComponent } from '@/components';
import { CreateContactComponent } from '@/features/create-contact';
import { Contact, ContactSummary, MemberDraft } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { dateValidator, ModalService, SearchService } from '@/utils';

import { SearchContactComponent } from '../search-contact';

@Component({
  selector: 'app-add-member',
  imports: [
    ModalComponent,
    CreateContactComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    CustomInputComponent,
    FormsModule,
    TextInitialsPipe,
    SearchContactComponent,
    CustomDatePipe,
  ],
  templateUrl: './add-member.component.html',
  providers: [SearchService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMemberComponent {
  @Output() memberAdd = new EventEmitter<MemberDraft>();

  @ViewChild('memberFormModal') memberFormModal!: ModalComponent;

  @ViewChildren(CreateContactComponent) createContactComponentList?: QueryList<CreateContactComponent>;

  maxMerberSince = computed(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear());
    return today.toISOString().split('T')[0];
  });

  constructor(
    public readonly _fb: FormBuilder,
    private readonly modalService: ModalService,
  ) {}

  public readonly form = this._fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.max(100)]],
    percentage: [0, [Validators.pattern(/^\d*(\.\d{0,2})?$/), Validators.min(0.01), Validators.max(100)]],
    member_since: [null as Date | null, [Validators.required, dateValidator()]],
    contact: [null as null | ContactSummary | Contact, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const member = {
      title: this.form.value.title!,
      percentage: this.form.value.percentage!,
      member_since: this.form.value.member_since!,
      contact: this.form.value.contact!,
    };
    this.memberAdd.emit(member);
    this.modalService.closeAll();
    this.form.reset();
    this.createContactComponentList?.forEach((component) => component.formService.reset());
  }

  updateMember(member: MemberDraft) {
    this.form.patchValue(member as any);
    this.memberFormModal.open();
  }
}
