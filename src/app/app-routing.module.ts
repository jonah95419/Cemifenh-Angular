import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministracionComponent } from './admin/administracion/administracion.component';
import { PreciosComponent } from './admin/precios/precios.component';
import { ImportacionComponent } from './admin/importacion/importacion.component';
import { CopiaSeguridadComponent } from './admin/copia-seguridad/copia-seguridad.component';
import { RepresentanteInformacionComponent } from './cementerio/representante/representante-informacion/representante-informacion.component';
import { SitiosComponent } from './cementerio/sitio/sitios/sitios.component';
import { EstadoCuentaComponent } from './cementerio/representante/estado-cuenta/estado-cuenta.component';
import { FallecidosComponent } from './cementerio/fallecido/fallecidos/fallecidos.component';
import { InicioComponent } from './inicio/inicio/inicio.component';
import { HistorialComponent } from './inicio/historial/historial.component';
import { RepresentanteComponent } from './inicio/representante/representante.component';
import { RepresentantesComponent } from './cementerio/representante/representantes/representantes.component';
import { SitioDetallesInformacionComponent } from './cementerio/sitio/sitio-detalles-informacion/sitio-detalles-informacion.component';
import { SitioDetallesEstadoCuentaComponent } from './cementerio/sitio/sitio-detalles-estado-cuenta/sitio-detalles-estado-cuenta.component';
import { SitioDetallesListaFallecidosComponent } from './cementerio/sitio/sitio-detalles-lista-fallecidos/sitio-detalles-lista-fallecidos.component';
import { ReportesComponent } from './reportes/reportes/reportes.component';
import { InvoiceComponent } from './reportes/invoice/invoice.component';
import { PrintLayoutComponent } from './reportes/print-layout/print-layout.component';
import { IngresoComponent } from './user/ingreso/ingreso.component';
import { CallbackComponent } from './callback/callback.component';
import { SecureInnerPagesGuard } from './core/guard/secure-inner-pages.guard';
import { AuthGuard } from './core/guard/auth.guard';

const routes: Routes = [
  //{ path: '', redirectTo: 'consultas', pathMatch: 'full' },
  {path: '', component: CallbackComponent, pathMatch: 'full'},
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
    path: 'representantes', component: RepresentantesComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'registro/:id', component: RepresentanteInformacionComponent, canActivate: [AuthGuard],
        children: [
          {
            path: 'sitios', component: SitiosComponent, canActivate: [AuthGuard],
            children: [
              { path: 'informacion', component: SitioDetallesInformacionComponent },
              { path: 'fallecidos', component: SitioDetallesListaFallecidosComponent },
              { path: 'estado-cuenta', component: SitioDetallesEstadoCuentaComponent },
            ]
          },
          { path: 'estado-cuenta', component: EstadoCuentaComponent },
          { path: 'fallecidos', component: FallecidosComponent },
        ]
      },
    ]
  },
  {
    path: 'reportes', component: ReportesComponent, canActivate: [AuthGuard],
    children: [
      {
        path: 'print', outlet: 'print', component: PrintLayoutComponent,
        children: [
          { path: 'invoice/:invoiceIds', component: InvoiceComponent }
        ]
      }
    ]
  },
  {
    path: 'administracion', component: AdministracionComponent, canActivate: [AuthGuard],
    children: [
      { path: 'lista-valores', component: PreciosComponent },
      { path: 'importar-datos', component: ImportacionComponent },
      { path: 'copia-seguridad', component: CopiaSeguridadComponent },
    ]
  },
  { path: 'si-admin', component: IngresoComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
