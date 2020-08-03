import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SectorService } from '../../../../admin/service/sector.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { SectorI } from '../../../../admin/model/sector';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Importacion } from '../../../../utilidades/importarRegistros';
import { ValoresService } from '../../../../admin/service/valores.service';
import { ValorI } from '../../../../admin/model/valor';
import { RepresentanteService } from '../../service/representante.service';
import { RegistroI } from '../../../../utilidades/model/registro';
import { MatSelectChange } from '@angular/material/select';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DeudaI } from '../../model/deuda';
import { SitioI } from '../../../sitio/sitio-detalles/sitio-detalles.component';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'dialog-registro-representante',
  templateUrl: 'dialog-registro-representante.html',
  styleUrls: ['./dialog-registro-representante.css'],
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
export class DialogRegistroRepresentante implements OnInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;


  step = 0;

  columnsToDisplay: string[] = ['descripcion', 'desde', 'hasta', 'valor', 'accion'];

  registrarSitio: boolean = false;
  registrarFallecido: boolean = false;
  generarDeudas: boolean = false;

  listaTipo = ['Arriendo', 'Propio', 'Donación'];
  listaDescripcion = ['Boveda', 'Piso propio', 'Piso'];
  listaSectores: SectorI[];
  listaValores: ValorI[];
  listaDeudas: DeudaI[] = [];

  representanteForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl(''),
    observaciones: ''
  })

  sitioForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    sector: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required),
    observaciones: ""
  })

  fallecidoForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl(''),
    fecha_fallecimiento: new FormControl(''),
    observaciones: ''
  })

  sectorControl = new FormControl('', Validators.required);

  locale: string;

  informacionSitio: SitioI;

  private _translate;

  constructor(
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private apiSectores: SectorService,
    private apiValores: ValoresService,
    private apiRepresentante: RepresentanteService,
    private dialogRef: MatDialogRef<DialogRegistroRepresentante>) {
    apiValores.valores.pipe(tap((data: ValorI[]) => this.listaValores = data)).toPromise();
    apiSectores.sectores.pipe(tap((data: SectorI[]) => this.listaSectores = data)).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })

  }

  ngOnDestroy(): void {
    if (this._translate !== undefined) {
      this._translate.unsubscribe();
    }
  }

  submit(): void {
    let nuevo_registro = {
      representante: {},
      sitio: null,
      fallecido: null
    }
    if (this.representanteForm.valid) {
      nuevo_registro.representante = this.representanteForm.value;
      if (this.registrarSitio) {
        if (this.sitioForm.valid) {
          nuevo_registro.sitio = this.sitioForm.value;
          if (this.registrarFallecido) {
            if (this.fallecidoForm.valid) {
              nuevo_registro.fallecido = this.fallecidoForm.value;
              this.guardarRegistro(nuevo_registro);
            } else {
              this.openSnackBar("Faltan campos de llenar del fallecido", "");
            }
          } else {
            this.guardarRegistro(nuevo_registro);
          }
        } else {
          this.openSnackBar("Faltan campos de llenar del sitio", "");
        }
      } else {
        this.guardarRegistro(nuevo_registro);
      }
    } else {
      this.openSnackBar("Faltan campos de llenar del represenante", "");
    }
  }

  onNoClick(): void { this.dialogRef.close(); }

  setStep(index: number) { this.step = index; }

  nextStep() { this.step++; }

  prevStep() { this.step--; }

  generarDeudasSitios(event: MatCheckboxChange) {
    if(event.checked) {
      if(this.sitioForm.controls['tipo'].value !== "Donación") {
        this.generarListaDeudas(this.sitioForm.value);
      }
    } else {
      this.listaDeudas = [];
    }
  }

  tipoSeleccionado(event: MatSelectChange) {
    const value = event.source.value;
    if(value === "Arriendo") {
      this.listaDescripcion = ['Boveda', 'Piso'];
    }
    if(value === "Propio") {
      this.listaDescripcion = ['Piso propio'];
    }
    if(value === "Donación" ) {
      this.listaDescripcion = ['Boveda', 'Piso'];
    }
  }

  getTotalCost() {
    return this.listaDeudas?.map(t => Number(t.valor)).reduce((acc, value) => acc + value, 0);
  }

  eliminarDeuda(deuda: DeudaI) {
    this.listaDeudas = this.listaDeudas.filter(d => d.valorId !== deuda.valorId);
    this.table.renderRows();
  }

  private generarListaDeudas(r: any): void {
    let nuevo_registro: RegistroI[] = [{
      NombreRepresentante: "",
      CedulaRepresentante: "",
      ObservacionesRepresetante: "",
      NombreFallecido: "",
      CedulaFallecido: "",
      FechaFallecimiento: null,
      Observaciones: "",
      Nombre: r.nombre,
      Sector: r.sector,
      Motivo: r.tipo,
      Lugar: r.descripcion,
      FechaAdquisicion: r.fecha,
      FechaInicio: null,
      ObservacionesSitio: "",
      Total: "0"
    }];

    const importar:Importacion = new Importacion(this.listaSectores, this.listaValores);
    this.listaDeudas = importar.generarDeudasRegistro(nuevo_registro);
  }

  private guardarRegistro(r: any): void {
    let fallecido: boolean = r.fallecido === null;
    let sitio: boolean = r.sitio !== null;
    if (sitio) {
      let nuevo_registro: any = {
        representante: {
          nombre: r.representante.nombre,
          cedula: r.representante.cedula,
          observaciones: r.representante.observaciones
        },
        sitio: {
          nombre: r.sitio.nombre,
          motivo: r.sitio.tipo,
          lugar: r.sitio.descripcion,
          sector: this.obtenerSector(r.sitio.sector),
          fechaAdquisicion: r.sitio.fecha,
          observaciones: r.sitio.observaciones
        },
        fallecido: {
          nombre: r.fallecido?.nombre,
          cedula: r.fallecido?.cedula,
          fecha: r.fallecido?.fecha_fallecimiento,
          observaciones: r.fallecido?.observaciones
        },
        deudas: this.listaDeudas
      };
      if(fallecido) {
        nuevo_registro.fallecido = null;
      }

      this.apiRepresentante.agregarRepresentante(nuevo_registro);
    } else {
      this.apiRepresentante.agregarRepresentante(r);
    }

    this.dialogRef.close();
  }

  private obtenerSector (id: any): SectorI {
    return this.listaSectores.filter ( sector => sector.id == id)[0];
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
