import { Component, OnInit }    from '@angular/core';
import { NotificationsService } from "angular2-notifications";
import { Subscription }         from 'rxjs/Subscription';

import { NotesTable,
         NotesTableService,
         DragulaService }       from '../../services';
import * as _                   from 'lodash';

@Component({
  selector: 'bin',
  templateUrl: './bin.component.html',
})
export class BinComponent {

  public order:any;
  public notes: any;
  public orderNotes: any;
  public toDeleteNote: any;
  public editNoteDraft: any;
  public toDeleteNoteRow: any;
  public notificationOptions: any;
  public spinner: boolean = true;
  public displayList: boolean = false;
  public emptyHtmlMsg: boolean = false;

  public notes_table = NOTES_TABLE;
  public subscription: Subscription;

  constructor(
      private _notesService: NotesTableService,
      private _notificationsService: NotificationsService
    ) {
    this.notes = [];
    this.toDeleteNote = {};
    this.notificationOptions = {
      timeOut: 2000,
      lastOnBottom: true,
      clickToClose: true,
      showProgressBar: false,
      pauseOnHover: true,
      preventDuplicates: false,
      theClass: "notes-notifications bin",
      rtl: false
    };
    this.displayList = localStorage.getItem("displayBinTypeList") == 'true' ? true : false;
  }

  ngOnInit() {
    this.subscription = this._notesService.notes_tables$.subscribe(
      notes_table => this.notes_table = notes_table
    );
    this.refreshNotesTables();
  }

  refreshNotesTables() {
    this._notesService.getNotes('binNotes').then(
      alldoc => {
        this.notes_table = alldoc.rows;
        this.notes = this.notes_table;
        if (_.isEmpty(this.notes)) {
          this.emptyHtmlMsg = true;
        } else {
          this.emptyHtmlMsg = false;
        }
        this.spinner = false;
      },
      err => {
        this.spinner = false;
      }
    );
  }

  deleteNote() {
    if (this.toDeleteNote) {
      this.toDeleteNoteRow.className += this.displayList ? " animated bounceOutRight" : " animated zoomOut";
      setTimeout(() => {
        this._notesService.deleteNote('binNotes', this.toDeleteNote.doc)
          .then(res => {
            this._notificationsService.error("Done", "Note deleted forever");
            this.refreshNotesTables();
            this.toDeleteNote = {};
          });
      }, 200);
    }
  }

  setDeleteNote(note, noteRow) {
    this.toDeleteNote = note;
    this.toDeleteNoteRow = noteRow;
  }

  restoreNote(note, noteRow) {
    noteRow.className += this.displayList ? " animated bounceOutLeft" : " animated flipOutY";
    setTimeout(() => {
      this._notesService.deleteNote('binNotes', note.doc)
        .then(res => {
          this._notificationsService.success("Done", "Note restored");
          this.refreshNotesTables();
        });
      let restore_note = note;
      delete restore_note.doc._rev;
      if (restore_note.doc.restore === "archive" ) {
        this._notesService.saveNote('archiveNotes', restore_note.doc)
          .then(res => {
            this.updateArchiveNotesOrder(restore_note.doc);
          });
      } else if (restore_note.doc.restore === "note") {
        this._notesService.saveNote('notes', restore_note.doc)
          .then(res => {
            this.updateNotesOrder(restore_note.doc);
          });
      }
    }, 300);
  }

  displayTypeChange() {
    this.displayList = this.displayList ? false : true;
    localStorage.setItem("displayBinTypeList", String(this.displayList));
  }

  updateArchiveNotesOrder(note) {
    let newOrder: any = [];
    if (localStorage.getItem('archiveOrder')) {
      newOrder = JSON.parse(localStorage.getItem('archiveOrder'));
      newOrder.unshift(note._id);
    } else {
      newOrder.push(note._id);
    }
    localStorage.setItem("archiveOrder", JSON.stringify(newOrder));
  }

  updateNotesOrder(draft) {
    let newOrder: any = [];
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
