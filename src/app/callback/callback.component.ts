import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CallbackService } from './callback.service';
import { Observable } from 'rxjs';
import { MatRadioChange } from '@angular/material/radio';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { tap, map } from 'rxjs/operators';
import { RepresentanteService } from '../cementerio/representante/service/representante.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PDFClass } from '../utilidades/pdf';
import { HttpClient } from '@angular/common/http';
import { EstadoCuentaH } from '../cementerio/representante/model/estadoCuentaR';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css'],
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
export class CallbackComponent implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = ['nombre', 'cedula'];
  displayedColumnsEC: string[] = ['fecha', 'sector', 'descripcion', 'cargos', 'abonos']; //'select',

  dataSource: MatTableDataSource<any>;

  condicion: string = "1";
  parametro: any = "";
  step: number = 0;

  representante: any;

  locale: string;

  representantes$: Observable<any>;
  estadoCuenta$: Observable<any>;
  estadoCunta: EstadoCuentaH[];

  pdf: PDFClass;

  private _translate;

  constructor(
    private http: HttpClient,
    private router: Router,
    private translate: TranslateService,
    private apiCallback: CallbackService,
    private apiRepresentante: RepresentanteService,
    private cdRef: ChangeDetectorRef) {
      this.pdf = new PDFClass(http);
    }

  ngOnInit(): void {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  nuevaConsulta = () => window.location.reload();

  initLogin = () => this.router.navigate(["si-admin"]);

  cambioCondicion = (event: MatRadioChange) => this.parametro = "";

  buscarRepresentante = () => {
    if(this.parametro === "") {
      return;
    }
    this.step = 1;
    if(this.condicion === "2") {
      this.representantes$ = this.apiCallback.listarRepresentantesNombre(this.parametro);
    }
    if(this.condicion === "1") {
      this.representantes$ = this.apiCallback.listarRepresentantesCI(this.parametro);
    }
  }

  verEstadoCuenta = (row: any) => {
    this.step = 2;
    this.representante = row;
    this.estadoCuenta$ = this.apiRepresentante.obtenerEstadoCuentaRepresentante(row.id)
    .pipe(
      map((value: any) => value.ok? value.data:[]),
      tap((value: EstadoCuentaH[]) => this.estadoCunta = value)
    )
  }

  comprobante = () => {

    this.pdf.jojo(this.procesarDatosImprimir(this.estadoCunta), 'print', {
      nombre: 'Consulta externa',
      representante: this.representante?.nombre,
      cedula: this.representante?.cedula,
      tipo: 'Comprobante',
      descripcion: 'Estado de cuenta',
      codigo: '--- --- - ---'
    }, 'abonos_y_cargos')
  }

  private procesarDatosImprimir = (data: EstadoCuentaH[]) =>
    data.map((x: EstadoCuentaH) => {
      return {
        fecha: x.fecha,
        lugar: x.tipo,
        motivo: x.descripcion,
        sector: x.sector,
        descripcion: x.pago,
        estado_cuenta: x.estado_cuenta === 'deuda' ? 'cargo' : 'abono',
        cantidad: x.cantidad
      }
    })
}
