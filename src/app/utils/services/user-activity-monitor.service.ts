import { Injectable } from '@angular/core';
import { fromEvent, of, tap } from 'rxjs';

import { UserEvent } from '@/interfaces';
import { MeService } from '@/services';

@Injectable({
  providedIn: 'root',
})
export class UserActivityMonitorService {
  constructor(private readonly meService: MeService) {
    this.detectCopy();
    this.detectWindowSizeChanges();
    this.detectPrint();
  }

  notify(event: UserEvent) {
    of(event)
      .pipe(tap((event) => console.log('Event captured', event.event_name, event)))
      .subscribe();
  }

  private eventFactory(eventName: string, metadata: any = {}): UserEvent {
    return {
      user_id: this.meService.user()?.id ?? '',
      tenant_id: window.localStorage.getItem('tenant_id'),
      location: window.location.href,
      created_at: new Date().toLocaleString(),
      event_name: eventName as UserEvent['event_name'],
      user_agent: navigator.userAgent,
      metadata,
    };
  }

  private detectWindowSizeChanges() {
    const threshold = 400;
    let lastHeight = window.outerHeight;
    let lastWidth = window.outerWidth;

    fromEvent(window, 'resize')
      .pipe(
        tap(() => {
          const currentHeight = window.outerHeight;
          const currentWidth = window.outerWidth;

          if (Math.abs(currentHeight - lastHeight) > threshold || Math.abs(currentWidth - lastWidth) > threshold) {
            const consoleEvent = this.eventFactory('WINDOW_SIZE_CHANGE');
            this.notify(consoleEvent);
          }

          lastHeight = currentHeight;
          lastWidth = currentWidth;
        }),
      )
      .subscribe();
  }

  private detectCopy() {
    fromEvent<ClipboardEvent>(document, 'copy')
      .pipe(
        tap(async () => {
          try {
            const text = (await navigator.clipboard.readText()).replace(/[\r\n\t]+/g, ' ').trim();
            const metadata = text ? { context: text } : { error: 'No text copied' };
            const copyEvent = this.eventFactory('COPY', metadata);
            this.notify(copyEvent);
          } catch (error) {
            console.error('Error al leer el portapapeles:', error);
          }
        }),
      )
      .subscribe();
  }

  private detectPrint() {
    fromEvent(window, 'beforeprint')
      .pipe(
        tap(() => {
          const printContent = document.body.innerText.replace(/[\r\n\t]+/g, ' ').trim();
          const printEvent = this.eventFactory('PRINT', { content: printContent });
          this.notify(printEvent);
        }),
      )
      .subscribe();
  }

  public notifyNoAccess(url: string) {
    this.notify(this.eventFactory('UNAUTHORIZED_ACCESS', { url }));
  }
}
