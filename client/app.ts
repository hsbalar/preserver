import './assets/styles/app.scss';
import './assets/styles/main.scss';

import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { environment } from './app/environment';

import {NotesApp} from './app/notes-app';

if (environment.production) {
  enableProdMode();
}

bootstrap(NotesApp, [ROUTER_PROVIDERS])
  .catch(err => console.error(err));
