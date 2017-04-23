import { Component, OnInit }    from '@angular/core';
import { NotificationsService } from "angular2-notifications";
import { Subscription }         from 'rxjs/Subscription';

import { NotesTable,
         DragulaService,
         NotesTableService }    from '../../services';
import * as _                   from 'lodash';

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
  public toEditNote: any;
  public remindMe: any;
  public notificationOptions: any;
  public spinner: boolean = true;
  public displayList: boolean = false;
  public inputFocusClass: boolean = false;

  public notes_table = NOTES_TABLE;
  public subscription:Subscription;
  public emptyHtmlMsg: boolean = false;

  constructor (
      private _dragulaService: DragulaService,
      private _notesService: NotesTableService,
      private _notificationsService: NotificationsService
    ) {
    this.notes = [];
    this.draft = {};
    this.editNoteDraft = {};
    this.toEditNote = null;
    this.remindMe = {
      date: null,
      repeat: 'doesnotrepeat',
      noteToSet: null
    };
    this.order = [];
    this.orderNotes = [];
    this.notificationOptions = {
      timeOut: 2000,
      lastOnBottom: true,
      clickToClose: true,
      showProgressBar: false,
      pauseOnHover: true,
      preventDuplicates: false,
      theClass: "notes-notifications notes",
      rtl: false
    };
    _dragulaService.dropModel.subscribe((value: any) => {
      this.onDropModel(value.slice(1));
    });
    this.displayList = localStorage.getItem("displayNotesTypeList") == 'true' ? true : false;
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
    let order = [];
    this.notes.forEach(row => {
      order.push(row.doc._id);
    });
    localStorage.setItem("order", JSON.stringify(order));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshNotesTables() {
    this._notesService.getNotes('notes').then(
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
      this.draft.reminder = null;
      this.draft.restore = "note";
      this._notesService.saveNote('notes', this.draft)
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
      this._notesService.deleteNote('notes', note.doc)
        .then(res => {
          this._notificationsService.success("Done", "Note moved to Recycle Bin");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        });
      let binNote = note.doc;
      delete binNote._rev;
      this._notesService.saveNote('binNotes', binNote);
    }, 200);
  }

  setNoteColor(color, note) {
    if (note.doc.color != color) {
      note.doc.color = color;
      this._notesService.updateNote('notes', note.doc)
        .then(res => {
          this.refreshNotesTables();
        });
    }
  }

  setRemindMeNote(note) {
    this.remindMe.noteToSet = note;
  }

  setReminderClick() {
    if (this.remindMe.date) {
      this.remindMe.noteToSet.doc.reminder = {
        date: this.remindMe.date.toString(),
        repeat: this.remindMe.repeat
      };
      this._notesService.updateNote('notes', this.remindMe.noteToSet.doc)
        .then(res => {
          this.remindMe.date = null;
          this.remindMe.repeat = 'doesnotrepeat';
          this.remindMe.noteToSet = null;
          this._notesService.updateReminderTable('notes');
          this.refreshNotesTables();
          this._notificationsService.alert("Done", "Reminder set");
        }, err => {
          this.editNoteDraft = {};
        });
    }
  }

  removeReminder(note) {
    note.doc.reminder = null;
    this._notesService.updateNote('notes', note.doc);
    this._notesService.updateReminderTable('notes');
    this.refreshNotesTables();
  }

  updateModalNote(note) {
    note.doc.note = this.editNoteDraft.note;
    note.doc.title = this.editNoteDraft.title;
    this._notesService.updateNote('notes', note.doc)
      .then(res => {
        this.editNoteDraft = {};
        this.refreshNotesTables();
      }, err => {
        this.editNoteDraft = {};
      });
  }

  editModalNoteClick(note) {
    this.toEditNote = note;
    this.editNoteDraft.title = note.doc.title;
    this.editNoteDraft.note = note.doc.note;
  }

  makeArchive(note, noteRow) {
    noteRow.className += this.displayList ? " animated bounceOutLeft" : " animated flipOutY";
    setTimeout(() => {
      this._notesService.deleteNote('notes', note.doc)
        .then(res => {
          this._notificationsService.success("Done", "Note archived");
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        });
      let archive_note = note;
      delete archive_note.doc._rev;
      archive_note.doc.restore = "archive";
      this._notesService.saveNote('archiveNotes', archive_note.doc)
        .then(res => {
          this.updateArchiveOrder(archive_note.doc);
        });
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
    let newOrder: any = [];
    if (localStorage.getItem('order')) {
      newOrder = JSON.parse(localStorage.getItem('order'));
      newOrder.unshift(draft._id);
    } else {
      newOrder.push(draft._id);
    }
    localStorage.setItem("order", JSON.stringify(newOrder));
  }

  updateArchiveOrder(draft: any) {
    let newArchiveOrder: any = [];
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
