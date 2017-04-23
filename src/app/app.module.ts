import { NgModule }             from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { BrowserModule }        from '@angular/platform-browser';
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';
import { SimpleNotificationsModule,
         PushNotificationsModule }  from 'angular2-notifications';

import { AppRoutingModule }     from './app.routing';
import { AppComponent }         from './app.component';
import { Spinner,
         BinComponent,
         HomeComponent,
         AboutComponent,
         ArchiveComponent }     from './components';

import { Dragula }              from './directives/dragula';
import { FluidHeightDirective } from './directives/fluid-height';

import { NotesTable,
         DragulaService,
         NotesTableService }    from './services';

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    NguiDatetimePickerModule,
    PushNotificationsModule,
    SimpleNotificationsModule.forRoot()
  ],
  declarations: [
    Spinner,
    Dragula,
    AppComponent,
    BinComponent,
    HomeComponent,
    AboutComponent,
    ArchiveComponent,
    FluidHeightDirective
  ],
  providers: [ DragulaService, NotesTable, NotesTableService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
