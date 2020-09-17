import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngresoComponent } from './ingreso/ingreso.component';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularModule } from '../angular.module';
import { MatInputModule } from '@angular/material/input';
import { CallbackComponent } from '../callback/callback.component';
import { CallbackService } from '../callback/callback.service';

@NgModule({
  declarations: [
    IngresoComponent,
    CallbackComponent
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
    CallbackService
  ],
})

export class UserModule { }
