import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesComponent } from '../reportes/reportes/reportes.component';
import { AngularModule } from '../angular.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { PrintService } from './service/print.service';
import { AppComponent } from '../app.component';
import { ReportesService } from './service/reportes.service';
import { ExcelService } from '../utilidades/excel';
import { ReportesRoutingModule } from './reportes-routing.module';

@NgModule({
  declarations: [
    ReportesComponent,
    PrintLayoutComponent
  ],
  imports: [
    ReportesRoutingModule,
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
  providers: [PrintService, ReportesService, ExcelService],
  bootstrap: [AppComponent]
})

export class ReportesModule { }
