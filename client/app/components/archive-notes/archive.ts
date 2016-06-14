import {Component, Directive, OnInit} from '@angular/core';

import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

import {Dragula} from '../../directives/dragula';
import {DragulaService} from '../../providers/dragula';
import { FluidHeightDirective } from '../../directives/fluid-height';

import { NotesTable } from '../../services/notes_table';
import { NotesTableService } from '../../services/notes_table.service';
import { ArchiveNotesTableService } from '../../services/archive_table.service';

import { Spinner } from '../spinner/spinner';

const template: string = require("./archive.html");

@Component({
  selector: 'archive',
  template: template,
  providers: [DragulaService, ArchiveNotesTableService, NotesTableService],
  directives: [Dragula, FluidHeightDirective, Spinner]
})
export class Archive{
  public notes: any;
  public draft: any;
  public spinner: boolean = true;
  inputFocusClass: boolean = false;

  notes_table = NOTES_TABLE;
  subscription:Subscription;
  
  constructor(private dragulaService: DragulaService, private _notesService: NotesTableService, private _archiveNotesService: ArchiveNotesTableService) {
    this.notes = [];
    this.draft = {};
    dragulaService.dropModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
    dragulaService.drop.subscribe((value) => {
      this.onDrop(value.slice(1));
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

  _setInputFocus(isFocus:boolean) {
    this.inputFocusClass = isFocus;
  }
  
  private onDropModel(args) {
    let [el, target, source] = args;
    // do something else
  }

  private onRemoveModel(args) {
    let [el, source] = args;
    // do something else
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
        this.notes = this.notes_table;
        this.spinner = false;   
      },
      err => {
        this.spinner = false;        
      }
    );
  }
  
  saveNote(e) {
    if (_.trim(this.draft.title) || _.trim(this.draft.note)) {
      this.draft._id = 'note_' + Math.floor(Date.now() / 1000);
      this.draft.color = "label-info";
      this._archiveNotesService.saveNote(this.draft)
        .then(res => {
          this.draft = {};
          this.inputFocusClass = false;         
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
    } else {
      this.inputFocusClass = false;
    }
  }
  
  deleteNote(note) {
    this._archiveNotesService.deleteNote(note)
      .then(res => {          
        this.refreshNotesTables();
      }, err => {
        console.log("Error", err);
      });
  }
  
  setNoteColor(color, note) {
    this._archiveNotesService.setNoteColor(color, note)
      .then(res => {          
        console.log(res);
        this.refreshNotesTables();
      }, err => {
        console.log("Error", err);
      });
  }
  
   unArchive(note) {
    this._archiveNotesService.deleteNote(note)
      .then(res => {          
        this.refreshNotesTables();
      }, err => {
        console.log("Error", err);
      });
    let archive_note = note;
    delete archive_note.doc._rev;
    this._notesService.saveNote(archive_note.doc)
      .then(res => {
        
      }, err => {
        
      });
  }
}

let NOTES_TABLE: NotesTable[] = []