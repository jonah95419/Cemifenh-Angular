import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportesService } from '../service/reportes.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { startWith, switchMap, tap, map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { PDFClass } from '../../utilidades/pdf';
import { HttpClient } from '@angular/common/http';
import { ExcelService } from '../../utilidades/excel';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of, BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser';

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  columnsToDisplay: string[] = ['fecha', 'representante', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos', 'abonos'];
  data: any[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  desde: Date = new Date();
  hasta: Date = new Date();
  tipo: string = "abonos_y_cargos";
  desde$ = new BehaviorSubject(new Date());
  hasta$ = new BehaviorSubject(new Date());
  tipo$ = new BehaviorSubject("");

  pdf: PDFClass;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private excelService: ExcelService,
    private _snackBar: MatSnackBar,
    private titleService:Title,
    private apiReportes: ReportesService) {
    this.pdf = new PDFClass(http);
  }

  ngOnInit(): void {
    this.titleService.setTitle("SICDMIN - Reportes");
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.desde$, this.hasta$, this.tipo$, this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.apiReportes!.reporteTransacciones(
            this.tipo, this.getDate(this.desde), this.getDate(this.hasta), this.sort.direction == 'desc' ? 0 : 1, this.paginator.pageIndex);
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.cant;
          this.definirColumnas();
          return data.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return of([]);
        })
      ).subscribe((data: any) => this.data = data);
  }

  desdeValue = (desde: Date) => this.desde$.next(desde);
  hastaValue = (hasta: Date) => this.hasta$.next(hasta);
  tipoValue = (tipo: string) => this.tipo$.next(tipo);

  generatePdf = (action = 'open') => {
    this.pdf.jojo(this.data, action, {
      nombre: 'Jhonatan Stalin Salazar Hurtado',
      representante: '',
      cedula: '',
      tipo: 'Reporte, ' + this.tipo,
      descripcion: 'del ' + this.getDate(this.desde) + ' al ' + this.getDate(this.hasta),
      codigo: ''
    }, this.tipo)
  }

  getTotalAbonos = (): number => this.data
    ?.filter((x: any) => x.estado_cuenta === 'abono' && (new Date(x.fecha) > new Date('2001/01/01')))
    ?.map((x: any) => Number(x.cantidad))
    .reduce((a, b) => a + b, 0);

  getTotalCargos = (): number => this.data
    ?.filter((x: any) => x.estado_cuenta === 'cargo' && (new Date(x.fecha) > new Date('2001/01/01')))
    ?.map((x: any) => Number(x.cantidad))
    .reduce((a, b) => a + b, 0);

  generateExcel = () => this.excelService.generateExcel(this.data, this.tipo);

  private definirColumnas = ():void => {
    if (this.tipo === "abonos_y_cargos") {
      this.columnsToDisplay = ['fecha', 'representante', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos', 'abonos'];
    }
    if (this.tipo === "abonos") {
      this.columnsToDisplay = ['fecha', 'representante', 'lugar', 'motivo', 'sector', 'descripcion', 'abonos'];
    }
    if (this.tipo === "cargos") {
      this.columnsToDisplay = ['fecha', 'representante', 'lugar', 'motivo', 'sector', 'descripcion', 'cargos'];
    }
  }

  private getDate = (fecha: Date): string => {
    fecha = new Date(fecha);
    return fecha.getUTCFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate();
  }

}
