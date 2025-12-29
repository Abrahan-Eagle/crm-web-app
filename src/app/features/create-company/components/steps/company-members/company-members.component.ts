import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormErrorMessageComponent } from '@/components';
import { CreateCompanyService } from '@/features/create-company';
import { MemberDraft } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { BusinessConfigService } from '@/utils';

import { AddMemberComponent } from './components';

@Component({
  selector: 'app-company-members',
  imports: [
    NgOptimizedImage,
    AddMemberComponent,
    TextInitialsPipe,
    CustomDatePipe,
    ReactiveFormsModule,
    FormErrorMessageComponent,
  ],
  templateUrl: './company-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyMembersComponent {
  @ViewChild('addMemberComponent') addMemberComponent!: AddMemberComponent;

  public readonly form = this.formService.form().controls.step_2;

  public readonly members = computed(() => this.form.controls.members.value ?? []);

  get canAddMoreMembers(): boolean {
    return this.members().length >= this.config.maxCompanyMembers;
  }

  constructor(
    public readonly formService: CreateCompanyService,
    public readonly config: BusinessConfigService,
  ) {}

  addMember(member: MemberDraft): void {
    if (this.canAddMoreMembers) {
      return;
    }

    const members = this.form.controls.members.value ?? [];

    const index = members.findIndex((value) => value.contact!.id === member.contact!.id);
    if (index > -1) {
      members[index] = member;
    } else {
      members.push(member);
    }

    this.form.controls.members.setValue(members);
  }

  removeMember(index: number) {
    const members = this.form.controls.members.value ?? [];
    if (members.at(index)) {
      members.splice(index, 1);
    }

    this.form.controls.members.setValue(members);
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formService.next();
  }
}
