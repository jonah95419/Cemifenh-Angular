import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesComponent } from '../reportes/reportes/reportes.component';
import { AppRoutingModule } from '../app-routing.module';
import { AngularModule } from '../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { PrintService } from './service/print.service';
import { AppComponent } from '../app.component';
import { ReportesService } from './service/reportes.service';

@NgModule({
  declarations: [
    ReportesComponent,
    PrintLayoutComponent
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
  providers: [PrintService, ReportesService],
  bootstrap: [AppComponent]
})

export class ReportesModule { }
