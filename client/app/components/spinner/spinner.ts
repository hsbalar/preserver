import {Component} from '@angular/core';

@Component({
  selector: 'spinner',
  template: `
    <div class="loaders-container">
      <div class="spinner">
        <div class="circle"></div>
      </div>
    </div>
  `,
  styles: [
    `.loaders-container {
        width: 100%;
        height: 100%;
      }
      .loaders-container .spinner {
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1; 
        margin-top: -20px;
        margin-left: -20px;  
      }
      .circle {
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        border-radius: 100%;
        border: 3px solid #bdc5c5;
        border-top-color: #009688;
        -webkit-animation: spin 1s infinite linear;
        animation: spin 1s infinite linear;
      }
      @-webkit-keyframes spin {
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes spin {
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }`
  ]
})
export class Spinner {
  constructor() {}
}
