import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { Importacion } from '../../../../utilidades/importarRegistros';
import { DeudaI } from '../../../representante/model/deuda';
import { SitioI } from '../../model/sitio';
import { ServiceC } from '../../service-c/sitio-serviceC';
import { SitioService } from '../../service/sitio.service';
import { SectorI } from '../../../../cementerio/admin/model/sector';
import { ValorI } from '../../../../cementerio/admin/model/valor';
import { ValoresService } from '../../../../cementerio/admin/service/valores.service';
import { SectorService } from '../../../../cementerio/admin/service/sector.service';

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

  private _translate: any;
  private _valores: any;
  private _sectores: any;

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
    this._valores = apiValores.valores.subscribe((data: ValorI[]) => this.listaValores = data);
    this._sectores = apiSectores.sectores.subscribe((data: SectorI[]) => this.listaSectores = data);
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang )
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
      this._valores.unsubscribe();
      this._sectores.unsubscribe();
    } catch (error) { }
  }

  get statusSubmit() {
    if (this.sitioForm.valid) {
      if (this.registrarFallecido) {
        if (this.fallecidoForm.valid) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  submit(): void {
    this.guardarRegistro({
      sitio: this.sitioForm.value,
      fallecido: this.registrarFallecido ? this.fallecidoForm.value : null
    });
  }

  onNoClick(): void { this.dialogRef.close(); }

  setStep(index: number) { this.step = index; }

  nextStep(): void { this.step++; }

  prevStep(): void { this.step--; }

  generarDeudasSitios(event: MatCheckboxChange): void {
    if (event.checked) {
      if (this.sitioForm.controls['tipo'].value !== "Donación") {
        this.generarListaDeudas(this.sitioForm.value);
      }
    } else {
      this.listaDeudas = [];
    }
  }

  tipoSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if (value === "Arriendo") {
      this.listaDescripcion = ['Bóveda', 'Piso'];
    }
    if (value === "Compra") {
      this.listaDescripcion = ['Lote propio'];
    }
    if (value === "Donación") {
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

    const importar: Importacion = new Importacion(this.listaSectores, this.listaValores);
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
      if (fallecido) {
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
    if (x.ok) {
      this.openSnackBar("Sitio registrado", "ok");
      this.notSitio.emitActualizarHistorialChange();
      this.dialogRef.close({ ok: true });
    } else {
      this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
      this.dialogRef.close({ ok: false });
    }
  }

  private obtenerSector(id: any): SectorI {
    return this.listaSectores.filter(sector => sector.id == id)[0];
  }

  private openSnackBar = (message: string, action: string): void => {
    this._snackBar.open(message, action, { duration: 5000 });
  }


}
