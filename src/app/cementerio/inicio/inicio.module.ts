import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioComponent, DialogActualizacion } from './inicio/inicio.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HistorialComponent } from './historial/historial.component';
import { RepresentanteComponent } from './representante/representante.component';
import { InicioRoutingModule } from './inicio-routing.module';
import { AngularModule } from '../../angular.module';
import { ActualizacionService } from '../admin/service/actualizacion.service';
import { Inicio2Component } from './inicio2/inicio2.component';
import { CallbackService } from '../../public/callback.service';

@NgModule({
  declarations: [InicioComponent, RepresentanteComponent, HistorialComponent, DialogActualizacion, Inicio2Component],
  imports: [
    InicioRoutingModule,
    CommonModule,
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ],
  providers: [
    ActualizacionService,
    CallbackService
  ],
  entryComponents: [
    DialogActualizacion
  ]
})

export class InicioModule { }
