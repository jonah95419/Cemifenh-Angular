import { Component, OnInit, Input, SimpleChanges, ViewChild, OnDestroy, OnChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SitioService } from '../service/sitio.service';
import { SectorService } from 'src/app/admin/service/sector.service';
import { FallecidoService } from '../../fallecido/service/fallecido.service';
import { EstadoCuentaI } from '../service/estadoCuenta';
import { SectorI } from '../../../admin/model/sector';

@Component({
  selector: 'app-sitio-detalles',
  templateUrl: './sitio-detalles.component.html',
  styleUrls: ['./sitio-detalles.component.css'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})

export class SitioDetallesComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input()
  sitioId: number;

  displayedColumns: string[] = ['nombre', 'cedula', 'fecha', 'observaciones', 'acciones'];
  displayedColumnsD: string[] = ['descripcion', 'deuda_total', 'deuda_actual', 'desde', 'hasta', 'acciones'];
  displayedColumnsP: string[] = ['id', 'fecha', 'cantidad'];
  displayedColumnsPD: string[] = ['descripcion', 'cantidad', 'desde', 'hasta'];
  displayedColumnsEC: string[] = ['id', 'descripcion', 'desde', 'hasta', 'cantidad'];
  dataSource: MatTableDataSource<FallecidoI>;
  dataSourceD: MatTableDataSource<DeudaI>;
  dataSourceP: MatTableDataSource<PagoI>;
  dataSourcePD: MatTableDataSource<PagoDetallesI>;
  dataSourceEC: MatTableDataSource<EstadoCuentaI>;

  detalles = 'Información';

  informacionSitio: SitioI;

  listaSectores: SectorI[];
  listaFallecidos: FallecidoI[];
  listaDeudas: DeudaI[];
  listaPagos: PagoI[];
  listaPagoDetalles: PagoDetallesI[];
  listaEstadoCuenta: EstadoCuentaI[];

  listaTipo = ['Arriendo', 'Compra', 'Donación'];
  listaDescripcion = ['Bóveda', 'Lote propio', 'Piso'];
  listaEstados = ['Pagado', 'Sin pagar'];

  sectorControl = new FormControl('', Validators.required);

  private subscribeSitio: any;
  private subscribeSectores: any;
  private subscribeFallecidos: any;
  private subscribeDeudas: any;
  private subscribePagos: any;
  private subscribePagoDetalles: any;
  private subscribeEstadoCuenta: any;

  constructor(
    private sitioservice: SitioService,
    private sectorservice: SectorService,
    private fallecidoservice: FallecidoService
    ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sitioId !== undefined || this.sitioId) {
      this.obtenerValores();
      this.obtenerValoresSectores();
      this.obtenerValoresFallecidos();
      this.obtenerValoresDeudas();
      this.obtenerValoresPagos();
      this.obtenerValoresEstadoCuenta();
    }
  }

  ngOnDestroy(): void {
    if (this.subscribeSitio !== undefined) {
      this.subscribeSitio.unsubscribe();
    }
    if (this.subscribeSectores !== undefined) {
      this.subscribeSectores.unsubscribe();
    }
    if (this.subscribeFallecidos !== undefined) {
      this.subscribeFallecidos.unsubscribe();
    }
    if (this.subscribeDeudas !== undefined) {
      this.subscribeDeudas.unsubscribe();
    }
    if (this.subscribePagos !== undefined) {
      this.subscribePagos.unsubscribe();
    }
    if (this.subscribePagoDetalles !== undefined) {
      this.subscribePagoDetalles.unsubscribe();
    }
    if (this.subscribeEstadoCuenta !== undefined) {
      this.subscribeEstadoCuenta.unsubscribe();
    }
  }

  getTotalCost() {
    return this.listaDeudas.map(t => Number(t.deuda_actual)).reduce((acc, value) => acc + value, 0);
  }

  getTotalPago() {
    return this.listaPagoDetalles.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  getTotalEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( new Date(t.desde) > new Date('2001/01/01') ) { if ( t.tipo === 'deuda' ) { suma += Number(t.cantidad); } else { suma -= Number(t.cantidad); } } });
    return suma;
  }

  getDeudasEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.tipo === 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  getPagosEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.tipo !== 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  getTotalPagos() {
    return this.listaPagos.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  private obtenerValores() {
    this.subscribeSitio = this.sitioservice.obtenerSitio(this.sitioId)
    .subscribe(data => {
      if (data.ok) {this.cargarValores(data.data[0]); } else {alert(data.message); }
    });
  }

  private cargarValores(data: SitioI) {
    this.informacionSitio = data;
  }

  private obtenerValoresSectores() {
    this.subscribeSectores = this.sectorservice.sectores
    .subscribe(data => this.cargarValoresSectores(data) );
  }

  private cargarValoresSectores(data: SectorI[]) {
    this.listaSectores = data;
  }

  private obtenerValoresFallecidos() {
    this.subscribeFallecidos = this.fallecidoservice.listarFallecidos(this.sitioId)
    .subscribe(data => {
      if (data.ok) {this.cargarValoresFallecidos(data.data); } else {alert(data.message); }
    });
  }

  private cargarValoresFallecidos(data: FallecidoI[]) {
    this.listaFallecidos = data;
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
  }

  private obtenerValoresDeudas() {
    this.subscribeDeudas = this.sitioservice.obtenerDeudas(this.sitioId)
    .subscribe(data => {
      if (data.ok) {this.cargarValoresDeudas(data.data); } else {alert(data.message); }
    });
  }

  private cargarValoresDeudas(data: DeudaI[]) {
    this.listaDeudas = data;//data.filter(deuda => Number(deuda.deuda_actual) !== 0);
    this.dataSourceD = new MatTableDataSource(this.listaDeudas);
    this.dataSourceD.sort = this.sort;
  }

  private obtenerValoresPagos() {
    this.subscribePagos = this.sitioservice.obtenerPagos(this.sitioId)
    .subscribe(data => {
      if (data.ok) {this.cargarValoresPagos(data.data); } else { alert(data.message); }
    })
  }

  private cargarValoresPagos(data: PagoI[]) {
    this.listaPagos = data.filter(deuda => Number(deuda.cantidad) !== 0);
    this.dataSourceP = new MatTableDataSource(this.listaPagos);
    this.dataSourceP.sort = this.sort;
    if (this.listaPagos.length > 0) { this.obtenerValoresPagoDetalles(this.listaPagos[0].id); }
    else { this.cargarValoresPagoDetalles([]); }
  }

  obtenerValoresPagoDetalles(comprobanteID: number) {
    this.subscribePagoDetalles = this.sitioservice.obtenerPagoDetalles(comprobanteID, this.sitioId)
    .subscribe( data => {
      if (data.ok) { this.cargarValoresPagoDetalles(data.data); } else { alert(data.message); }
    })
  }

  private cargarValoresPagoDetalles(data: PagoDetallesI[]) {
    this.listaPagoDetalles = data;
    this.dataSourcePD = new MatTableDataSource(this.listaPagoDetalles);
    this.dataSourcePD.sort = this.sort;
  }

  private obtenerValoresEstadoCuenta() {
    this.subscribeEstadoCuenta = this.sitioservice.obtenerEstadoCuenta(this.sitioId)
    .subscribe( data => {
      if (data.ok) { this.cargarValoresEstadoCuenta(data.data); } else { alert(data.message); }
    })
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaI[]) {
    this.listaEstadoCuenta = data;
    this.dataSourceEC = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSourceEC.sort = this.sort;
  }

}

export interface SitioI {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  sector: string;
  estado: boolean;
  adquisicion: string;
  observaciones: string;
}



export interface FallecidoI {
  id: number;
  nombre: string;
  cedula: string;
  fecha: Date;
  observaciones: string;
}

export interface DeudaI {
  id: number;
  descripcion: string;
  deuda_total: string;
  deuda_actual: string;
  desde: Date;
  hasta: Date;
}

export interface PagoI {
  id: number;
  fecha: string;
  cantidad: string;
}

export interface PagoDetallesI {
  id: number;
  cantidad: string;
  descripcion: string;
  desde: string;
  hasta: string;
}

