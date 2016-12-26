import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as PouchDB from 'pouchdb';

import { NotesTable } from './notes_table';

export var ARCHIVE_NOTES_TABLES: NotesTable[] = [];

let localDB = new PouchDB('bin_notes_table');

@Injectable()
export class BinNotesTableService {
  private bin_notes_tables_source = new BehaviorSubject<NotesTable[]>([]);
  bin_notes_tables$ = this.bin_notes_tables_source.asObservable();
  localDB = localDB;

  constructor() {}

  getNotes() {
    var docs = this.localDB.allDocs({
      include_docs: true
    });
    return docs;
  }

  saveNote(note: any) {
    return this.localDB.put(note);
  }

  deleteNote(note: any) {
    return this.localDB.remove(note);
  }

  updateNote(note: any) {
    return this.localDB.put(note);
  }
}
