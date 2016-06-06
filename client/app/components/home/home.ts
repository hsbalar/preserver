import {Component, Directive, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {Route, RouteConfig, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {Subscription} from 'rxjs/Subscription';
import * as _ from 'lodash';
import * as $ from 'jquery';

import {Dragula} from '../../directives/dragula';
import {DragulaService} from '../../providers/dragula';
import { FluidHeightDirective } from '../../directives/fluid-height';

import { NotesTable } from '../../services/notes_table';
import { NotesTableService } from '../../services/notes_table.service';
import { ArchiveNotesTableService } from '../../services/archive_table.service';

import { Spinner } from '../spinner/spinner';

const template: string = require("./home.html");

@Component({
  selector: 'Home',
  template: template,
  providers: [DragulaService, NotesTableService, ArchiveNotesTableService],
  directives: [Dragula, FluidHeightDirective, Spinner, ROUTER_DIRECTIVES]
})
export class Home implements AfterViewInit, OnInit{
  public notes: any;
  public orderNotes: any;
  public draft: any;
  public editNoteDraft: any;
  public spinner: boolean = true;
  public displayList: boolean = false; 
  inputFocusClass: boolean = false;

  notes_table = NOTES_TABLE;
  subscription:Subscription;
  order:any;
  constructor(private elementRef: ElementRef, private dragulaService: DragulaService, private _notesService: NotesTableService, private _archiveService: ArchiveNotesTableService) {
    this.notes = [];
    this.draft = {};
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
    this.subscription = this._notesService.notes_tables$.subscribe(
      notes_table => this.notes_table = notes_table
    );
    this.refreshNotesTables();
  }

  ngAfterViewInit() {
    //  function setModalMaxHeight(element) {
    //     this.$element     = $(element);  
    //     this.$content     = this.$element.find('.modal-content');
    //     var borderWidth   = this.$content.outerHeight() - this.$content.innerHeight();
    //     var dialogMargin  = $(window).width() < 768 ? 20 : 60;
    //     var contentHeight = $(window).height() - (dialogMargin + borderWidth);
    //     var headerHeight  = this.$element.find('.modal-header').outerHeight() || 0;
    //     var footerHeight  = this.$element.find('.modal-footer').outerHeight() || 0;
    //     var maxHeight     = contentHeight - (headerHeight + footerHeight);

    //     this.$content.css({
    //         'overflow': 'hidden'
    //     });
    //     this.$element
    //         .find('.modal-body').css({
    //         'max-height': maxHeight,
    //         'overflow-y': 'auto'
    //     });
    // }

    // $('.modal').on('show.bs.modal', function() {
    //     $(this).show();
    //     setModalMaxHeight(this);
    // });
    
    // $(window).resize(function() {
    //     if ($('.modal.in').length != 0) {
    //         setModalMaxHeight($('.modal.in'));
    //     }
    // });
  }
  
  _setInputFocus(isFocus:boolean) {
    this.inputFocusClass = isFocus;
  }
  
  private onDropModel(args) {
    let [el, target, source] = args;
    // do something else
    
    let order = []; 
    this.notes.forEach(row => {
      order.push(row.doc._id);
    });

    console.log(order)
    localStorage.setItem("order", JSON.stringify(order));
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
      this.draft.time = _.now();

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
    noteRow.style.transition = "all 1s ease-in-out";
    noteRow.style.opacity = "0";
    setTimeout(() => {
      this._notesService.deleteNote(note.doc)
        .then(res => {
          this.deleteFromOrder(note);
          this.refreshNotesTables();
        }, err => {
          console.log("Error", err);
        });
    }, 300);
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

  makeArchive(note) {
    this._notesService.deleteNote(note.doc)
      .then(res => {
        this.deleteFromOrder(note);
        this.refreshNotesTables();
      }, err => {
        console.log("Error", err);
      });
    let archive_note = note;
    delete archive_note.doc._rev;
    this._archiveService.saveNote(archive_note.doc)
      .then(res => {
        this.updateArchiveOrder(archive_note.doc);
      }, err => {
        
      });
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
  
  updateArchiveOrder(draft) {
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