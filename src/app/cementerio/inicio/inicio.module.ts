import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioComponent } from './inicio/inicio.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HistorialComponent } from './historial/historial.component';
import { RepresentanteComponent } from './representante/representante.component';
import { InicioRoutingModule } from './inicio-routing.module';
import { AngularModule } from '../../angular.module';

@NgModule({
  declarations: [InicioComponent, RepresentanteComponent, HistorialComponent],
  imports: [
    InicioRoutingModule,
    CommonModule,
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ],
  providers:[
  ]
})

export class InicioModule { }
