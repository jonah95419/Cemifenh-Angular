import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FallecidosComponent } from './fallecidos/fallecidos.component';
import { AngularModule } from '../../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FallecidoService } from './service/fallecido.service';
import { FallecidosRoutingModule } from './fallecido-routing.module';

@NgModule({
  declarations: [FallecidosComponent],
  imports: [
    FallecidosRoutingModule,
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
    FallecidoService
  ]
})
export class FallecidoModule { }
