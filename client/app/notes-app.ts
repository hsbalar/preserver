import {Component} from '@angular/core';
import {Route, RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {RouteActive} from './directives/route-active';

import {Home} from './components/home/home';
import {Archive} from './components/archive-notes/archive';
import {Bin} from './components/bin/bin';

const template: string = require("./notes-app.html");

@Component({
  selector: 'notes-app',
  providers: [],
  template: template,
  directives: [RouteActive, ROUTER_DIRECTIVES],
  pipes: []
})
@RouteConfig([
  new Route({ path: '/home', component: Home, name: 'Home', useAsDefault: true }),
  new Route({ path: '/archive', component: Archive, name: 'Archive' }),
  new Route({ path: '/bin', component: Bin, name: 'Bin' })  
])
export class NotesApp {

  constructor() { }

}
