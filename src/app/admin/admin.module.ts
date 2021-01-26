import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { AngularModule } from '../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ImportarService } from './service/importar.service';
import { SectorService } from './service/sector.service';
import { ValoresService } from './service/valores.service';
import { AdministracionComponent } from './administracion/administracion.component';
import { CopiaSeguridadComponent } from './copia-seguridad/copia-seguridad.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { PreciosComponent } from './precios/precios.component';
import { AdminRoutingModule } from './admin-routing.module';


@NgModule({
  declarations: [
    AdministracionComponent,
    CopiaSeguridadComponent,
    ImportacionComponent,
    PreciosComponent,
  ],
  imports: [
    AdminRoutingModule,
    CommonModule,
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ],
  exports: [
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  // providers:[
  //   ImportarService,
  //   SectorService,
  //   ValoresService
  // ]
})

export class AdminModule {

  constructor(@Optional() @SkipSelf() parentModule?: AdminModule) {

    if (parentModule) {
      console.log(parentModule);
      throw new Error(
        'AdminModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders<AdminModule> {
    return {
      ngModule: AdminModule,
      providers: [
        {provide: ImportarService },
        {provide: SectorService },
        {provide: ValoresService },
      ]
    };
  }
}
