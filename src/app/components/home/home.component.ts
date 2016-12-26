import { Component, OnInit } from '@angular/core';
import { NotificationsService } from "angular2-notifications";

import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

import { DragulaService } from '../../providers/dragula';

import { NotesTable } from '../../services/notes_table';
import { NotesTableService } from '../../services/notes_table.service';
import { BinNotesTableService } from '../../services/bin_table.service';
import { ArchiveNotesTableService } from '../../services/archive_table.service';

@Component({
  selector: 'Home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public order:any;
  public notes: any;
  public draft: any;
  public orderNotes: any;
  public editNoteDraft: any;
  public notificationOptions: any;
  public spinner: boolean = true;
  public displayList: boolean = false;
  public inputFocusClass: boolean = false;

  public notes_table = NOTES_TABLE;
  public subscription:Subscription;
  public emptyHtmlMsg: boolean = false;

  constructor (
      private dragulaService: DragulaService,
      private _notesService: NotesTableService,
      private _archiveService: ArchiveNotesTableService,
      private _binService: BinNotesTableService,
      private _notificationsService: NotificationsService
    ) {
    this.notes = [];
    this.draft = {};
    this.editNoteDraft = {};
    this.order = [];
    this.orderNotes = [];
    this.notificationOptions = {
      timeOut: 3000,
      lastOnBottom: true,
      clickToClose: true,
      showProgressBar: false,
      pauseOnHover: true,
      preventDuplicates: false,
      theClass: "notes-notifications",
      rtl: true
    };
    dragulaService.drag.subscribe((value: any) => {
      this.onDrag(value.slice(1));
    });
    dragulaService.dropModel.subscribe((value: any) => {
      this.onDropModel(value.slice(1));
    });
    dragulaService.drop.subscribe((value: any) => {
      this.onDrop(value);
    });
    dragulaService.removeModel.subscribe((value: any) => {
      this.onRemoveModel(value.slice(1));
    });

    this.displayList = localStorage.getItem("displayNotesTypeList") == 'true' ? true : false;

  }


  private onDrag(args: any) {
    let [e, el] = args;
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

  private onDropModel(args: any) {
    let [el, target, source] = args;
    // do something else

    let order = [];
    this.notes.forEach(row => {
      order.push(row.doc._id);
    });

    localStorage.setItem("order", JSON.stringify(order));
  }

  private onRemoveModel(args: any) {
    let [el, source] = args;
    // do something else
  }

  private onDrop(args: any) {
    let [e, el] = args;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshNotesTables() {
    this._notesService.getNotes().then(
      alldoc => {
        this.notes_table = alldoc.rows;
        let testNotes = [];
        testNotes = this.notes_table;
        if (localStorage.getItem('order')) {
          this.order = JSON.parse(localStorage.getItem("order"));
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

  saveNote(e: Event, notetextarea: any) {
    if (_.trim(this.draft.title) || _.trim(this.draft.note)) {
      this.draft._id = 'note_' + Math.floor(Date.now() / 1000);
      this.draft.color = "label-default";
      this.draft.time = new Date().toISOString();
      this.draft.label = "";
      this.draft.restore = "note";
      this._notesService.saveNote(this.draft)
        .then(res => {
          notetextarea.placeholder = "Write a note";
          notetextarea.style.height = "auto";
          notetextarea.style.height = "48px";
          this.updateOrder(this.draft);
          this.inputFocusClass = false;
          this.draft = {};
          this.refreshNotesTables();
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
    noteRow.className += this.displayList ? " animated bounceOutRight" : " animated zoomOut";
    setTimeout(() => {
      this._notesService.deleteNote(note.doc)
        .then(res => {
          this._notificationsService.create("Done", "Note moved to Recycle Bin", "success");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let binNote = note.doc;
      delete binNote._rev;
      this._binService.saveNote(binNote)
        .then(res => {

        }, err => {
          console.log("Error", err);
        });
    }, 200);
  }

  setNoteColor(color, note) {
    if (note.doc.color != color) {
      note.doc.color = color;
      this._notesService.updateNote(note.doc)
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
    this._notesService.updateNote(note.doc)
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

  makeArchive(note, noteRow) {
    noteRow.className += this.displayList ? " animated bounceOutLeft" : " animated flipOutY";
    setTimeout(() => {
      this._notesService.deleteNote(note.doc)
        .then(res => {
          this._notificationsService.create("Done", "Note archived", "success");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
      let archive_note = note;
      delete archive_note.doc._rev;
      archive_note.doc.restore = "archive";
      this._archiveService.saveNote(archive_note.doc)
        .then(res => {
          this.updateArchiveOrder(archive_note.doc);
        }, err => {});
    }, 200);
  }

  displayTypeChange() {
    this.displayList = this.displayList ? false : true;
    localStorage.setItem("displayNotesTypeList", String(this.displayList));
  }

  deleteFromOrder(note) {
    let index = this.order.indexOf(this.order.filter(row => {
      return String(row) === String(note.doc._id);
    })[0]);
    if (index !== -1) {
      this.order.splice(index, 1);
      localStorage.setItem("order", JSON.stringify(this.order));
    }
  }

  updateOrder(draft) {
    let newOrder = [];
    if (localStorage.getItem('order')) {
      newOrder = JSON.parse(localStorage.getItem('order'));
      newOrder.unshift(draft._id);
    } else {
      newOrder.push(draft._id);
    }
    localStorage.setItem("order", JSON.stringify(newOrder));
  }

  updateArchiveOrder(draft: any) {
    let newArchiveOrder = [];
    if (localStorage.getItem('archiveOrder')) {
      newArchiveOrder = JSON.parse(localStorage.getItem('archiveOrder'));
      newArchiveOrder.unshift(draft._id);
    } else {
      newArchiveOrder.push(draft._id);
    }
    localStorage.setItem("archiveOrder", JSON.stringify(newArchiveOrder));
  }
}

let NOTES_TABLE: NotesTable[] = []
