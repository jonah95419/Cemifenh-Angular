import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SitiosComponent } from './sitios/sitios.component';
import { SitioDetallesInformacionComponent } from './sitio-detalles-informacion/sitio-detalles-informacion.component';
import { SitioDetallesListaFallecidosComponent } from './sitio-detalles-lista-fallecidos/sitio-detalles-lista-fallecidos.component';
import { SitioDetallesEstadoCuentaComponent } from './sitio-detalles-estado-cuenta/sitio-detalles-estado-cuenta.component';

const routes: Routes = [
  {
    path: '',
    component: SitiosComponent,
    pathMatch: 'full',
    children: [
      { path: 'informacion', component: SitioDetallesInformacionComponent },
      { path: 'fallecidos', component: SitioDetallesListaFallecidosComponent },
      { path: 'estado-cuenta', component: SitioDetallesEstadoCuentaComponent },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SitioRoutingModule { }
