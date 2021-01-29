import { Component, OnInit, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SitioService } from '../../sitio/service/sitio.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActualizacionService } from '../../admin/service/actualizacion.service';
import { merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  private dialogRef;

  constructor(public apiSitios: SitioService, private titleService: Title, private dialog: MatDialog, private apiActualizacion: ActualizacionService) {
    this.titleService.setTitle("SICDMIN - Inicio");
  }

  ngOnInit(): void {



  }

  ngAfterViewInit() {
    merge()
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.apiActualizacion.listarActualizacion();
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.cant;
          return data.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return of([]);
        })
      ).subscribe((data: any) => {
        if (data.length > 0)
          this.dialogRef = this.dialog.open(DialogActualizacion, { disableClose: true, data });
      });
  }

}


@Component({
  selector: 'dialog-actualizacion',
  templateUrl: './dialog-actualizacion.html',
})
export class DialogActualizacion implements OnInit {

  columnasCargosNuevos: string[] = ['fecha', 'descripcion', 'cantidad'];
  columnasCargosActuales: string[] = ['fecha', 'descripcion', 'cantidad', 'estado'];

  locale: string;

  private _translate: any;

  constructor(@Inject(MAT_DIALOG_DATA) public registros: any, private translate: TranslateService,) { }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => this.locale = langChangeEvent.lang)
  }

  ngOnDestroy(): void {
    try {
      this._translate.unsubscribe();
    } catch (error) { }
  }


}
