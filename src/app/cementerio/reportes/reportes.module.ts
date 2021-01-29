import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesComponent } from '../reportes/reportes/reportes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { PrintService } from './service/print.service';
import { ReportesService } from './service/reportes.service';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ExcelService } from '../../utilidades/excel';
import { AppComponent } from '../../app.component';
import { AngularModule } from '../../angular.module';

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
  providers: [PrintService, ReportesService, ExcelService],
  bootstrap: [AppComponent]
})

export class ReportesModule { }
