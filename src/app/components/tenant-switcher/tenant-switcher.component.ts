import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-tenant-switcher',
  templateUrl: './tenant-switcher.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantSwitcherComponent {
  public readonly currentTenant = computed(() => window.localStorage.getItem('tenant_id'));

  public readonly tenants = signal<{ name: string; id: string }[]>([]);

  constructor(private auth: AuthService) {
    this.auth.user$
      .pipe(takeUntilDestroyed())
      .subscribe((user) =>
        this.tenants.set(
          ((user?.['tenants'] ?? []) as string[]).map((tenant) => ({ id: tenant, name: this.nameFromId(tenant) })),
        ),
      );
  }

  private nameFromId(input: string): string {
    let formattedString = input.replace(/_/g, ' ');

    formattedString = formattedString.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    return formattedString;
  }

  public switchTenant(event: Event) {
    window.localStorage.setItem('tenant_id', (event.target as any).value);
    window.location.replace('/');
  }
}
