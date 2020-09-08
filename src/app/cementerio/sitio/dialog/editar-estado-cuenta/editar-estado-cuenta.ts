import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectorService } from '../../../../admin/service/sector.service';
import { SitioService } from '../../service/sitio.service';
import { ServiceC } from '../../service-c/sitio-serviceC';

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
export class DialogEstadoCuenta implements OnInit {


  locale: any;

  constructor(
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private apiSitio: SitioService,
    private notSitio: ServiceC,
    private dialogRef: MatDialogRef<DialogEstadoCuenta>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick = (): void => this.dialogRef.close();

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })).toPromise();
  }

  guardarCambios = () => {
    let data: any = {
      id: this.data.id,
      transaccion: this.data.transaccion,
      tipo: this.data.estado_cuenta,
      sitio: this.data.sitio,
      cantidad: this.data.cantidad,
      fecha: this.data.fecha,
      descripcion: this.data.pago
    }
    this.apiSitio.actualizarSitioEstadoCuenta(data).pipe(
      tap(r => {
        if(r.ok) {
          this.notSitio.emitActualizarHistorialChange();
          this.openSnackBar("Registro actualizado", "ok");
        }
        else this.openSnackBar("A ocurrido un error, por favor inténtanlo nuevamente", "ok");

        this.dialogRef.close();
      })
    ).toPromise();
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
