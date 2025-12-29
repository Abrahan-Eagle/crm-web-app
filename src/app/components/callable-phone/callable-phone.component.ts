import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MakeACall } from '@/interfaces';
import { VoIPService } from '@/services';
import { Permissions, UserPermissionsService } from '@/utils';

@Component({
  selector: 'app-callable-phone',
  imports: [],
  templateUrl: './callable-phone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallablePhoneComponent {
  @Input() callInfo: MakeACall | null = null;

  public readonly permission = Permissions;

  constructor(
    public readonly voip: VoIPService,
    public readonly permissions: UserPermissionsService,
  ) {}
}
