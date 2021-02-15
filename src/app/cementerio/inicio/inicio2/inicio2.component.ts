import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChildren, QueryList, Inject } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { startWith, switchMap, map, catchError, tap } from 'rxjs/operators';
import { RepresentanteService } from '../../representante/service/representante.service';
import { RepresentanteI } from '../../representante/model/representante';
import { SitioI, ResponseSitioI, ResponseEstadoCuentaSitioI, EstadoCuentaI } from '../../sitio/model/sitio';
import { SitioService } from '../../sitio/service/sitio.service';
import { FallecidoService } from '../../fallecido/service/fallecido.service';
import { FallecidoI, ResponseFallecidoI } from '../../fallecido/model/fallecido';
import { ResponseDeudaRepresentanteI } from '../../representante/model/deuda';
import { MatTableDataSource } from '@angular/material/table';
import { DialogEstadoCuenta } from '../../sitio/dialog/editar-estado-cuenta/editar-estado-cuenta';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogRegistrarSitio } from '../../sitio/dialog/registrar-sitio/registrar-sitio';
import { DialogRegistroDeuda } from '../../representante/dialog/registro-deuda/dialog-registro-deuda';
import { DialogPagoExtra } from '../../representante/dialog/registro-pago-extra/dialog-pago-extra';
import { PDFClass } from '../../../utilidades/pdf';
import { HttpClient } from '@angular/common/http';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';
import { DialogRegistroRepresentante } from '../../representante/dialog/registro-representante/dialog-registro-representante';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ActualizacionService } from '../../admin/service/actualizacion.service';

