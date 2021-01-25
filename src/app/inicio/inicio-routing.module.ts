import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { RepresentanteComponent } from './representante/representante.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { HistorialComponent } from './historial/historial.component';

const routes: Routes = [
  {
    path: '',
    component: InicioComponent,
    pathMatch: 'full',
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
