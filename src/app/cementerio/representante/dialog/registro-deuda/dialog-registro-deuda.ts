import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SitioService } from '../../../sitio/service/sitio.service';
import { ResponseSitioI, SitioI } from '../../../sitio/model/sitio';
import { tap } from 'rxjs/operators';
import { ValoresService } from '../../../../admin/service/valores.service';
import { ValorResponse, ValorI } from '../../../../admin/model/valor';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'dialog-registro-deuda',
  templateUrl: 'dialog-registro-deuda.html',
  styleUrls: ['./dialog-registro-deuda.css'],
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
export class DialogRegistroDeuda implements OnInit, OnDestroy {

  sitios: SitioI[] = [];
  valores: ValorI[] = [];
  motivos: string[] = [];

  sitio: SitioI;
  locale: string;

  private _translate;

  constructor(
    private apiSitio: SitioService,
    private apiValores: ValoresService,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<DialogRegistroDeuda>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
      this.cargarValores(data.id);
  }

  onNoClick(): void { this.dialogRef.close(); }

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

  sitioSeleccionado(event: MatSelectChange): void {
    const sitio = event.source.value;
    this.sitio = sitio;
    console.log(sitio);
  }

  aniosDeudas(): string[] {
    let lista: string[] = [];
    this.valores.forEach( v => { if(!lista.includes(v.anio) && v.anio) lista.push(v.anio) });
    return lista;
  }

  anioSeleccionado(event: MatSelectChange): void {
    const value = event.source.value;
    if(value) {
      this.cargarMotivos(value);
    }
  }

  private cargarMotivos(anio: string): void {
    this.motivos = [];
    this.valores.forEach( v => { if(!this.motivos.includes(v.motivo) && v.motivo && v.anio === anio) this.motivos.push(v.motivo) });
  }

  private cargarValores(id: string):void {
    this.cargarSitios(id);
    this.cargarListaValores(id);
  }

  private cargarSitios(id: string): void {
    this.apiSitio.listarSitios(id).pipe(
      tap( (data: ResponseSitioI) => {
        if(data.ok) { this.sitios = data.data; }
        else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarListaValores(id: string): void {
    this.apiValores.valores.pipe(
      tap( (data: ValorI[]) => this.valores = data )
    ).toPromise();
  }

}
