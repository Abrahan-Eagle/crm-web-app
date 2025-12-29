import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig, withViewTransitions } from '@angular/router';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // {
    //   provide: ErrorHandler,
    //   useValue: Sentry.createErrorHandler(),
    // },
    // {
    //   provide: Sentry.TraceService,
    //   deps: [Router],
    // },
    // provideAppInitializer(() => {
    //   inject(Sentry.TraceService);
    // }),
    provideAuth0({
      domain: environment.AUTH0_DOMAIN,
      clientId: environment.AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: environment.AUTH0_AUDIENCE_DOMAIN,
        connection: environment.AUTH0_CONNECTION,
      },
      httpInterceptor: {
        allowedList: [
          `${environment.BASE_API}/*`,
          {
            uri: `https://${environment.AUTH0_DOMAIN}/api/v2/*`,
            tokenOptions: {
              authorizationParams: {
                audience: environment.AUTH0_AUDIENCE_DOMAIN,
              },
            },
          },
        ],
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([authHttpInterceptorFn])),
  ],
};
