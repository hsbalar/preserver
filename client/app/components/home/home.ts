import {Component, Directive, OnInit, ElementRef} from '@angular/core';

import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';

import {Dragula} from '../../directives/dragula';
import {DragulaService} from '../../providers/dragula';
import { FluidHeightDirective } from '../../directives/fluid-height';

import { NotesTable } from '../../services/notes_table';
import { NotesTableService } from '../../services/notes_table.service';
import { ArchiveNotesTableService } from '../../services/archive_table.service';

import { Spinner } from '../spinner/spinner';

const template: string = require("./home.html");
const style: string = require("./home.scss");

@Component({
  selector: 'home',
  styles: [style],
  template: template,
  providers: [DragulaService, NotesTableService, ArchiveNotesTableService],
  directives: [Dragula, FluidHeightDirective, Spinner]
})
export class Home {
  public notes: any;
  public draft: any;
  public editNoteDraft: any;
  public spinner: boolean = true;
  inputFocusClass: boolean = false;

  notes_table = NOTES_TABLE;
  subscription:Subscription;
  
  constructor(private elementRef: ElementRef, private dragulaService: DragulaService, private _notesService: NotesTableService, private _archiveService: ArchiveNotesTableService) {
    this.notes = [];
    this.draft = {};
    this.editNoteDraft = {};
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
    this.subscription = this._notesService.notes_tables$.subscribe(
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
    this._notesService.getNotes().then(
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
  
  saveNote(e, notetextarea) {
    if (_.trim(this.draft.title) || _.trim(this.draft.note)) {
      this.draft._id = 'note_' + Math.floor(Date.now() / 1000);
      this.draft.color = "label-default";
      this._notesService.saveNote(this.draft)
        .then(res => {
          this.draft = {};
          this.inputFocusClass = false;         
          this.refreshNotesTables();
          notetextarea.placeholder = "Write a note";
          notetextarea.style.height = "auto";      
          notetextarea.style.height = "48px";
        }, err => {
          this.draft = {};          
          console.log("Error", err);
          notetextarea.placeholder = "Write a note";
          notetextarea.style.height = "auto";      
          notetextarea.style.height = "48px";
        });
    } else {
      notetextarea.placeholder = "Write a note";
      notetextarea.style.height = "auto";      
      notetextarea.style.height = "48px";
      notetextarea.value = null;      
      this.inputFocusClass = false;
    }
  }
  
  deleteNote(note, noteRow) {
    noteRow.style.transition = "all 1s ease-in-out";
    noteRow.style.opacity = "0";
    setTimeout(() => {
      this._notesService.deleteNote(note)
        .then(res => {    
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
    }, 500);
  }
  
  setNoteColor(color, note) {
    if (note.doc.color != color) {
      note.doc.color = color;    
      this._notesService.updateNote(note)
        .then(res => {          
          console.log(res);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
    }
  }
  
  updateModalNote(note) {
    note.doc.note = this.editNoteDraft.note;
    note.doc.title = this.editNoteDraft.title;
    this._notesService.updateNote(note)
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

  makeArchive(note) {
    this._notesService.deleteNote(note)
      .then(res => {          
        this.refreshNotesTables();
      }, err => {
        console.log("Error", err);
      });
    let archive_note = note;
    delete archive_note.doc._rev;
    this._archiveService.saveNote(archive_note.doc)
      .then(res => {
        
      }, err => {
        
      });
  }
}

let NOTES_TABLE: NotesTable[] = []