import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministracionComponent } from './administracion/administracion.component';
import { PreciosComponent } from './precios/precios.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { CopiaSeguridadComponent } from './copia-seguridad/copia-seguridad.component';
import { AuthGuard } from '../../core/guard/auth.guard';

const routes: Routes = [
  {
    path: '', component: AdministracionComponent,
    children: [
      { path: 'lista-valores', component: PreciosComponent, canActivate: [AuthGuard] },
      { path: 'importar-datos', component: ImportacionComponent, canActivate: [AuthGuard] },
      { path: 'copia-seguridad', component: CopiaSeguridadComponent, canActivate: [AuthGuard] },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
