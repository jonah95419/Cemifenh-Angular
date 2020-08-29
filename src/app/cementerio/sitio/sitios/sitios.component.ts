import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SitioService } from '../service/sitio.service';
import { ResponseSitioI, SitioI } from '../model/sitio';
import { ServiceC } from '../service-c/sitio-serviceC';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-sitios',
  templateUrl: './sitios.component.html',
  styleUrls: ['./sitios.component.css']
})
export class SitiosComponent implements OnInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaSitios: SitioI[] = [];
  verDetalle = false;
  detalle: any;
  sitioId: number;

  locale: string;
  displayedColumns: string[] = [ 'sector', 'tipo', 'descripcion', 'estado', 'adquisicion', 'observaciones'];
  dataSource: MatTableDataSource<any>;

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private sc: ServiceC,
    private apiSitios: SitioService) {
      route.parent.params.pipe( tap((data: Params) => {
        if(data.id) {
          this.obtenerValores(data.id);
        }
      })).toPromise();
      route.firstChild?.queryParams.pipe( tap((data: Params) => {
        if(data.id) {
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

  verDetalles(sitio: any): void {
    this.verDetalle = true;
    this.sitioId = sitio.id;
    this.sc.emitIdSitioDetalleChange(this.sitioId);
  }

  private obtenerValores(id: string): void {
    this.apiSitios.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.cargarValores(data.data); } else { console.log(data.message); }
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
