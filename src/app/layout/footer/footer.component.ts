import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: ` <footer class="bg-white p-2 shadow text-center text-sm">
    © {{ year }} Powered by Business Market Finders Inc. All Rights Reserved. Founded in 2013.
  </footer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  public readonly year = new Date().getFullYear();
}
