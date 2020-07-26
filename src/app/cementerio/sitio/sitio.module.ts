import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitiosComponent } from './sitios/sitios.component';
import { SitioDetallesComponent } from './sitio-detalles/sitio-detalles.component';
import { SitioService } from './service/sitio.service';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AngularModule } from 'src/app/angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [
    SitiosComponent,
    SitioDetallesComponent
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
    SitioService
  ]
})
export class SitioModule { }
