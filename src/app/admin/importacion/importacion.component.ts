import { Component, OnInit, OnDestroy, ViewChild, NgZone, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { SectorService } from '../service/sector.service';
import { ValoresService } from '../service/valores.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Importacion } from '../../utilidades/importarRegistros';
import { Limpieza } from '../../utilidades/limpiezaRegistros';
import * as XLSX from 'xlsx';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ImportarService } from '../service/importar.service';
import { SectorI } from '../model/sector';
import { ValorI } from '../model/valor';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


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

export class ImportacionComponent implements OnInit, OnDestroy {

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

  paso1 = true;
  paso2 = false;
  paso3 = false;
  paso4 = false;
  paso5 = false;
  importando = true;
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

  cantidaRegistros = 0;
  cantidadRegistros = 0;

  displayedColumns: string[] = [
    'nombre',
    'cedula',
    'servicio',
    'tipo',
    'adquisicion',
    'cantidad'
  ];

  constructor(
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private sectorservice: SectorService,
    private valoresservice: ValoresService,
    private importarservice: ImportarService) { }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate =  this.translate.onLangChange
            .subscribe((langChangeEvent: LangChangeEvent) => {
                this.locale = langChangeEvent.lang;
            })
    this.obtenerValores();
  }


  ngOnDestroy() {
    this._translate.unsubscribe();
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

  obtenerRegistrosRepresentantes = () => this.listaRegistros2.length;

  obtenerRegistrosSitio = () => this.listaRegistros2.length;

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
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Mantenimiento'  && new Date(this.listaRegistros2[i].deudas[j].pagoDesde).getFullYear() >= 2002) {
          if (this.listaRegistros2[i].deudas[j].ingreso === undefined ) {
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
        if (this.listaRegistros2[i].deudas[j].descripcion === 'Servicio' && new Date(this.listaRegistros2[i].deudas[j].pagoDesde).getFullYear() >= 2002) {
          if (this.listaRegistros2[i].deudas[j].ingreso === undefined ) {
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

  obtenerAbonos = (): number => {
    let cantidad = 0;
    this.listaRegistros2.forEach((value: any) => {
      cantidad = cantidad + value.ingresos
      .filter((x: any) => new Date(x.pagoDesde).getFullYear() >= 2002)
      .map((x: any) => Number(x.valor))
      .reduce((a, b) => a + b, 0)
    })
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
    this.importando = false;
    this.guardarRegistrosImportacion();
  }

  private guardarRegistrosImportacion() {
    this.importarservice.agregarImportacion(this.listaRegistros2)
    .pipe( tap(data => {
      if(data.ok) {
        window.location.reload();
        this.openSnackBar("Registros importados exitosamente!!", "ok")}
      else { this.openSnackBar("A ocurrido un error al momento de importar, puedes intentarlo nuevamente!!", "ok")}
    })).toPromise()
  }

  private limpiarRegistros( data: any) {
   const limpiar: Limpieza = new Limpieza();
   this.listaImportacion = limpiar.limpiarRegistros(data);
   console.log(this.listaImportacion);
   this.procesarInformacion();
   this.indicadorImportacion = false;
   this.importacion = true;
  }

  procesarInformacion() {
    const importar:Importacion = new Importacion(this.listaSectores, this.listaValores);
    this.listaRegistros = importar.generarDatosImporte(this.listaImportacion.registrosValidos);
    this.listaRegistros2 = this.listaRegistros;
    console.log(this.listaRegistros2);
  }

  private obtenerValores() {
    this.sectorservice.sectores.pipe( tap(data => this.cargarValores(data)) ).toPromise();
    this.valoresservice.valores.pipe( tap(data =>this.cargarValoresValor(data)) ).toPromise();
  }

  private cargarValores( data: SectorI[]) {
    this.listaSectores = data;
  }

  private cargarValoresValor( data: ValorI[]) {
    this.listaValores = data;
  }

  private openSnackBar = (message: string, action: string): void => {
    this._snackBar.open(message, action, { duration: 5000 });
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
