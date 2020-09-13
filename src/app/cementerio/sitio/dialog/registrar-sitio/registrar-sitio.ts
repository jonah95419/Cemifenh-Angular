import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitioService } from '../../service/sitio.service';
import { ServiceC } from '../../service-c/sitio-serviceC';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SectorI } from '../../../../admin/model/sector';
import { SectorService } from '../../../../admin/service/sector.service';
import { MatSelectChange } from '@angular/material/select';
import { MatTable } from '@angular/material/table';
import { ValorI } from '../../../../admin/model/valor';
import { DeudaI } from '../../../representante/model/deuda';
import { SitioI } from '../../model/sitio';
import { ValoresService } from '../../../../admin/service/valores.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Importacion } from '../../../../utilidades/importarRegistros';

@Component({
  selector: 'registrar-sitio',
  templateUrl: 'registrar-sitio.html',
  styleUrls: ['./registrar-sitio.css'],
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
export class DialogRegistrarSitio implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  step = 0;

  columnsToDisplay: string[] = ['descripcion', 'fecha', 'valor', 'accion'];

  registrarFallecido: boolean = false;
  generarDeudas: boolean = false;

  listaTipo = ['Arriendo', 'Compra', 'Donación'];
  listaDescripcion = ['Boveda', 'Piso propio', 'Piso'];
  listaSectores: SectorI[];
  listaValores: ValorI[];
  listaDeudas: DeudaI[] = [];

  sitioForm = this.fb.group({
    sector: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl(new Date(), Validators.required),
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
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private dialogRef: MatDialogRef<DialogRegistrarSitio>,
    @Inject(MAT_DIALOG_DATA) private representante: any) {
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
  }

  onNoClick(): void { this.dialogRef.close(); }

  setStep(index: number) { this.step = index; }

  nextStep(): void { this.step++; }

  prevStep(): void { this.step--; }

  generarDeudasSitios(event: MatCheckboxChange): void {
    if(event.checked) {
      if(this.sitioForm.controls['tipo'].value !== "Donación") {
        this.generarListaDeudas(this.sitioForm.value);
      }
    } else {
      this.listaDeudas = [];
    }
  }

  tipoSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if(value === "Arriendo") {
      this.listaDescripcion = ['Bóveda', 'Piso'];
    }
    if(value === "Compra") {
      this.listaDescripcion = ['Lote propio'];
    }
    if(value === "Donación" ) {
      this.listaDescripcion = ['Bóveda', 'Piso'];
    }
  }

  getTotalCost(): number {
    return this.listaDeudas?.map(t => Number(t.valor)).reduce((acc, value) => acc + value, 0);
  }

  eliminarDeuda(deuda: DeudaI): void {
    this.listaDeudas = this.listaDeudas.filter(d => d !== deuda);
    this.table.renderRows();
  }

  private generarListaDeudas(r: any): void {
    let nuevo_registro: any[] = [{
      Motivo: r.tipo,
      Lugar: r.descripcion,
      FechaAdquisicion: r.fecha,
      FechaInicio: null,
    }];

    const importar:Importacion = new Importacion(this.listaSectores, this.listaValores);
    this.listaDeudas = importar.generarDeudasRegistro(nuevo_registro);
  }

  private guardarRegistro(r: any): void {
    let fallecido: boolean = r.fallecido === null;
    let sitio: boolean = r.sitio !== null;
    if (sitio) {
      let nuevo_registro: any = {
        sitio: {
          representante: this.representante,
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
      this.apiSitio.agregarSitio(nuevo_registro).pipe(
        tap(x => this.result(x))).toPromise();
    } else {
      this.apiSitio.agregarSitio(r).pipe(
        tap(x => this.result(x))).toPromise();
    }
  }

  private result = (x: any) => {
    if(x.ok) {
      this.openSnackBar("Sitio registrado", "ok");
      this.notSitio.emitActualizarHistorialChange();
      this.dialogRef.close({ok: true});
    } else {
      this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
      this.dialogRef.close({ok: false});
    }
  }

  private obtenerSector (id: any): SectorI {
    return this.listaSectores.filter ( sector => sector.id == id)[0];
  }

  private openSnackBar = (message: string, action: string): void => {
    this._snackBar.open(message, action, { duration: 5000 });
  }


}
