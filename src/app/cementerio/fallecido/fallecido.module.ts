import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FallecidosComponent } from './fallecidos/fallecidos.component';
import { AppRoutingModule } from '../../app-routing.module';
import { AngularModule } from '../../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FallecidoService } from './service/fallecido.service';

@NgModule({
  declarations: [FallecidosComponent],
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
    FallecidoService
  ]
})
export class FallecidoModule { }
