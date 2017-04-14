import { NgModule }       from '@angular/core';
import { Routes,
         RouterModule }   from '@angular/router';
import { BinComponent,
         HomeComponent,
         ArchiveComponent,
         AboutComponent } from './components';

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
