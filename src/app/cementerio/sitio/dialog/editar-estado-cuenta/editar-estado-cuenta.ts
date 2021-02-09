import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitioService } from '../../service/sitio.service';
import { ServiceC } from '../../service-c/sitio-serviceC';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'editar-estado-cuenta',
  templateUrl: 'editar-estado-cuenta.html',
  styleUrls: ['./editar-estado-cuenta.css'],
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
export class DialogEstadoCuenta implements OnInit, OnDestroy {

  locale: any;
  data: any;
  estadoForm: any;

  private _transalate: any;
  private _actualizar: any;

  constructor(
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogEstadoCuenta>,
    @Inject(MAT_DIALOG_DATA) private _data: any) {
      this.data = _data;
      this.data.fecha = _data.fecha.replaceAll('/', '-');

      if (this.data.estado_cuenta === "abono") {
        this.estadoForm = this.fb.group({
          pago: new FormControl({value:'', disabled: true}),
          fecha: new FormControl(this.data.fecha, ),
          cantidad: new FormControl('', Validators.min(0)),
        })
      } else {
        this.estadoForm = this.fb.group({
          pago: new FormControl(''),
          fecha: new FormControl(this.data.fecha, ),
          cantidad: new FormControl('', Validators.min(0)),
        })
      }
    this.estadoForm.patchValue(this.data);
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._transalate = this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang);
  }

  ngOnDestroy(): void {
    try {
      this._transalate.unsubscribe();
      this._actualizar.unsubscribe();
    } catch (error) { }
  }

  submit = () => {
    const value = this.estadoForm.value;
    let data: any = {
      id: this.data.id,
      transaccion: this.data.transaccion,
      tipo: this.data.estado_cuenta,
      sitio: this.data.sitio,
      cantidad: value.cantidad,
      fecha: value.fecha,
      descripcion: value.pago
    }
    this._actualizar = this.apiSitio.actualizarSitioEstadoCuenta(data)
      .subscribe(r => {
        if (r.ok) {
          this.notSitio.emitActualizarHistorialChange();
          this.openSnackBar("Registro actualizado", "ok");
        } else {
          this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");
        }
        this.dialogRef.close();
      })
      ;
  }

  private openSnackBar = (m: string, a: string) => this._snackBar.open(m, a, { duration: 5000 })

}
