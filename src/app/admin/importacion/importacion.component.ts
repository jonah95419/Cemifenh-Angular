import { Component, OnInit, OnDestroy, ViewChild, NgZone, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { SectorService } from '../service/sector.service';
import { ValoresService } from '../service/valores.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Importacion } from '../../utilidades/importarRegistros';
import { Limpieza } from '../../utilidades/limpiezaRegistros';
import * as XLSX from 'xlsx';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { RepresentanteService } from '../../cementerio/representante/service/representante.service';
import { SitioService } from '../../cementerio/sitio/service/sitio.service';
import { FallecidoService } from '../../cementerio/fallecido/service/fallecido.service';
import { ImportarService } from '../service/importar.service';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-importacion',
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.css'],
  encapsulation: ViewEncapsulation.None,
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

export class ImportacionComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  _translate: any;
  locale: string;

  file: File;
  arrayBuffer: any;

  listaSectores: SectorI[];
  listaValores: ValorI[];
  listaImportacion;
  listaRegistros = [];
  listaRegistros2 = [];
  listadoImporte: EstadoImporteI[] = [];

  paso1 = true;
  paso2 = false;
  paso3 = false;
  paso4 = false;
  paso5 = false;
  indicadorImportacion = false;
  importacion = false;
  generarGastosMantenimiento = true;
  generarGastosServicio = true;
  registrarDeudas = true;
  registrarComprobante = true;

  startDate = new Date(1975, 0, 1);
  periodoInicio = new Date(1975,0,1);
  periodoFinal = new Date();

  dataset = [
    {nombre:'servicio'},
    {nombre:'mantenimiento'},
    {nombre:'general'},
  ]

  progreso = 0;
  cantidaRegistros = 0;
  cantidadRegistros = 0;

  private subscribeSector: any;
  private subscribeValores: any;

  displayedColumns: string[] = [
    'nombre',
    'cedula',
    'servicio',
    'tipo',
    'adquisicion',
    'cantidad'
  ];
  columnasImporte: string[] = [
    'id',
    'representante',
    'sitio',
    'f',
    's',
    'm',
    'c',
    'p',
    'd'
  ];

  constructor(
    private translate: TranslateService,
    private zone: NgZone,
    private sectorservice: SectorService,
    private valoresservice: ValoresService,
    private sitioservice: SitioService,
    private representanteservice: RepresentanteService,
    private fallecidoservice: FallecidoService,
    private importarservice: ImportarService, private socket: Socket) { }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate =  this.translate.onLangChange
            .subscribe((langChangeEvent: LangChangeEvent) => {
                this.locale = langChangeEvent.lang;
            })
    this.obtenerValores();
    this.socket.on('socketImportar',(data)=>{
      if ( data.ok ) {
        this.cargarListadoImporte(data);
      } else {

      }
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this._translate.unsubscribe();

    if (this.subscribeSector != undefined ) {
      this.subscribeSector.unsubscribe();
    }
    if (this.subscribeValores != undefined ) {
      this.subscribeValores.unsubscribe();
    }
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
     this.file = event.target.files[0];
     this.indicadorImportacion = true;
     this.importacion = false;
     this.Upload();
    }
  }

  Upload() {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, {type:"binary"});
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      const exceljsondata: RegistroI[] = XLSX.utils.sheet_to_json(worksheet, {raw:true, defval:""});
      this.limpiarRegistros(exceljsondata);
    }
    fileReader.readAsArrayBuffer(this.file);
  }

  obtenerRegistrosRepresentantes() {
    return this.listaRegistros2.length;
  }

  obtenerRegistrosSitio() {
    return this.listaRegistros2.length;
  }

  obtenerRegistrosServicio() {
    let cantidad = 0;
    this.listaRegistros2.map( registro => {
      for (let j=0; j<registro.deudas.length; j++) {
        if (registro.deudas[j].descripcion === 'Servicio') {
          cantidad ++;
        }
      }
    });
    return cantidad;
  }

  obtenerRegistrosMantenimiento() {
    let cantidad = 0;
    for (let i=0; i<this.listaRegistros2.length; i++) {
      for (let j=0; j<this.listaRegistros2[i].deudas.length; j++) {
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Mantenimiento') {
          cantidad ++;
        }
      }
    }
    return cantidad;
  }

  obtenerDeudasMantenimiento() {
    let cantidad = 0;
    for (let i=0; i<this.listaRegistros2.length; i++) {
      for (let j=0; j<this.listaRegistros2[i].deudas.length; j++) {
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Mantenimiento' ) {
          if (this.listaRegistros2[i].deudas[j].ingreso === undefined) {
            cantidad  += Number(this.listaRegistros2[i].deudas[j].valor);
          } else {
            let cant = Number(this.listaRegistros2[i].deudas[j].valor) - Number(this.listaRegistros2[i].deudas[j].ingreso.cant);
            cantidad += cant;
          }
        }
      }
    }
    return cantidad;
  }

  obtenerDeudasServicio() {
    let cantidad = 0;
    for (let i=0; i<this.listaRegistros2.length; i++) {
      for (let j=0; j<this.listaRegistros2[i].deudas.length; j++) {
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Servicio') {
          if (this.listaRegistros2[i].deudas[j].ingreso === undefined) {
            cantidad  += Number(this.listaRegistros2[i].deudas[j].valor);
          } else {
            let cant = Number(this.listaRegistros2[i].deudas[j].valor) - Number(this.listaRegistros2[i].deudas[j].ingreso.cant);
            cantidad += cant;
          }
        }
      }
    }
    return cantidad;
  }

  obtenerPagosMantenimiento() {
    let cantidad = 0;
    for (let i=0; i<this.listaRegistros2.length; i++) {
      for (let j=0; j<this.listaRegistros2[i].deudas.length; j++) {
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Mantenimiento' && this.listaRegistros2[i].deudas[j].ingreso !== undefined) {
          cantidad  += Number(this.listaRegistros2[i].deudas[j].ingreso.cant);
        }
      }
    }
    return cantidad;
  }

  obtenerPagosServicio() {
    let cantidad = 0;
    for (let i=0; i<this.listaRegistros2.length; i++) {
      for (let j=0; j<this.listaRegistros2[i].deudas.length; j++) {
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Servicio' &&
            this.listaRegistros2[i].deudas[j].ingreso !== undefined &&
            new Date(this.listaRegistros2[i].deudas[j].pagoDesde).getFullYear() >= 2001) {
          cantidad  += Number(this.listaRegistros2[i].deudas[j].ingreso.cant);
        }
      }
    }
    return cantidad;
  }

  indicarPeriodo() {
    this.listaRegistros2 = this.listaRegistros.filter( registro =>
      new Date(registro.sitio.fechaAdquisicion) >= new Date(this.periodoInicio) &&
      new Date(registro.sitio.fechaAdquisicion) <= new Date(this.periodoFinal));
  }

  verCantidadRegistros() {
    this.listaRegistros2.forEach( registro => {
      this.cantidaRegistros = this.cantidaRegistros + 4;
      registro.deudas.forEach( deudas => {
        if (deudas.ingreso != undefined) {
          this.cantidaRegistros = this.cantidaRegistros + 2;
        } else {
          this.cantidaRegistros = this.cantidaRegistros + 1;
        }
      })
    });
  }

  guardarRegistros() {
    this.guardarRegistrosImportacion();
  }

  private guardarRegistrosImportacion() {
    this.importarservice.agregarImportacion(this.listaRegistros2)
    .subscribe( data => { console.log(data);})
  }

  // private guardarRegistroRepresentante() {
  //   this.representanteservice.agregarRepresentante(
  //     {
  //       representante: 'nombre de prueba',
  //       cedula: 'cedula de prueba'
  //     })
  //   .subscribe( data => { if (data.ok) { this.guardarRegistroSitio(data.data.id); } else { alert(data.message); }});
  // }

  // private guardarRegistroSitio(representante: number) {
  //   this.sitioservice.agregarSitio(
  //     {
  //       representante: representante,
  //       nombre: 'string',
  //       tipo: 'string',
  //       descripcion: 'string',
  //       sector: 2,
  //       fecha: new Date(),
  //       observaciones: 'string',
  //     })
  //   .subscribe( data => { if (data.ok) { this.guardarRegistroFallecido(data.data.id); } else { alert(data.message); }});
  // }

  // private guardarRegistroFallecido(sitio: number) {
  //   this.fallecidoservice.agregarFallecido(
  //     {
  //       sitio: sitio,
  //       nombre: 'string',
  //       cedula: 'string',
  //       fecha: new Date(),
  //       observaciones: 'string',
  //     })
  //   .subscribe( data => { if (data.ok) { this.guardarRegistroComprobante(sitio); } else { alert(data.message); } });
  // }

  // private guardarRegistroComprobante(sitio: number) {
  //   this.sitioservice.agregarComprobante(
  //     {
  //       nombre: 'string',
  //       total: 'string',
  //       fecha: new Date(),
  //       observaciones: 'string',
  //     })
  //   .subscribe( data => { if (data.ok) {this.guardarRegistroDeuda(sitio, data.data.id); } else { alert(data.message); } });
  // }

  // private guardarRegistroDeuda(sitio: number, comprobante: number) {
  //   this.sitioservice.agregarDeuda(
  //     {
  //       sitio: sitio,
  //       valor: 'string',
  //       descripcion: 'string',
  //       desde: new Date(),
  //       hasta: new Date(),
  //       observaciones: 'string',
  //     })
  //   .subscribe( data => { if (data.ok) {this.guardarRegistroIngreso(data.data.id, comprobante); } else {alert(data.message); } });
  // }

  // private guardarRegistroIngreso(deuda: number, comprobante: number) {
  //   this.sitioservice.agregarIngreso(
  //     {
  //       deuda: deuda,
  //       comprobante: comprobante,
  //       cantidad: 'string'
  //     })
  //   .subscribe( data => { if (data.ok) {console.log(data.data.id);} else {alert(data.message);} });
  // }

  private limpiarRegistros( data: any) {
   const limpiar: Limpieza = new Limpieza();
   this.listaImportacion = limpiar.limpiarRegistros(data);
   this.procesarInformacion();
   this.indicadorImportacion = false;
   this.importacion = true;
  }

  private procesarInformacion() {
    const importar:Importacion = new Importacion(this.listaSectores, this.listaValores);
    this.listaRegistros = importar.generarDatosImporte(this.listaImportacion.registrosValidos);
    this.listaRegistros2 = this.listaRegistros;
  }

  private obtenerValores() {
    this.subscribeSector = this.sectorservice.listarSectores().subscribe( data => { if (data.ok ) {this.cargarValores(data.data); } else { alert(data.message); }});
    this.subscribeValores = this.valoresservice.listarValores().subscribe( data => { if (data.ok ) {this.cargarValoresValor(data.data); } else { alert( data.message); }});
  }

  private cargarValores( data: SectorI[]) {
    this.listaSectores = data;
  }

  private cargarValoresValor( data: ValorI[]) {
    this.listaValores = data;
  }

  private cargarListadoImporte (data) {

    let crear = true;

    this.listadoImporte.forEach ( (listado:EstadoImporteI) => {
      if( data.R === listado.id) {
        crear = false;
      }
    });

    if (crear) {
      this.listadoImporte.push(
        {
          id: data.R,
          representante: data.r.representante.nombre,
          sitio: data.S,
          fallecido: data.F,
          comprobante: data.C,
          pagos: 0,
          deudas: 0,
          mantenimiento: 0,
          servicio: 0,
          comprobanteFecha: data.r.sitio.fechaAdquisicion
        });
        this.cantidadRegistros = this.cantidadRegistros + 4;
        this.progreso = (this.cantidadRegistros / this.cantidaRegistros) * 100;
    }
    this.listadoImporte = [...this.listadoImporte];
    this.actualizarListadoImporte(data);
  }

  private actualizarListadoImporte (data) {
    for (let i=0; i<this.listadoImporte.length; i++) {
      if( data.R === this.listadoImporte[i].id) {
        if (data.M === 'Mantenimiento') {
          this.listadoImporte[i].mantenimiento = Number(this.listadoImporte[i].mantenimiento) + 1;
        } else {
          this.listadoImporte[i].servicio = Number(this.listadoImporte[i].servicio) + 1;
        }
        if ( new Date(data.FD) > new Date('2001/01/01')) {
          this.listadoImporte[i].pagos = Number(this.listadoImporte[i].pagos) + Number(data.I);
          this.listadoImporte[i].deudas = Number(this.listadoImporte[i].deudas) + Number(data.D);
        }
        if (data.I === 0) {
          this.cantidadRegistros = this.cantidadRegistros + 1;
        } else {
          this.cantidadRegistros = this.cantidadRegistros + 2;
        }
        this.progreso = (this.cantidadRegistros / this.cantidaRegistros) * 100;
      }
    }
    this.listadoImporte = [...this.listadoImporte];
  }
}

interface RegistroI {
  NombreRepresentante: string;
  CedulaRepresentante: string;
  ObservacionesRepresetante: string;
  NombreFallecido: string;
  CedulaFallecido: string;
  FechaFallecimiento: Date;
  Observaciones: string;
  Nombre: string;
  Motivo: string;
  Lugar: string;
  Sector: string;
  FechaAdquisicion: Date;
  FechaInicio: string;
  ObservacionesSitio: string;
  Total: string;
}

interface SectorI {
  codigo: number;
  nombre: string;
}

interface ValorI {
  id: number;
  anio: string;
  periodo: string;
  motivo: string;
  lugar: string;
  valor: string;
  estado: boolean;
}

interface EstadoImporteI {
  id: number;
  representante: string;
  sitio: boolean;
  fallecido: boolean;
  mantenimiento: number;
  servicio: number;
  comprobante: number;
  pagos: number;
  deudas: number;
  comprobanteFecha: Date;
}
