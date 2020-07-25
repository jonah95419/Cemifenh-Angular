import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepresentanteComponent } from './menu/representante/representante.component';
import { RepresentanteInformacionComponent } from './menu/representante-informacion/representante-informacion.component';
import { SitiosComponent } from './menu/sitios/sitios.component';
import { PagosComponent } from './menu/pagos/pagos.component';
import { DeudasComponent } from './menu/deudas/deudas.component';
import { EstadoCuentaComponent } from './menu/estado-cuenta/estado-cuenta.component';
import { FallecidosComponent } from './menu/fallecidos/fallecidos.component';
import { AdministracionComponent } from './admin/administracion/administracion.component';
import { PreciosComponent } from './admin/precios/precios.component';
import { ImportacionComponent } from './admin/importacion/importacion.component';
import { ExportacionComponent } from './admin/exportacion/exportacion.component';
import { CopiaSeguridadComponent } from './admin/copia-seguridad/copia-seguridad.component';

const routes: Routes = [
  { path: '', redirectTo: '/representantes', pathMatch: 'full'},
  { path: 'representantes', component: RepresentanteComponent},
  { path: 'informacion-representante/:id', component: RepresentanteInformacionComponent,
    children: [
      { path: 'sitios', component: SitiosComponent},
      { path: 'pagos', component: PagosComponent},
      { path: 'deudas', component: DeudasComponent},
      { path: 'estado-cuenta', component: EstadoCuentaComponent},
      { path: 'fallecidos', component: FallecidosComponent},
    ]},
  { path: 'administracion', component: AdministracionComponent,
    children: [
      { path: 'lista-precios', component: PreciosComponent},
      { path: 'importar-datos', component: ImportacionComponent},
      { path: 'exportar-datos', component: ExportacionComponent},
      { path: 'copia-seguridad', component: CopiaSeguridadComponent},
    ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
