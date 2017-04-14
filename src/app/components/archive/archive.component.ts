import { Component, OnInit }    from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { Subscription }         from 'rxjs/Subscription';

import { NotesTable,
         DragulaService,
         NotesTableService }    from '../../services';
import * as _                   from 'lodash';

@Component({
  selector: 'archive',
  templateUrl: './archive.component.html'
})
export class ArchiveComponent {

  public order:any;
  public notes: any;
  public orderNotes: any;
  public editNoteDraft: any;
  public notificationOptions: any;
  public spinner: boolean = true;
  public displayList: boolean = false;
  public emptyHtmlMsg: boolean = false;

  public notes_table = NOTES_TABLE;
  public subscription: Subscription;

  constructor (
      private dragulaService: DragulaService,
      private _notesService: NotesTableService,
      private _notificationsService: NotificationsService
    ) {
    this.notes = [];
    this.editNoteDraft = {};
    this.order = [];
    this.orderNotes = [];
    this.notificationOptions = {
      timeOut: 2000,
      lastOnBottom: true,
      clickToClose: true,
      showProgressBar: false,
      pauseOnHover: true,
      preventDuplicates: false,
      theClass: "notes-notifications archive",
      rtl: false
    };

    dragulaService.dropModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
    this.displayList = localStorage.getItem("displayArchiveTypeList") == 'true' ? true : false;
  }

  ngOnInit() {
    this.subscription = this._notesService.notes_tables$.subscribe(
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshNotesTables() {
    this._notesService.getNotes('archiveNotes').then(
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

  deleteNote(note, noteRow) {
    noteRow.className += this.displayList ? " animated bounceOutRight" : " animated zoomOut";
    setTimeout(() => {
      this._notesService.deleteNote('archiveNotes', note.doc)
        .then(res => {
          this._notificationsService.success("Done", "Note moved to Recycle Bin");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let binNote = note.doc;
      delete binNote._rev;
      this._notesService.saveNote('binNotes', binNote);
    }, 150);
  }

  setNoteColor(color, note) {
    if (note.doc.color != color) {
      note.doc.color = color;
      this._notesService.updateNote('archiveNotes', note.doc)
        .then(res => {
          this.refreshNotesTables();
        });
    }
  }

  updateModalNote(note) {
    note.doc.note = this.editNoteDraft.note;
    note.doc.title = this.editNoteDraft.title;
    this._notesService.updateNote('archiveNotes', note.doc)
      .then(res => {
        this.editNoteDraft = {};
        this.refreshNotesTables();
      }, err => {
        this.editNoteDraft = {};
      });
  }

  editModalNoteClick(note) {
    this.editNoteDraft.title = note.doc.title;
    this.editNoteDraft.note = note.doc.note;
  }

  unArchive(note, noteRow) {
    noteRow.className += this.displayList ? " animated bounceOutLeft" : " animated flipOutY";
    setTimeout(() => {
      this._notesService.deleteNote('archiveNotes', note.doc)
        .then(res => {
          this._notificationsService.success("Done", "Note unarchived");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        });
      let archive_note = note;
      delete archive_note.doc._rev;
      archive_note.doc.restore = "note";
      this._notesService.saveNote('notes', archive_note.doc)
        .then(res => {
          this.updateNotesOrder(archive_note.doc);
        });
    }, 100);
  }

  displayTypeChange() {
    this.displayList = this.displayList ? false : true;
    localStorage.setItem("displayArchiveTypeList", String(this.displayList));
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
