import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router-deprecated';

const template: string = require("./about.html");
const style: string = require("./about.scss");

@Component({
  selector: 'about',
  template: template,
  styles: [style],
  directives: [ROUTER_DIRECTIVES]
})
export class About {
  constructor() {}
}
