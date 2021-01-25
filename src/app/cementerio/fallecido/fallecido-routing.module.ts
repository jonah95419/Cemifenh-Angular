import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FallecidosComponent } from './fallecidos/fallecidos.component';

const routes: Routes = [
  {
    path: '', component: FallecidosComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FallecidosRoutingModule { }
