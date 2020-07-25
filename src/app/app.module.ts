import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { RepresentanteComponent } from './menu/representante/representante.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { RepresentanteInformacionComponent } from './menu/representante-informacion/representante-informacion.component';
import { SitiosComponent } from './menu/sitios/sitios.component';
import { PagosComponent } from './menu/pagos/pagos.component';
import { DeudasComponent } from './menu/deudas/deudas.component';
import { EstadoCuentaComponent } from './menu/estado-cuenta/estado-cuenta.component';
import { SitioDetallesComponent } from './menu/sitio-detalles/sitio-detalles.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {NgxAutoScrollModule} from "ngx-auto-scroll";

import {
  MatToolbarModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule,
  MatSelectModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDividerModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatProgressBarModule
} from '@angular/material';

import { registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es-EC';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';

import { FallecidosComponent } from './menu/fallecidos/fallecidos.component';
import { AdministracionComponent } from './admin/administracion/administracion.component';
import { PreciosComponent } from './admin/precios/precios.component';
import { ImportacionComponent } from './admin/importacion/importacion.component';
import { ExportacionComponent } from './admin/exportacion/exportacion.component';
import { CopiaSeguridadComponent } from './admin/copia-seguridad/copia-seguridad.component';
import { LineChart1Component } from './chart/line-chart1/line-chart1.component';
import { environment } from '../environments/environment';

registerLocaleData(localeES, 'es');
const AUTH_SERVER = environment.baseUrl
const config: SocketIoConfig = { url: AUTH_SERVER, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    CabeceraComponent,
    RepresentanteComponent,
    RepresentanteInformacionComponent,
    SitiosComponent,
    PagosComponent,
    DeudasComponent,
    EstadoCuentaComponent,
    SitioDetallesComponent,
    FallecidosComponent,
    AdministracionComponent,
    PreciosComponent,
    ImportacionComponent,
    ExportacionComponent,
    CopiaSeguridadComponent,
    LineChart1Component
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgxAutoScrollModule,
    SocketIoModule.forRoot(config),
    HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private translate: TranslateService){
    translate.addLangs(['es']);
    translate.setDefaultLang('es');
    translate.use('es');
 }
 }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
