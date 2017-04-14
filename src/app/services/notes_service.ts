import { Injectable }       from '@angular/core';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import * as PouchDB         from 'pouchdb';

import { NotesTable }       from './notes_table';

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

  constructor() {}

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
}
