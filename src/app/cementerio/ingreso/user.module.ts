import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IngresoComponent } from './ingreso.component';
import { CallbackComponent } from '../../public/callback.component';
import { AngularModule } from '../../angular.module';
import { CallbackService } from '../../public/callback.service';

@NgModule({
  declarations: [
    IngresoComponent,
    CallbackComponent
  ],
  imports: [
    CommonModule,
    AngularModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ],
  providers:[
    CallbackService
  ],
})

export class UserModule { }
