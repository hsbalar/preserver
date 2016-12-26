import { NgModule }       from '@angular/core';
import { Routes,
         RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ArchiveComponent } from './components/archive-notes/archive.component';
import { BinComponent } from './components/bin/bin.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: '/notes', pathMatch: 'full'},
  { path: 'notes', component: HomeComponent },
  { path: 'archive-notes', component: ArchiveComponent },
  { path: 'recycle-bin', component: BinComponent },
  { path: 'about', component: AboutComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
