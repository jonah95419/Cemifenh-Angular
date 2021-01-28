import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministracionComponent } from './administracion/administracion.component';
import { PreciosComponent } from './precios/precios.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { CopiaSeguridadComponent } from './copia-seguridad/copia-seguridad.component';

const routes: Routes = [
  {
    path: '', component: AdministracionComponent,
    children: [
      { path: 'lista-valores', component: PreciosComponent },
      { path: 'importar-datos', component: ImportacionComponent },
      { path: 'copia-seguridad', component: CopiaSeguridadComponent },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
