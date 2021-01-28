import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepresentanteService } from './service/representante.service';
import { AngularModule } from '../../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EstadoCuentaComponent } from './estado-cuenta/estado-cuenta.component';
import { RepresentanteInformacionComponent } from './representante-informacion/representante-informacion.component';
import { DialogRegistroRepresentante } from './dialog/registro-representante/dialog-registro-representante';
import { DialogPagoExtra } from './dialog/registro-pago-extra/dialog-pago-extra';
import { DialogRegistroDeuda } from './dialog/registro-deuda/dialog-registro-deuda';
import { RepresentantesComponent } from './representantes/representantes.component';
import { RepresentanteRoutingModule } from './representante-routing.module';

@NgModule({
  declarations: [
    EstadoCuentaComponent,
    RepresentanteInformacionComponent,
    DialogRegistroRepresentante,
    DialogPagoExtra,
    DialogRegistroDeuda,
    RepresentantesComponent
  ],
  imports: [
    RepresentanteRoutingModule,
    CommonModule,
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ],
  // exports: [
  //   AngularModule,
  //   FormsModule,
  //   MatFormFieldModule,
  //   MatInputModule,
  // ],
  providers:[
    RepresentanteService
  ],
  entryComponents: [
    DialogRegistroRepresentante,
    DialogPagoExtra,
    DialogRegistroDeuda
  ]
})
export class RepresentanteModule { }
