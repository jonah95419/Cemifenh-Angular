import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { RepresentanteService } from '../../representante/service/representante.service';
import { RepresentanteI } from '../../representante/model/representante';
import { SitioI, ResponseSitioI, ResponseEstadoCuentaSitioI, EstadoCuentaI } from '../../sitio/model/sitio';
import { SitioService } from '../../sitio/service/sitio.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FallecidoService } from '../../fallecido/service/fallecido.service';
import { FallecidoI, ResponseFallecidoI } from '../../fallecido/model/fallecido';
import { ResponseDeudaRepresentanteI } from '../../representante/model/deuda';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-inicio2',
  templateUrl: './inicio2.component.html',
  styleUrls: ['./inicio2.component.css']
})
export class Inicio2Component implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild(MatSort) sort: MatSort;

  resultsLength: number = 0;

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

  locale: string;
  filtro: string;
  columnsToDisplayR: string[] = ['nombre', 'cedula'];
  columnsToDisplayS: string[] = ['sector', 'tipo', 'descripcion', 'adquisicion'];
  columnsToDisplayF: string[] = ['nombre', 'cedula', 'fecha', 'observaciones'];
  columnsToDisplayEC: string[] = ['fecha', 'pago', 'cargos', 'abonos', 'pendientes',];

  representantes: RepresentanteI[] = [];
  sitios: SitioI[] = [];
  fallecidos: FallecidoI[] = [];
  estadoCuentaEC: MatTableDataSource<EstadoCuentaI>;

  private filtro$ = new BehaviorSubject("");
  private sitios$ = new BehaviorSubject(-1);
  private estadoCuenta$ = new BehaviorSubject(-1);
  private fallecidos$ = new BehaviorSubject(-1);

  private _translate;

  constructor(
    private apiRepresentante: RepresentanteService,
    private apiSitio: SitioService,
    private apiFallecido: FallecidoService,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
  }

  ngAfterViewInit() {
    this.obtenerRepresentantes();
    this.obtenerSitiosRepresentante();
    this.obtenerEstadoCuentaSitio();
    this.obtenerFallecidosSitio();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
    } catch (error) { }
  }

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
          this.resultsLength = data?.cant ? data.cant : 0;
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
          this.isLoadingF = this.sitio?.id ? true:false;
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

  private reiniciarValores() {
    this.sitios = [];
    this.fallecidos = [];
    this.estadoCuentaEC = new MatTableDataSource([]);
    this.sitio = null;
    this.representante = null;
  }
}
