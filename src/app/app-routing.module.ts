import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio/inicio.component';
import { HistorialComponent } from './inicio/historial/historial.component';
import { RepresentanteComponent } from './inicio/representante/representante.component';
import { IngresoComponent } from './user/ingreso/ingreso.component';
import { CallbackComponent } from './callback/callback.component';
import { AuthGuard } from './core/guard/auth.guard';

const routes: Routes = [
  //{ path: '', redirectTo: 'consultas', pathMatch: 'full' },
  { path: '', component: CallbackComponent, pathMatch: 'full' },
  {
    path: 'inicio', component: InicioComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'representantes/:periodo', component: RepresentanteComponent, canActivate: [AuthGuard],
        children: [
          { path: 'historial/:id', component: HistorialComponent },
        ]
      },
    ]
  },
  {
    path: 'representantes',
    loadChildren: () => import('./cementerio/representante/representante.module').then(m => m.RepresentanteModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'administracion',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: 'si-admin', component: IngresoComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
