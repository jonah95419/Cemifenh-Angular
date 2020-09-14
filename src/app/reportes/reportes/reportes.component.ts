import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportesService } from '../service/reportes.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTable } from '@angular/material/table';
import { PDFClass } from '../../utilidades/pdf';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ReportesComponent implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  data_body = [];
  columnsToDisplay: string[] = [];

  reporteForm = this.fb.group({
    tipo: new FormControl('abonos_y_cargos', Validators.required),
    desde: new FormControl(new Date(), Validators.required),
    hasta: new FormControl(new Date(), Validators.required),
  })

  pdf: PDFClass;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private apiReportes: ReportesService) {
      this.pdf = new PDFClass(http);
  }

  ngOnInit(): void {
  }

  get reporteFormControl() {
    return this.reporteForm.controls;
  }

  submit = () => {
    if (this.reporteForm.valid) {
      if(this.reporteForm.value.tipo === "abonos_y_cargos") {
        this.columnsToDisplay= ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos', 'abonos'];
      }
      if(this.reporteForm.value.tipo === "abonos") {
        this.columnsToDisplay= ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'abonos'];
      }
      if(this.reporteForm.value.tipo === "cargos") {
        this.columnsToDisplay= ['fecha', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos'];
      }
      if(this.reporteForm.value.tipo === "sitios") {
        this.columnsToDisplay= ['num','representante', 'cedula', 'lugar', 'motivo', 'sector', 'fecha'];
      }
      this.apiReportes.reporteTransacciones(this.getDate(this.reporteForm.value.desde), this.getDate(this.reporteForm.value.hasta), this.reporteForm.value.tipo)
        .pipe(
          tap((x: any) => {
            if (x.ok) {
              this.data_body = x.data;
              this.table.renderRows();
            }
            else {this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");}
          })
        ).toPromise();
    }
  }

  generatePdf = (action = 'open') => {
    this.pdf.jojo(this.data_body, action, {
      nombre: 'Jhonatan Stalin Salazar Hurtado',
      representante: '',
      cedula: '',
      tipo: 'Reporte, ' + this.reporteForm.value.tipo,
      descripcion: 'del ' + this.getDate(this.reporteForm.value.desde) + ' al ' + this.getDate(this.reporteForm.value.hasta),
      codigo: ''
    }, this.reporteForm.value.tipo)
  }

  resetForm() {
    this.reporteForm.reset();
    this.reporteForm.controls.tipo.patchValue('abonos_y_cargos');
    this.reporteForm.controls.desde.patchValue(new Date());
    this.reporteForm.controls.hasta.patchValue(new Date());
  }

  getTotalAbonos = ():number => this.data_body
    ?.filter((x: any) => x.estado_cuenta === 'abono')
    ?.map((x: any) => Number(x.cantidad))
    .reduce((a, b) => a + b, 0);

  getTotalCargos = ():number => this.data_body
    ?.filter((x: any) => x.estado_cuenta === 'cargo')
    ?.map((x: any) => Number(x.cantidad))
    .reduce((a, b) => a + b, 0);

  private getDate = (fecha: Date): string => {
    fecha = new Date(fecha);
    return "" + fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
