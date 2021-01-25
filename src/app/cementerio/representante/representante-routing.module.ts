import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepresentantesComponent } from './representantes/representantes.component';
import { RepresentanteInformacionComponent } from './representante-informacion/representante-informacion.component';
import { AuthGuard } from '../../core/guard/auth.guard';
import { EstadoCuentaComponent } from './estado-cuenta/estado-cuenta.component';

const routes: Routes = [
  {
    path: '',
    component: RepresentantesComponent,
    pathMatch: 'full',
    children: [
      {
        path: 'registro/:id',
        component: RepresentanteInformacionComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'sitios',
            loadChildren: () => import('../../cementerio/sitio/sitio.module').then(m => m.SitioModule),
            canActivate: [AuthGuard]
          },
          { path: 'estado-cuenta', component: EstadoCuentaComponent },
          {
            path: 'fallecidos',
            loadChildren: () => import('../../cementerio/fallecido/fallecido.module').then(m => m.FallecidoModule),
          },
        ]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepresentanteRoutingModule { }
