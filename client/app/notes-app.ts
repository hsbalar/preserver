import {Component, ViewEncapsulation} from '@angular/core';
import {Route, RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {RouteActive} from './directives/route-active';

import {Home} from './components/home/home';
import {Archive} from './components/archive-notes/archive';
import {Bin} from './components/bin/bin';
import {About} from './components/about/about';

const template: string = require("./notes-app.html");

@Component({
  selector: 'notes-app',
  providers: [],
  template: template,
  directives: [RouteActive, ROUTER_DIRECTIVES],
  pipes: [],
  encapsulation: ViewEncapsulation.None
})
@RouteConfig([
  new Route({ path: '/notes', component: Home, name: 'Home', useAsDefault: true }),
  new Route({ path: '/archive-notes', component: Archive, name: 'Archive' }),
  new Route({ path: '/recycle-bin', component: Bin, name: 'Bin' }),
  new Route({ path: '/about', component: About, name: 'About' })
])
export class NotesApp {

  constructor() { }

}
