import { Component, Directive, OnInit } from '@angular/core';
import { Route, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { Dragula } from '../../directives/dragula';
import { DragulaService } from '../../providers/dragula';

import { NotesTable } from '../../services/notes_table';

import { NotesTableService } from '../../services/notes_table.service';
import { BinNotesTableService } from '../../services/bin_table.service';
import { ArchiveNotesTableService } from '../../services/archive_table.service';

import { Spinner } from '../spinner/spinner';

const template: string = require("./bin.html");

@Component({
  selector: 'bin',
  template: template,
  providers: [BinNotesTableService, ArchiveNotesTableService, NotesTableService],
  directives: [Spinner, ROUTER_DIRECTIVES]
})
export class Bin {
  public notes: any;
  public orderNotes: any;
  public editNoteDraft: any;
  public spinner: boolean = true;
  public displayList: boolean = false; 
  public toDeleteNote: any;

  notes_table = NOTES_TABLE;
  subscription:Subscription;
  order:any;

  constructor(private _notesService: NotesTableService, private _archiveNotesService: ArchiveNotesTableService, private _binNotesService: BinNotesTableService) {
    this.notes = [];
    this.toDeleteNote = {};
  }
  
  ngOnInit() {
    this.subscription = this._binNotesService.bin_notes_tables$.subscribe(
      notes_table => this.notes_table = notes_table
    );
    this.refreshNotesTables();
  }

  refreshNotesTables() {
    this._binNotesService.getNotes().then(
      alldoc => {
        this.notes_table = alldoc.rows;
        this.notes = this.notes_table;
        this.spinner = false;
      },
      err => {
        this.spinner = false;        
      }
    );
  }
    
  deleteNote() {
    if (this.toDeleteNote) {
      setTimeout(() => {
        this._binNotesService.deleteNote(this.toDeleteNote.doc)
          .then(res => {
            this.refreshNotesTables();
            this.toDeleteNote = {};
          }, err => {
            console.log("Error", err);
          });
      }, 300);
    }
  }
  
  setDeleteNote(note) {
    this.toDeleteNote = note;
  }
  
  restoreNote(note, noteRow) {
    noteRow.style.transition = "all 1s ease-in-out";
    noteRow.style.opacity = "0";
    setTimeout(() => {
      this._binNotesService.deleteNote(note.doc)
        .then(res => {      
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let restore_note = note;
      delete restore_note.doc._rev;
      if (restore_note.doc.restore === "archive" ) {
        this._archiveNotesService.saveNote(restore_note.doc)
          .then(res => {
            this.updateArchiveNotesOrder(restore_note.doc);
          }, err => {});
      } else if (restore_note.doc.restore === "note") {
        this._notesService.saveNote(restore_note.doc)
          .then(res => {
            this.updateNotesOrder(restore_note.doc);
          }, err => {});
      }
    }, 200);
  }
  
  displayTypeChange() {
    this.displayList = this.displayList ? false : true;
  }
  
  updateArchiveNotesOrder(note) {
    let newOrder = [];
    if (localStorage.getItem('archiveOrder')) {
      newOrder = JSON.parse(localStorage.getItem('archiveOrder'));
      newOrder.unshift(note._id);
    } else {
      newOrder.push(note._id);
    }
    localStorage.setItem("archiveOrder", JSON.stringify(newOrder));
  }
  
  updateNotesOrder(draft) {
    let newOrder = [];
    if (localStorage.getItem('order')) {
      newOrder = JSON.parse(localStorage.getItem('order'));
      newOrder.unshift(draft._id);
    } else {
      newOrder.push(draft._id);
    }
    localStorage.setItem("order", JSON.stringify(newOrder));
  }
}

let NOTES_TABLE: NotesTable[] = []

