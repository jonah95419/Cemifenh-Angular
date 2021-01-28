import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';
import { tap, map, filter } from 'rxjs/operators';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { RepresentanteI } from 'src/app/cementerio/representante/model/representante';
import { FechasI } from '../../sitio/model/fechas';
import { RepresentanteService } from '../../representante/service/representante.service';
import { SitioService } from '../../sitio/service/sitio.service';
import { DialogRegistroRepresentante } from '../../representante/dialog/registro-representante/dialog-registro-representante';

@Component({
  selector: 'app-representante',
  templateUrl: './representante.component.html',
  styleUrls: ['./representante.component.css']
})

export class RepresentanteComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['nombre', 'cedula', 'fecha'];
  displayedColumnsSinSitios: string[] = ['nombre', 'cedula'];
  dataSource: MatTableDataSource<RepresentanteI[]>;
  dataSourceSinSitios: MatTableDataSource<RepresentanteI[]>;

  periodos: FechasI[];

  representante: string = null;

  locale: string;

  private _translate;
  private _periodo: string;
  private listaRepresentantes = [];

  constructor(
    private translate: TranslateService,
    private apiRepresentantes: RepresentanteService,
    private apiSitios: SitioService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef) { }

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

  ngAfterViewInit() {
    this.route.paramMap.subscribe((data: ParamMap) => {
      const periodo = data.get("periodo") ? data.get("periodo") : "todos";
      this.obtenerValoresRepresentantes(periodo);
    });

    this.cdRef.detectChanges();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verHistorial = (data: string): void => {
    this.representante = data;
    this.router.navigateByUrl(`/inicio/representantes/${this._periodo}/historial/${btoa(String(this.representante))}`);
  }

  nuevoRepresentante = (): void => {
    const dialogRef = this.dialog.open(DialogRegistroRepresentante, { width: '600px', panelClass: "my-class" });
    dialogRef.afterClosed().subscribe();
  }

  refrescarRegistros(): void {
    this.obtenerValoresRepresentantes(this._periodo);
  }

  private obtenerValoresRepresentantes(periodo: string): void {
    this._periodo = periodo;

    if (this.route.firstChild) {
      this.route.firstChild.paramMap.pipe(tap((data: Params) => {
        if (data.params.id && this.representante === null) {
          this.representante = atob(data.params.id);
        }
      })).toPromise();
    }

    this.cargarValoresRepresentantes([]);
    if (periodo === "todos") {
      this.apiRepresentantes.listarRepresentantesTodo();
      this.apiRepresentantes.representantes.pipe(
        tap((data: RepresentanteI[]) => this.cargarValoresRepresentantes(data))
      ).toPromise();
    } else {
      this.apiSitios.fechas.pipe(
        map((data: FechasI[]) => data.find(f => f.title.toString() === periodo.toString())),
        filter(Boolean),
        tap((data: FechasI) => {
          this.apiRepresentantes.listarRepresentantesPeriodo(data.desde, data.hasta);
          this.apiRepresentantes.representantes.pipe(
            tap((data: RepresentanteI[]) => this.cargarValoresRepresentantes(data))
          ).toPromise();
        })
      ).toPromise();
    }

  }

  private cargarValoresRepresentantes(datos: RepresentanteI[]): void {
    this.listaRepresentantes = datos;
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
