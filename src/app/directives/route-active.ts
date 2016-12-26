import {Directive} from '@angular/core';
import {Router, RouteParams} from '@angular/router-deprecated';

@Directive({
  selector: '[routeActive]',
  inputs: ['routeParams: routeActive'],
  host: {
    '[class.active]': 'active'
  }
})
export class RouteActive {

  private params: any[];
  private active: boolean;

  constructor(private router: Router) {
    this.router.subscribe((value) => this.update());
  }

  set routeParams(changes: any) {
    this.params = changes;
  }

  private update() {
    this.active = this.params && this.router.isRouteActive(this.router.generate(this.params));
  }
}
