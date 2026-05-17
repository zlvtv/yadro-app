import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  UserOutline,
  TeamOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  EyeOutline,
  MailOutline,
  PhoneOutline,
  GlobalOutline,
  ArrowLeftOutline,
  SearchOutline,
  HomeOutline,
  EnvironmentOutline,
  BankOutline,
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';

registerLocaleData(ru);

const icons = [
  UserOutline,
  TeamOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  EyeOutline,
  MailOutline,
  PhoneOutline,
  GlobalOutline,
  ArrowLeftOutline,
  SearchOutline,
  HomeOutline,
  EnvironmentOutline,
  BankOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideAnimations(),
    provideNzI18n(ru_RU),
    provideNzIcons(icons),
    { provide: LOCALE_ID, useValue: 'ru' },
  ],
};
