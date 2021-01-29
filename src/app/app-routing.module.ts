import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CallbackComponent } from './public/callback.component';
import { AuthGuard } from './core/guard/auth.guard';
import { IngresoComponent } from './cementerio/ingreso/ingreso.component';

const routes: Routes = [
  { path: '', component: CallbackComponent, pathMatch: 'full' },
  {
    path: 'inicio',
    loadChildren: () => import('./cementerio/inicio/inicio.module').then(m => m.InicioModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'representantes',
    loadChildren: () => import('./cementerio/representante/representante.module').then(m => m.RepresentanteModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./cementerio/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'administracion',
    loadChildren: () => import('./cementerio/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: 'sicdmin', component: IngresoComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
