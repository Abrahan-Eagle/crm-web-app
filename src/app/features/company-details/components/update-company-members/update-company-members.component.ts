import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, mergeMap, of } from 'rxjs';

import { FormErrorMessageComponent } from '@/components';
import { AddMemberComponent } from '@/features/create-company/components';
import { MemberDraft } from '@/interfaces';
import { CustomDatePipe, TextInitialsPipe } from '@/pipes';
import { CompanyService } from '@/services';
import { BusinessConfigService, percentageValidator } from '@/utils';

@Component({
  selector: 'app-update-company-members',
  imports: [
    NgOptimizedImage,
    AddMemberComponent,
    TextInitialsPipe,
    CustomDatePipe,
    ReactiveFormsModule,
    FormErrorMessageComponent,
    RouterLink,
  ],
  templateUrl: './update-company-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateCompanyMembersComponent {
  public companyId = signal<string>('');

  @Input() set id(value: string) {
    this.companyId.set(value);
    this.setCompanyMembers(value);
  }

  public readonly loading = signal(true);

  @ViewChild('addMemberComponent') addMemberComponent!: AddMemberComponent;

  public readonly members = computed(() => this.form.controls.members.value ?? []);

  get canAddMoreMembers(): boolean {
    return this.members().length >= this.config.maxCompanyMembers;
  }

  constructor(
    public readonly config: BusinessConfigService,
    private readonly companyService: CompanyService,
    private readonly _fb: FormBuilder,
    private readonly router: Router,
  ) {}

  addMember(member: MemberDraft): void {
    if (this.canAddMoreMembers) {
      return;
    }

    const members = this.form.controls.members.value ?? [];

    const index = members.findIndex((value) => value!.contact!.id === member!.contact!.id);
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

  public readonly form = this._fb.group({
    members: [[] as MemberDraft[], [Validators.required, percentageValidator]],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    of(this.loading.set(true))
      .pipe(
        mergeMap(() =>
          this.companyService.updateCompany(this.companyId(), {
            members: this.form.controls.members.value!.map((member) => ({
              title: member.title,
              percentage: member.percentage,
              member_since: member.member_since,
              contact_id: member.contact!.id!,
            })),
          }),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(() => {
        this.router.navigate(['/companies', this.companyId()]);
      });
  }

  private setCompanyMembers(id: string): void {
    of(this.loading.set(true))
      .pipe(
        mergeMap(() => this.companyService.getCompany(id)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((company) => {
        this.form.patchValue(
          {
            members: company.members.map((member) => ({
              title: member.title,
              percentage: member.percentage,
              member_since: member.member_since,
              contact: member.contact,
            })) as MemberDraft[],
          },
          { emitEvent: false },
        );
      });
  }
}
