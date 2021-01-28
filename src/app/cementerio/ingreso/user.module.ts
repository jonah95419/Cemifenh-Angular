import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IngresoComponent } from './ingreso.component';
import { CallbackComponent } from '../../public/callback.component';
import { AppRoutingModule } from '../../app-routing.module';
import { AngularModule } from '../../angular.module';
import { CallbackService } from '../../public/callback.service';

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
  // exports: [
  //   AngularModule,
  //   FormsModule,
  //   MatFormFieldModule,
  //   MatInputModule,
  // ],
  providers:[
    CallbackService
  ],
})

export class UserModule { }
