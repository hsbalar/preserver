import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { HomeComponent } from './components/home/home.component';
import { ArchiveComponent } from './components/archive-notes/archive.component';
import { BinComponent } from './components/bin/bin.component';
import { AboutComponent } from './components/about/about.component';
import { Spinner } from './components/spinner/spinner';

import { NotificationsService, SimpleNotificationsModule } from "angular2-notifications";

import { Dragula } from './directives/dragula';
import { FluidHeightDirective } from './directives/fluid-height';
import { DragulaService } from './providers/dragula';
import { NotesTable } from './services/notes_table';
import { NotesTableService } from './services/notes_table.service';
import { BinNotesTableService } from './services/bin_table.service';
import { ArchiveNotesTableService } from './services/archive_table.service';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    SimpleNotificationsModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ArchiveComponent,
    BinComponent,
    AboutComponent,
    Spinner,
    Dragula,
    FluidHeightDirective
  ],
  providers: [ DragulaService, NotesTable, NotesTableService, BinNotesTableService, ArchiveNotesTableService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
