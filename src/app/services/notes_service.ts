import { Injectable }       from '@angular/core';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import * as PouchDB         from 'pouchdb';

import { NotesTable }       from './notes_table';
import { PushNotificationsService } from 'angular2-notifications';

export var NOTES_TABLES: NotesTable[] = [];

let localDB = {
  notes             : new PouchDB('notes_table'),
  notesOrder        : new PouchDB('notes_order_table'),
  archiveNotes      : new PouchDB('archive_notes_table'),
  archiveNotesOrder : new PouchDB('archive_notes_order'),
  binNotes          : new PouchDB('bin_notes_table')
}

@Injectable()
export class NotesTableService {
  notes_tables_source = new BehaviorSubject<NotesTable[]>([]);
  notes_tables$ = this.notes_tables_source.asObservable();
  reminderTable: any = {
    notes: [],
    archiveNotes: []
  };
  audio: any;

  constructor(private _pushNotifications: PushNotificationsService) {
    this._pushNotifications.requestPermission();
    this.audio = new Audio('sound/notification.mp3');
  }

  getNotes(schema: string) {
    var docs = localDB[schema].allDocs({
      include_docs: true
    });
    return docs;
  }

  saveNote(schema: string, note: any) {
    return localDB[schema].put(note);
  }

  deleteNote(schema: string, note: any) {
    return localDB[schema].remove(note);
  }

  updateNote(schema: string, note: any) {
    return localDB[schema].put(note);
  }

  getOrder(schema: string, order: any) {
    var docs = order[schema].allDocs({
      include_docs: true
    });
    return docs;
  }

  saveOrder(schema: string, order: any) {
    return order[schema].put(order);
  }

  updateReminderTable(schema: string) {
    this.getNotes(schema).then(
      alldoc => {
        let rows = alldoc.rows;
        this.reminderTable[schema] = [];
        rows.forEach(row => {
          if (row.doc.reminder) {
            this.reminderTable[schema].push(row);
          }
        });
      });
  }

  reminderTickStart() {
    setInterval(() => {
      this.checkForReminder();
    }, 60000);
  }

  checkForReminder() {
    let todayDate = new Date();
    this.reminderTable.notes.forEach(row => {
      this.checkForReminderRepeatation(row, todayDate, 'notes');
    });
    this.reminderTable.archiveNotes.forEach(row => {
      this.checkForReminderRepeatation(row, todayDate, 'archiveNotes');
    });
  }

  checkForReminderRepeatation(row, todayDate, schema) {
    let reminderDate = new Date(row.doc.reminder.date);
    let repeatText = row.doc.reminder.repeat;
      if (repeatText === 'doesnotrepeat') {
        if (todayDate.getFullYear() === reminderDate.getFullYear() &&
            todayDate.getMonth() === reminderDate.getMonth() &&
            todayDate.getDate() === reminderDate.getDate() &&
            todayDate.getHours() === reminderDate.getHours() &&
            todayDate.getMinutes() === reminderDate.getMinutes())
            {
              this.pushNotification(row);
            }
      } else if (repeatText === 'daily') {
        if (todayDate.getHours() === reminderDate.getHours() &&
            todayDate.getMinutes() === reminderDate.getMinutes())
            {
                this.pushNotification(row);
            }
      } else if (repeatText === 'weekly') {
        if (todayDate.getDay() === reminderDate.getDay() &&
            todayDate.getHours() === reminderDate.getHours() &&
            todayDate.getMinutes() === reminderDate.getMinutes())
            {
                this.pushNotification(row);
            }
      } else if (repeatText === 'monthly') {
        if (todayDate.getDate() === reminderDate.getDate() &&
            todayDate.getHours() === reminderDate.getHours() &&
            todayDate.getMinutes() === reminderDate.getMinutes())
            {
              this.pushNotification(row);
            }
      } else if (repeatText === 'yearly') {
        if (todayDate.getMonth() === reminderDate.getMonth() &&
            todayDate.getDate() === reminderDate.getDate() &&
            todayDate.getHours() === reminderDate.getHours() &&
            todayDate.getMinutes() === reminderDate.getMinutes())
            {
              this.pushNotification(row);
            }
      }
  }

  pushNotification(note) {
    this.audio.play();
    this._pushNotifications.create(note.doc.title, {body: note.doc.note, icon: 'images/preserver_small.png'}).subscribe(
      res => {},
      err => {}
    );
  }
}
