import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepresentanteService } from './service/representante.service';
import { AppRoutingModule } from '../../app-routing.module';
import { AngularModule } from '../../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RepresentanteComponent } from './representante/representante.component';
import { DeudasComponent } from './deudas/deudas.component';
import { EstadoCuentaComponent } from './estado-cuenta/estado-cuenta.component';
import { PagosComponent } from './pagos/pagos.component';
import { RepresentanteInformacionComponent } from './representante-informacion/representante-informacion.component';

@NgModule({
  declarations: [
    RepresentanteComponent,
    DeudasComponent,
    EstadoCuentaComponent,
    PagosComponent,
    RepresentanteInformacionComponent
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
    RepresentanteService
  ]
})
export class RepresentanteModule { }