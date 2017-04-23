import { Component, AfterViewInit } from '@angular/core';
import { NotesTableService }        from './services';

@Component({
  selector: 'my-app',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements AfterViewInit {

  constructor(private _notesService: NotesTableService,) {
    this._notesService.updateReminderTable('notes');
    this._notesService.updateReminderTable('archiveNotes');
    this._notesService.reminderTickStart();
  }

  ngAfterViewInit() {
    $.material.init();
  }

}
