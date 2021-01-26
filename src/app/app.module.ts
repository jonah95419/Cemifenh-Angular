import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { HttpClientModule } from '@angular/common/http';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { LocationStrategy, PathLocationStrategy, registerLocaleData } from '@angular/common';
import localeES from '@angular/common/locales/es-EC';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { FallecidoModule } from './cementerio/fallecido/fallecido.module';
import { RepresentanteModule } from './cementerio/representante/representante.module';
import { SitioModule } from './cementerio/sitio/sitio.module';
import { InicioModule } from './inicio/inicio.module';
import { ReportesModule } from './reportes/reportes.module';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';

registerLocaleData(localeES, 'es');

@NgModule({
  declarations: [
    AppComponent,
    CabeceraComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatMomentDateModule,
    FallecidoModule,
    RepresentanteModule,
    SitioModule,
    InicioModule,
    ReportesModule,
    UserModule,
    CoreModule,
    // AdminModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  bootstrap: [AppComponent],

})
export class AppModule {
  constructor(private translate: TranslateService) {
    translate.addLangs(['es']);
    translate.setDefaultLang('es');
    translate.use('es');
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
