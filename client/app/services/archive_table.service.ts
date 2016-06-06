import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as PouchDB from 'pouchdb';

import { NotesTable } from './notes_table';

export var ARCHIVE_NOTES_TABLES: NotesTable[] = [];

let localDB = new PouchDB('archive_notes_table');
let orderDB = new PouchDB('archive_notes_order');

@Injectable()
export class ArchiveNotesTableService {
  private archive_notes_tables_source = new BehaviorSubject<NotesTable[]>([]);
  archive_notes_tables$ = this.archive_notes_tables_source.asObservable();
  localDB = localDB;
  order = orderDB;
  constructor() {}
    
  getNotes() {
    var docs = this.localDB.allDocs({
      include_docs: true
    });
    return docs;
  }
  
  saveNote(note) {
    return this.localDB.put(note);
  }
  
  deleteNote(note) {
    return this.localDB.remove(note);
  }
  
  updateNote(note) {
    return this.localDB.put(note);
  }
  
  getOrder(order) {
    var docs = this.order.allDocs({
      include_docs: true
    });
    return docs;
  }
  
  saveOrder(order) {
    return this.order.put(order);
  }
}
