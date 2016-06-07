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

const template: string = require("./archive.html");

@Component({
  selector: 'archive',
  template: template,
  providers: [DragulaService, ArchiveNotesTableService, NotesTableService, BinNotesTableService],
  directives: [Dragula, Spinner, ROUTER_DIRECTIVES]
})
export class Archive {
public notes: any;
  public orderNotes: any;
  public editNoteDraft: any;
  public spinner: boolean = true;
  public displayList: boolean = false; 

  notes_table = NOTES_TABLE;
  subscription:Subscription;
  order:any;

  constructor(private dragulaService: DragulaService, private _notesService: NotesTableService, private _archiveNotesService: ArchiveNotesTableService, private _binNotesService: BinNotesTableService) {
    this.notes = [];
    this.editNoteDraft = {};
    this.order = [];
    this.orderNotes = [];
    dragulaService.dropModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
    dragulaService.drop.subscribe((value) => {
      this.onDrop(value);
    });
    dragulaService.removeModel.subscribe((value) => {
      this.onRemoveModel(value.slice(1));
    });
  }
  
  ngOnInit() {
    this.subscription = this._archiveNotesService.archive_notes_tables$.subscribe(
      notes_table => this.notes_table = notes_table
    );
    this.refreshNotesTables();
  }
  
  private onDropModel(args) {
    let [el, target, source] = args;
    
    let order = []; 
    this.notes.forEach(row => {
      order.push(row.doc._id);
    });

    localStorage.setItem('archiveOrder', JSON.stringify(order));
  }

  private onRemoveModel(args) {
    let [el, source] = args;
  }
  
  
  private onDrop(args) {
    let [e, el] = args;
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshNotesTables() {
    this._archiveNotesService.getNotes().then(
      alldoc => {
        this.notes_table = alldoc.rows;
        let testNotes = [];
        testNotes = this.notes_table;
        if (localStorage.getItem('archiveOrder')) {
          this.order = JSON.parse(localStorage.getItem('archiveOrder'));
        }
        this.notes = [];
        this.order.forEach(el => {
          testNotes.forEach(row => {
            if (String(row.doc._id) === String(el)) {
              this.notes.push(row);
            }
          });
        });
        this.spinner = false;
      },
      err => {
        this.spinner = false;        
      }
    );
  }
    
  deleteNote(note, noteRow) {
    noteRow.style.transition = "all 1s ease-in-out";
    noteRow.style.opacity = "0";
    setTimeout(() => {
      this._archiveNotesService.deleteNote(note.doc)
        .then(res => {
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let binNote = note.doc;
      delete binNote._rev;
      this._binNotesService.saveNote(binNote)
        .then(res => {

        }, err => {
          console.log("Error", err);
        });
    }, 300);
  }
  
  setNoteColor(color, note) {
    if (note.doc.color != color) {
      note.doc.color = color;    
      this._archiveNotesService.updateNote(note.doc)
        .then(res => {          
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
    }
  }
  
  updateModalNote(note) {
    note.doc.note = this.editNoteDraft.note;
    note.doc.title = this.editNoteDraft.title;
    this._archiveNotesService.updateNote(note.doc)
      .then(res => {
        this.editNoteDraft = {};
        this.refreshNotesTables();
      }, err => {
        this.editNoteDraft = {};        
        console.log("Error", err);
      });
  }
  
  editModalNoteClick(note) {
    this.editNoteDraft.title = note.doc.title;
    this.editNoteDraft.note = note.doc.note;         
  }

  unArchive(note, noteRow) {
    noteRow.style.transition = "all 1s ease-in-out";
    noteRow.style.opacity = "0";
    setTimeout(() => {
      this._archiveNotesService.deleteNote(note.doc)
        .then(res => {      
          this.deleteFromOrder(note);    
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let archive_note = note;
      delete archive_note.doc._rev;
      archive_note.doc.restore = "note";
      this._notesService.saveNote(archive_note.doc)
        .then(res => {
          this.updateNotesOrder(archive_note.doc);
        }, err => {});
    }, 300);
  }
  
  displayTypeChange() {
    this.displayList = this.displayList ? false : true;
  }
  
  deleteFromOrder(note) {
    let index = this.order.indexOf(this.order.filter(row => {
      return String(row) === String(note.doc._id);
    })[0]);
    if (index !== -1) {
      this.order.splice(index, 1);
      localStorage.setItem('archiveOrder', JSON.stringify(this.order));
    }
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

