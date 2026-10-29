import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { UrlSerializer, provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TrailingSlashUrlSerializer, routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    { provide: UrlSerializer, useClass: TrailingSlashUrlSerializer },
    provideClientHydration(withEventReplay()),
  ],
};
