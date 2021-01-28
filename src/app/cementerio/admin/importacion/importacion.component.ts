import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { SectorI } from '../model/sector';
import { ValorI } from '../model/valor';
import { ImportarService } from '../service/importar.service';
import { SectorService } from '../service/sector.service';
import { ValoresService } from '../service/valores.service';
import { Limpieza } from '../../../utilidades/limpiezaRegistros';
import { Importacion } from '../../../utilidades/importarRegistros';


@Component({
  selector: 'app-importacion',
  templateUrl: './importacion.component.html',
  styleUrls: ['./importacion.component.css'],
  encapsulation: ViewEncapsulation.None,
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

export class ImportacionComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  locale: string;

  file: File;

  listaImportacion;
  listaRegistros2 = [];

  paso1: boolean = true;
  paso2: boolean = false;
  paso3: boolean = false;
  paso4: boolean = false;
  importando: boolean = true;
  indicadorImportacion: boolean = false;
  importacion: boolean = false;
  generarGastosMantenimiento: boolean = true;
  generarGastosServicio: boolean = true;
  registrarDeudas: boolean = true;
  registrarComprobante: boolean = true;

  periodoInicio = new Date(1975, 0, 1);
  periodoFinal = new Date();

  displayedColumns: string[] = [
    'nombre',
    'cedula',
    'servicio',
    'tipo',
    'adquisicion',
    'cantidad'
  ];

  private arrayBuffer: any;

  private listaSectores: SectorI[];
  private listaValores: ValorI[];

  private listaRegistros = [];

  private cantidaRegistros: number = 0;

  private _translate: any;
  private _guardar_registros: any;

  constructor(
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private sectorservice: SectorService,
    private valoresservice: ValoresService,
    private importarservice: ImportarService) { }

  ngOnInit(): void {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang)
    this.obtenerValores();
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
      this._guardar_registros.unsubscribe();
    } catch (error) { }
  }

  onFileChange(event): void {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.indicadorImportacion = true;
      this.importacion = false;
      this.Upload();
    }
  }

  Upload(): void {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      const exceljsondata: RegistroI[] = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: "" });
      this.limpiarRegistros(exceljsondata);
    }
    fileReader.readAsArrayBuffer(this.file);
  }

  get obtenerRegistrosRepresentantes(): number { return this.listaRegistros2.length; }

  get obtenerRegistrosSitio(): number { return this.listaRegistros2.length; }

  get obtenerRegistrosServicio(): number {
    let cantidad = 0;
    this.listaRegistros2.forEach(registro => {
      registro.deudas.forEach(r => {
        if (r.descripcion === 'Servicio') {
          cantidad++;
        }
      })
    })
    return cantidad;
  }

  get obtenerRegistrosMantenimiento(): number {
    let cantidad = 0;
    this.listaRegistros2.forEach(registro => {
      registro.deudas.forEach(r => {
        if (r.descripcion === 'Mantenimiento') {
          cantidad++;
        }
      })
    })
    return cantidad;
  }

  get obtenerDeudasMantenimiento(): number {
    let cantidad = 0;
    this.listaRegistros2.forEach(registro => {
      registro.deudas.forEach(r => {
        if (r.descripcion === 'Mantenimiento' && new Date(r.pagoDesde).getFullYear() >= 2002) {
          if (r.ingreso === undefined) {
            cantidad += Number(r.valor);
          } else {
            let cant = Number(r.valor) - Number(r.ingreso.cant);
            cantidad += cant;
          }
        }
      })
    })
    return cantidad;
  }

  get obtenerDeudasServicio(): number {
    let cantidad = 0;
    this.listaRegistros2.forEach(registro => {
      registro.deudas.forEach(r => {
        if (r.descripcion === 'Servicio' && new Date(r.pagoDesde).getFullYear() >= 2002) {
          if (r.ingreso === undefined) {
            cantidad += Number(r.valor);
          } else {
            let cant = Number(r.valor) - Number(r.ingreso.cant);
            cantidad += cant;
          }
        }
      })
    })
    return cantidad;
  }

  get obtenerAbonos(): number {
    let cantidad = 0;
    this.listaRegistros2.forEach((value: any) => {
      cantidad = cantidad + value.ingresos
        .filter((x: any) => new Date(x.pagoDesde).getFullYear() >= 2002)
        .map((x: any) => Number(x.valor))
        .reduce((a, b) => a + b, 0)
    })
    return cantidad;
  }

  indicarPeriodo(): void {
    this.listaRegistros2 = this.listaRegistros.filter(registro =>
      new Date(registro.sitio.fechaAdquisicion) >= new Date(this.periodoInicio) &&
      new Date(registro.sitio.fechaAdquisicion) <= new Date(this.periodoFinal));
  }

  verCantidadRegistros(): void {
    this.listaRegistros2.forEach(registro => {
      this.cantidaRegistros = this.cantidaRegistros + 4;
      registro.deudas.forEach(deudas => {
        if (deudas.ingreso != undefined) {
          this.cantidaRegistros = this.cantidaRegistros + 2;
        } else {
          this.cantidaRegistros = this.cantidaRegistros + 1;
        }
      })
    });
  }

  guardarRegistros(): void {
    this.importando = false;
    this.guardarRegistrosImportacion();
  }

  private guardarRegistrosImportacion(): void {
    this._guardar_registros = this.importarservice.agregarImportacion(this.listaRegistros2)
      .subscribe(data => {
        if (data.ok) {
          window.location.reload();
          this.openSnackBar("Registros importados exitosamente!!", "ok")
        }
        else {
          this.openSnackBar(data.message, "ok")
        }
      });
  }

  private limpiarRegistros(data: any): void {
    const limpiar: Limpieza = new Limpieza();
    this.listaImportacion = limpiar.limpiarRegistros(data);
    this.procesarInformacion();
    this.indicadorImportacion = false;
    this.importacion = true;
  }

  procesarInformacion(): void {
    const importar: Importacion = new Importacion(this.listaSectores, this.listaValores);
    this.listaRegistros = importar.generarDatosImporte(this.listaImportacion.registrosValidos);
    this.listaRegistros2 = this.listaRegistros;
  }

  private obtenerValores(): void {
    this.sectorservice.sectores.pipe(tap(data => this.cargarValores(data))).toPromise();
    this.valoresservice.valores.pipe(tap(data => this.cargarValoresValor(data))).toPromise();
  }

  private cargarValores = (data: SectorI[]): void => { this.listaSectores = data; }

  private cargarValoresValor = (data: ValorI[]): void => { this.listaValores = data; }

  private openSnackBar = (m: string, a: string): void => { this._snackBar.open(m, a, { duration: 5000 }); }

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
