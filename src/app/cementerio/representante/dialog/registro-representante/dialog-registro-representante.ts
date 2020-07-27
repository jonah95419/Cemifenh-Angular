import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SectorService } from '../../../../admin/service/sector.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { SectorI } from '../../../../admin/model/sector';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { SitioI } from '../../../sitio/sitio-detalles/sitio-detalles.component';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Importacion } from '../../../../utilidades/importarRegistros';
import { ValoresService } from '../../../../admin/service/valores.service';
import { ValorI } from '../../../../admin/model/valor';
import { combineLatest } from 'rxjs';

export interface DialogData {
  animal: string;
  name: string;
}

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
export class DialogRegistroRepresentante {

  step = 0;

  registrarSitio: boolean = false;
  registrarFallecido: boolean = false;

  listaTipo = ['Arriendo', 'Compra', 'Donación'];
  listaDescripcion = ['Bóveda', 'Lote propio', 'Piso'];
  listaSectores: SectorI[];
  listaValores: ValorI[];

  representanteForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl('')
  })

  sitioForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    sector: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required),
  })

  fallecidoForm = this.fb.group({
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl(''),
    fecha_fallecimiento: new FormControl('')
  })

  sectorControl = new FormControl('', Validators.required);

  informacionSitio: SitioI;

  constructor(
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private apiSectores: SectorService,
    private apiValores: ValoresService,
    private dialogRef: MatDialogRef<DialogRegistroRepresentante>) {
    apiValores.valores.pipe(tap((data: ValorI[]) => this.listaValores = data)).toPromise();
    apiSectores.sectores.pipe(tap((data: SectorI[]) => this.listaSectores = data)).toPromise();
  }

  submit(): void {
    let nuevo_representante = {
      representante: {},
      sitio: null,
      fallecido: null
    }
    if (this.representanteForm.valid) {
      nuevo_representante.representante = this.representanteForm.value;
      if (this.registrarSitio) {
        if (this.sitioForm.valid) {
          nuevo_representante.sitio = this.sitioForm.value;
          if (this.registrarFallecido) {
            if (this.fallecidoForm.valid) {
              nuevo_representante.fallecido = this.fallecidoForm.value;
              this.guardarRegistro(nuevo_representante);
            } else {
              this.openSnackBar("Faltan campos de llenar del fallecido", "");
            }
          } else {
            this.guardarRegistro(nuevo_representante);
          }
        } else {
          this.openSnackBar("Faltan campos de llenar del sitio", "");
        }
      } else {
        this.guardarRegistro(nuevo_representante);
      }
    }
  }

  onNoClick(): void { this.dialogRef.close(); }

  setStep(index: number) { this.step = index; }

  nextStep() { this.step++; }

  prevStep() { this.step--; }

  private guardarRegistro(registro: object): void {
    console.log(registro);
    console.log(this.listaValores);
    this.dialogRef.close();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
