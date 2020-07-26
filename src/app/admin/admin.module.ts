import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { AngularModule } from '../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { ImportarService } from './service/importar.service';
import { SectorService } from './service/sector.service';
import { ValoresService } from './service/valores.service';
import { AdministracionComponent } from './administracion/administracion.component';
import { CopiaSeguridadComponent } from './copia-seguridad/copia-seguridad.component';
import { ExportacionComponent } from './exportacion/exportacion.component';
import { ImportacionComponent } from './importacion/importacion.component';
import { PreciosComponent } from './precios/precios.component';
import { LineChart1Component } from '../chart/line-chart1/line-chart1.component';


@NgModule({
  declarations: [
    AdministracionComponent,
    CopiaSeguridadComponent,
    ExportacionComponent,
    ImportacionComponent,
    PreciosComponent,
    LineChart1Component
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
