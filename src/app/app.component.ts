import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'my-app',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit() {
    $.material.init();
  }

}
