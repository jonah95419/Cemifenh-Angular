import { NgModule } from '@angular/core';
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


@NgModule({
  declarations: [
    AdministracionComponent,
    CopiaSeguridadComponent,
    ImportacionComponent,
    PreciosComponent,
  ],
  imports: [
    AppRoutingModule,
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
  providers:[
    ImportarService,
    SectorService,
    ValoresService
  ]
})

export class AdminModule { }
