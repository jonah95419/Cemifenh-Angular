import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Inicio2Component } from './inicio2/inicio2.component';
import { RepresentanteComponent } from './representante/representante.component';
import { HistorialComponent } from './historial/historial.component';
import { AuthGuard } from '../../core/guard/auth.guard';

const routes: Routes = [
  {
    path: '', component: Inicio2Component,
    children: [
      {
        path: 'representantes/:periodo', component: RepresentanteComponent, canActivate: [AuthGuard],
        children: [
          { path: 'historial/:id', component: HistorialComponent },
        ]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
