import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as PouchDB from 'pouchdb';

import { NotesTable } from './notes_table';

export var ARCHIVE_NOTES_TABLES: NotesTable[] = [];

let localDB = new PouchDB('archive_notes_table');

@Injectable()
export class ArchiveNotesTableService {
  private archive_notes_tables_source = new BehaviorSubject<NotesTable[]>([]);
  archive_notes_tables$ = this.archive_notes_tables_source.asObservable();
  localDB = localDB;
    
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
    return this.localDB.remove(note.doc);
  }

  setNoteColor(color, note) {
    let mydoc = {
      _id: note.doc._id,
      _rev: note.doc._rev,
      title: note.doc.title,
      note: note.doc.note,
      label: note.doc.label,
      color: color
    };
    return this.localDB.put(mydoc);
  }
}