@Component({
  selector: 'app-inicio2',
  templateUrl: './inicio2.component.html',
  styleUrls: ['./inicio2.component.css']
})
export class Inicio2Component implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild(MatSort) sort: MatSort;


  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  resultsLengthR: number = 0;

  isLoadingR: boolean = true;
  isLoadingS: boolean = true;
  isLoadingF: boolean = true;
  isLoadingEC: boolean = true;
  isRateLimitReachedS: boolean = false;
  isRateLimitReachedR: boolean = false;
  isRateLimitReachedF: boolean = false;
  isRateLimitReachedEC: boolean = false;

  representante: RepresentanteI;
  sitio: SitioI;
  fallecido: FallecidoI;

  filtro: string;
  columnsToDisplayR: string[] = ['nombre', 'cedula'];
  columnsToDisplayS: string[] = ['sector', 'tipo', 'descripcion', 'adquisicion'];
  columnsToDisplayF: string[] = ['nombre', 'cedula', 'fecha', 'observaciones'];
  columnsToDisplayEC: string[] = ['fecha', 'pago', 'cargos', 'abonos', 'pendientes', 'acciones',];

  representantes: RepresentanteI[] = [];
  sitios: SitioI[] = [];
  fallecidos: FallecidoI[] = [];
  estadoCuentaEC: MatTableDataSource<EstadoCuentaI> = new MatTableDataSource([]);

  private pdf: PDFClass;

  private filtro$ = new BehaviorSubject("");
  private sitios$ = new BehaviorSubject(-1);
  private estadoCuenta$ = new BehaviorSubject(-1);
  private fallecidos$ = new BehaviorSubject(-1);

  private _eliminar: any;
  private _estado_cuenta: any;

  constructor(
    private http: HttpClient,
    private apiRepresentante: RepresentanteService,
    private apiSitio: SitioService,
    private apiFallecido: FallecidoService,
    private dialog: MatDialog,
    private notsitio: ServiceC,
    private _snackBar: MatSnackBar,
    private apiActualizacion: ActualizacionService,
    private cdRef: ChangeDetectorRef) {
    this.pdf = new PDFClass(http);
    notsitio.actualizarHistorial$.pipe(
      tap((x: any) => this.sitios$.next(this.sitio.id))
    ).toPromise();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.obtenerRepresentantes();
    this.obtenerSitiosRepresentante();
    this.obtenerEstadoCuentaSitio();
    this.obtenerFallecidosSitio();
    this.actualizarCargos();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    try {
      this._eliminar.unsubscribe();
      this._estado_cuenta.unsubscribe();
    } catch (error) { }
  }

  nuevoRepresentante = (): void => {
    const dialogRef = this.dialog.open(DialogRegistroRepresentante, { width: '600px', panelClass: "my-class" });
    dialogRef.afterClosed().subscribe();
  }

  editar = (row: any): void => {
    row.pago = String(row.pago).toLowerCase();
    const dialogRef = this.dialog.open(DialogEstadoCuenta, { width: '350px', panelClass: "my-class", data: row });
    dialogRef.afterClosed().subscribe();
  }

  eliminar = (row: any): void => {
    this._eliminar = this.apiSitio.eliminarEstadoCuenta([row])
      .subscribe((x: any) => {
        if (x.ok) {
          this.estadoCuenta$.next(this.sitio.id);
          this.openSnackBar("Registros eliminados correctamente", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
      });
  }

  imprimirLista = (): void => {
    this._estado_cuenta = this.apiRepresentante.obtenerEstadoCuentaRepresentante(this.representante.id)
      .subscribe((data: ResponseDeudaRepresentanteI) => {
        if (data.ok) {
          this.pdf.jojo(this.procesarDatosImprimir(data.data), {
            nombre: 'Jhonatan Stalin Salazar Hurtado',
            representante: this.representante?.nombre,
            cedula: this.representante?.cedula,
            tipo: 'Comprobante',
            descripcion: 'Estado de cuenta',
            codigo: ''
          })
        }
      })
  }

  agregarSitio = (): void => {
    const dialogRef = this.dialog.open(DialogRegistrarSitio, { width: '500px', panelClass: "my-class", data: this.representante.id });
    dialogRef.afterClosed().subscribe();
  }

  agregarDeuda(): void {
    const dialogRef = this.dialog.open(DialogRegistroDeuda, { width: '500px', panelClass: "my-class", data: { id: this.representante.id } });
    dialogRef.afterClosed().subscribe();
  }

  agregarPago(): void {
    const dialogRef = this.dialog.open(DialogPagoExtra, { panelClass: "my-class", data: { id: this.representante.id } });
    dialogRef.afterClosed().subscribe();
  }

  getDeudas = (): number => this.estadoCuentaEC.data
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'cargo' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);

  getPagos = (): number => this.estadoCuentaEC.data
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'abono' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.cantidad), 0);

  getPendiente = (): number => this.estadoCuentaEC.data
    .filter(t =>
      t.estado_cuenta.toLowerCase() === 'cargo' &&
      (new Date(t.fecha) > new Date('2001/01/01')))
    .reduce((a, b) => a + Number(b.pendiente), 0);

  filtrarRepresentante = (event: Event): void => {
    this.reiniciarValores();
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtro = filterValue.trim().toLowerCase();
    this.filtro$.next(this.filtro);
  }

  verSitiosRepresentante = (representante: RepresentanteI): void => {
    this.reiniciarValores();
    this.representante = representante;
    this.sitios$.next(this.representante.id);
  }

  verRegistrosSitioRepresentante = (sitio: SitioI): void => {
    this.sitio = sitio;
    this.estadoCuenta$.next(this.sitio.id);
    this.fallecidos$.next(this.sitio.id);
  }

  private obtenerRepresentantes() {
    this.sort.sortChange.subscribe(() => this.paginator.toArray()[0].pageIndex = 0);

    merge(this.filtro$, this.sort.sortChange, this.paginator.toArray()[0].page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.representantes = [];
          this.reiniciarValores();
          this.isLoadingR = this.filtro ? true : false;
          return this.filtro ? this.apiRepresentante.listarRepresentantesNombre(this.filtro, this.sort.direction, this.paginator.toArray()[0].pageIndex) : []
        }),
        map((data: ResponseDeudaRepresentanteI) => {
          this.isLoadingR = false;
          this.isRateLimitReachedR = false;
          this.resultsLengthR = data?.cant ? data.cant : 0;
          return data ? data.data : [];
        }),
        catchError(() => {
          this.isLoadingR = false;
          this.isRateLimitReachedR = true;
          return of([]);
        })
      ).subscribe((data: RepresentanteI[]) => this.representantes = data);
  }

  private obtenerSitiosRepresentante() {
    merge(this.sitios$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingS = this.representante?.id ? true : false;
          return this.representante ? this.apiSitio.listarSitios(this.representante?.id) : [];
        }),
        map((data: ResponseSitioI) => {
          this.isLoadingS = false;
          this.isLoadingEC = false;
          this.isLoadingF = false;
          this.isRateLimitReachedS = false;
          return data ? data.data : [];
        }),
        catchError(() => {
          this.isLoadingS = false;
          this.isRateLimitReachedS = true;
          return of([]);
        })
      ).subscribe((data: SitioI[]) => this.sitios = data);
  }

  private obtenerEstadoCuentaSitio() {
    merge(this.estadoCuenta$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.estadoCuentaEC = new MatTableDataSource([]);
          this.isLoadingEC = this.sitio?.id ? true : false;
          return this.sitio ? this.apiSitio.obtenerEstadoCuenta(this.sitio.id) : [];
        }),
        map((data: ResponseEstadoCuentaSitioI) => {
          console.log("estar enamorandonos, seguro es el mejor estado.. \nquiero!!! enamorarme de ti de nuevo, y volver a empezar!! \nquiero q el amor sea así.. como siempre lo soñamos");
          this.isLoadingEC = false;
          this.isRateLimitReachedEC = false;
          return data.data ? data.data : [];
        }),
        catchError(() => {
          this.isLoadingEC = false;
          this.isRateLimitReachedEC = true;
          return of([]);
        })
      ).subscribe((data: EstadoCuentaI[]) => {
        data = data.map((value: EstadoCuentaI) => {
          let nuevo: any = value;
          nuevo.hovered = false;
          nuevo.editar = false;
          return nuevo;
        });
        this.estadoCuentaEC = new MatTableDataSource(data);
        this.estadoCuentaEC.paginator = this.paginator.toArray()[1];
      });
  }

  private obtenerFallecidosSitio() {
    merge(this.fallecidos$)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.fallecidos = [];
          this.isLoadingF = this.sitio?.id ? true : false;
          return this.sitio ? this.apiFallecido.listarFallecidos(this.sitio.id + "") : [];
        }),
        map((data: ResponseFallecidoI) => {
          this.isLoadingF = false;
          this.isRateLimitReachedF = false;
          return data.data
        }),
        catchError(() => {
          this.isLoadingF = false;
          this.isRateLimitReachedF = true;
          return of([]);
        })
      ).subscribe((data: FallecidoI[]) => this.fallecidos = data);
  }

  private procesarDatosImprimir = (data: EstadoCuentaI[]) =>
    data.map((x: EstadoCuentaI) => {
      return {
        fecha: x.fecha,
        lugar: x.tipo,
        motivo: x.descripcion,
        sector: x.sector,
        descripcion: x.pago,
        estado_cuenta: x.estado_cuenta,
        cantidad: x.cantidad,
        pendiente: x.estado_cuenta == 'abono' ? '' : x.pendiente,
        sitio: x.sitio
      }
    })

  private reiniciarValores() {
    this.sitios = [];
    this.fallecidos = [];
    this.estadoCuentaEC = new MatTableDataSource([]);
    this.sitio = null;
    this.representante = null;
  }

  private actualizarCargos () {
    merge()
    .pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.apiActualizacion.listarActualizacion();
      }),
      map((data: any) => {
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = data.cant;
        return data.data;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        this.isRateLimitReached = true;
        return of([]);
      })
    ).subscribe((data: any) => {
      if (data.length > 0)
        this.dialog.open(DialogActualizacion, { disableClose: true, data });
    });
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 });

}

@Component({
  selector: 'dialog-actualizacion',
  templateUrl: './dialog-actualizacion.html',
})
export class DialogActualizacion implements OnInit {

  columnasCargosNuevos: string[] = ['fecha', 'descripcion', 'cantidad'];
  columnasCargosActuales: string[] = ['fecha', 'descripcion', 'cantidad', 'estado'];

  locale: string;

  private _translate: any;

  constructor(@Inject(MAT_DIALOG_DATA) public registros: any, private translate: TranslateService,) { }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang)
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
    } catch (error) { }
  }


}
