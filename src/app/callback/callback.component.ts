import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
import { AuthenticationService } from '../core/service/authentication.service';
import { Title } from '@angular/platform-browser';
import { ResponseDeudaRepresentanteI, EstadoCuentaH } from '../cementerio/representante/model/deuda';

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
export class CallbackComponent implements OnInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = ['nombre', 'cedula'];
  displayedColumnsEC: string[] = ['fecha', 'sector', 'descripcion', 'cargos', 'abonos', 'pendientes']; //'select',

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
  private _authPromise;

  constructor(
    private http: HttpClient,
    private router: Router,
    private translate: TranslateService,
    private apiCallback: CallbackService,
    private apiRepresentante: RepresentanteService,
    private apiAuth: AuthenticationService,
    private titleService:Title,
    private cdRef: ChangeDetectorRef) {
    this.pdf = new PDFClass(http);
    this._authPromise = this.apiAuth.user$.subscribe(user => user ? this.apiAuth.logout() : null);
  }

  ngOnInit(): void {
    this.titleService.setTitle("SIC - GADPRSPL");
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang);
  }

  ngOnDestroy(): void {
    try {
      this._authPromise.unsubscribe();
      this._translate.unsubscribe();
    } catch (error) {
    }
  }

  nuevaConsulta = () => window.location.reload();

  initLogin = () => this.router.navigate(["sicdmin"]);

  cambioCondicion = (event: MatRadioChange) => this.parametro = "";

  buscarRepresentante = () => {
    if (this.parametro === "") return;

    this.step = 1;

    if (this.condicion === "2") {
      this.representantes$ = this.apiCallback.listarRepresentantesNombre(this.parametro);
    }
    if (this.condicion === "1") {
      this.representantes$ = this.apiCallback.listarRepresentantesCI(this.parametro);
    }
  }

  verEstadoCuenta = (row: any) => {
    this.step = 2;
    this.representante = row;
    this.estadoCuenta$ = this.apiRepresentante.obtenerEstadoCuentaRepresentante(row.id)
      .pipe(
        map((value: ResponseDeudaRepresentanteI) => value.ok ? value.data : []),
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
        estado_cuenta: x.estado_cuenta,
        cantidad: x.cantidad,
        pendiente: x.estado_cuenta == 'abono' ? '' : x.pendiente
      }
    })
}
