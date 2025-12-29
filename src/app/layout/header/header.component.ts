import { ClipboardModule } from '@angular/cdk/clipboard';
import { DOCUMENT, NgClass, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, Inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

import { CustomPhoneCallerComponent, ModalComponent, UserNotificationsComponent } from '@/components';
import { UpdateProfileComponent } from '@/features/update-profile';
import { TextInitialsPipe } from '@/pipes';
import { MeService } from '@/services';
import { Permissions, SidebarService, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-header',
  imports: [
    ClipboardModule,
    NgOptimizedImage,
    NgClass,
    TextInitialsPipe,
    UserNotificationsComponent,
    CustomPhoneCallerComponent,
    RouterLink,
    ModalComponent,
    UpdateProfileComponent,
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @ViewChild('updateProfile') modal!: ModalComponent;

  public readonly closeSidebar = computed(() => this.sidebar.closeSidebar());

  public readonly user = computed(() => this.meService.user());

  public readonly userConfigured = computed(() => {
    return (
      this.meService.user()?.first_name !== 'Guest' &&
      this.meService.user()?.last_name !== 'User' &&
      !!this.meService.user()?.phone
    );
  });

  public readonly permission = Permissions;

  constructor(
    private readonly sidebar: SidebarService,
    @Inject(DOCUMENT) public document: Document,
    public auth: AuthService,
    private meService: MeService,
    public readonly permissions: UserPermissionsService,
  ) {
    let show = false;
    effect(() => {
      if (this.user() && !this.userConfigured()) {
        if (!this.modal.show() && !show) {
          this.modal.open();
          show = true;
        }
      }
    });
  }

  public toggle(): void {
    this.sidebar.closeSidebar.set(!this.sidebar.closeSidebar());
  }
}
