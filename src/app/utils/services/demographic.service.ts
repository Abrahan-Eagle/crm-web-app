import { Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { Country } from '@/interfaces';
import { HttpService } from '@/utils/services';

@Injectable({
  providedIn: 'root',
})
export class DemographicService {
  STORAGE_KEY_STATES = 'demographic_storage_states';

  STORAGE_KEY_CITIES = 'demographic_storage_cities';

  DEMOGRAPHIC_BASE_API = 'https://countriesnow.space/api/v0.1';

  public allCountries = toSignal<Country>(this._allCountries());

  private countryStatesCache = signal<Map<string, Record<string, string>>>(new Map());

  private citiesCache = signal<Map<string, string[]>>(new Map());

  constructor(private readonly _http: HttpService) {
    const states = localStorage[this.STORAGE_KEY_STATES];
    if (states) {
      try {
        this.countryStatesCache.set(new Map(JSON.parse(states)));
      } catch (error) {
        console.info('Skipping rebuild of demographic cache...');
      }
    }

    const cities = localStorage[this.STORAGE_KEY_CITIES];
    if (cities) {
      try {
        this.citiesCache.set(new Map(JSON.parse(cities)));
      } catch (error) {
        console.info('Skipping rebuild of demographic cache...');
      }
    }
  }

  public _allCountries(): Observable<Country> {
    return this._http.get<Country>('./assets/demographics/all-countries.json');
  }

  public getStates(country: string): Observable<Record<string, string>> {
    if (this.countryStatesCache().has(country)) {
      return of(this.countryStatesCache().get(country)!);
    }

    if (country === 'Puerto Rico') {
      return this._http
        .get<Record<string, string>>(`assets/demographics/states-of-puerto-rico.json`)
        .pipe(tap((states) => this.countryStatesCache.update((cache) => cache.set(country, states))));
    }

    return this._http
      .post<{ data: { states: { name: string; state_code: string }[] } }>(
        `${this.DEMOGRAPHIC_BASE_API}/countries/states`,
        {
          body: { country },
        },
      )
      .pipe(
        map((response) => {
          const states: Record<string, string> = {};
          response.data.states.forEach((state) => (states[state.state_code] = state.name));
          return states;
        }),
        tap((states) => this.countryStatesCache.update((cache) => cache.set(country, states))),
        tap(() => this.syncLocalStorage()),
        catchError(() => of({})),
      );
  }

  public getCitiesOfState(country: string, state: string): Observable<string[]> {
    if (this.citiesCache().has(`${country}_${state}`)) {
      return of(this.citiesCache().get(`${country}_${state}`)!);
    }

    if (country === 'Puerto Rico') {
      return of([]);
    }

    return this._http
      .post<{ data: string[] }>(`${this.DEMOGRAPHIC_BASE_API}/countries/state/cities`, {
        body: { country, state },
      })
      .pipe(
        map((response) => response.data),
        tap((cities) => this.citiesCache.update((cache) => cache.set(`${country}_${state}`, cities))),
      );
  }

  private syncLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY_STATES, JSON.stringify(Array.from(this.countryStatesCache())));
    localStorage.setItem(this.STORAGE_KEY_CITIES, JSON.stringify(Array.from(this.citiesCache())));
  }
}
