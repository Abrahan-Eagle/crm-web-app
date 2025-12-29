import { Injectable, signal } from '@angular/core';

import { Prospect } from '@/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProspectDetailsService {
  public readonly prospect = signal<Prospect | null>(null);

  public readonly leadId = signal<string | null>(null);
}
