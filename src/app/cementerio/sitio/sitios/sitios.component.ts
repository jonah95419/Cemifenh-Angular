import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SitioService } from '../service/sitio.service';
import { ResponseSitioI, SitioI } from '../model/sitio';
import { ServiceC } from '../service-c/sitio-serviceC';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MatDialog } from '@angular/material/dialog';
import { DialogRegistrarSitio } from '../dialog/registrar-sitio/registrar-sitio';
import { RepresentanteService } from '../../representante/service/representante.service';

@Component({
  selector: 'app-sitios',
  templateUrl: './sitios.component.html',
  styleUrls: ['./sitios.component.css'],
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
export class SitiosComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['sector', 'tipo', 'descripcion', 'adquisicion', 'observaciones'];
  listaSitios: SitioI[] = [];

  sitioId: number;
  representante: number = null;
  locale: string;
  dataSource: MatTableDataSource<any>;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private sc: ServiceC,
    private dialog: MatDialog,
    private apiSitios: SitioService,
    private apiRepresentante: RepresentanteService) {
    route.snapshot.pathFromRoot.forEach((v: ActivatedRouteSnapshot) => {
      if (v.params.id) {
        this.obtenerValores(v.params.id);
      }
    })
    route.firstChild?.queryParams.pipe(tap((data: Params) => {
      if (data.id) {
        this.sitioId = data.id;
      }
    })).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  agregarSitio = () => {
    const dialogRef = this.dialog.open(DialogRegistrarSitio, { width: '500px', panelClass: "my-class", data: this.representante });
    dialogRef.afterClosed().pipe(
      tap(x => {
        if (x.ok) { this.obtenerValores(this.representante); }
      })
    ).toPromise();
  }

  verDetalles(sitio: any): void {
    this.sitioId = sitio.id;
    this.sc.emitIdSitioDetalleChange(this.sitioId);
    this.router.navigate([`./representantes/registro/${this.representante}/sitios/informacion`], { queryParams: { id: this.sitioId } });
  }

  private obtenerValores(id: number): void {
    this.representante = id;
    this.apiSitios.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.cargarValores(data.data); } else { throw new Error(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: SitioI[]): void {
    this.listaSitios = data;
    this.dataSource = new MatTableDataSource(this.listaSitios);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
