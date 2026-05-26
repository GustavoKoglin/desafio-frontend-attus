import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideEnvironmentNgxMask()
  ]
};
