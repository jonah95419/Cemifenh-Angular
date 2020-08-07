import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministracionComponent } from './admin/administracion/administracion.component';
import { PreciosComponent } from './admin/precios/precios.component';
import { ImportacionComponent } from './admin/importacion/importacion.component';
import { ExportacionComponent } from './admin/exportacion/exportacion.component';
import { CopiaSeguridadComponent } from './admin/copia-seguridad/copia-seguridad.component';
import { RepresentanteInformacionComponent } from './cementerio/representante/representante-informacion/representante-informacion.component';
import { SitiosComponent } from './cementerio/sitio/sitios/sitios.component';
import { PagosComponent } from './cementerio/representante/pagos/pagos.component';
import { DeudasComponent } from './cementerio/representante/deudas/deudas.component';
import { EstadoCuentaComponent } from './cementerio/representante/estado-cuenta/estado-cuenta.component';
import { FallecidosComponent } from './cementerio/fallecido/fallecidos/fallecidos.component';
import { InicioComponent } from './inicio/inicio/inicio.component';
import { HistorialComponent } from './inicio/historial/historial.component';
import { RepresentanteComponent } from './inicio/representante/representante.component';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full'},
  { path: 'inicio', component: InicioComponent,
  children: [
    { path: 'representantes/:periodo', component: RepresentanteComponent,
      children: [
        { path: 'historial/:id', component: HistorialComponent},
      ]
    },
  ]},
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
