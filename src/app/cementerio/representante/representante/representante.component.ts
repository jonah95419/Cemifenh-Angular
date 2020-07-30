import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';
import { SitioService } from '../../sitio/service/sitio.service';
import { FechasI } from '../../sitio/model/fechas';
import { tap, map, filter } from 'rxjs/operators';
import { RepresentanteI } from '../model/representante';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogRegistroRepresentante } from '../dialog/registro-representante/dialog-registro-representante';

@Component({
  selector: 'app-representante',
  templateUrl: './representante.component.html',
  styleUrls: ['./representante.component.css']
})

export class RepresentanteComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['id', 'nombre', 'cedula', 'fecha', 'accion'];
  displayedColumnsSinSitios: string[] = ['id', 'nombre', 'cedula', 'accion'];
  dataSource: MatTableDataSource<RepresentanteI[]>;
  dataSourceSinSitios: MatTableDataSource<RepresentanteI[]>;

  periodos: FechasI[];

  representante: RepresentanteI;

  locale: string;

  registrosConSitio: boolean = true;
  registroSinSitio: boolean = false;

  private _translate;
  private _periodo: string;
  private listaRepresentantes = [];
  private listaRepresentantesSinSitio = [];

  constructor(
    private translate: TranslateService,
    private apiRepresentantes: RepresentanteService,
    private apiSitios: SitioService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    route.paramMap.subscribe((data: ParamMap) => {
      const periodo = data.get("periodo") ? data.get("periodo") : "todos";
      this.obtenerValoresRepresentantes(periodo);
    })
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verHistorial = (data: RepresentanteI) => {
    this.representante = data;
    this.router.navigateByUrl(`/inicio/representantes/${this._periodo}/historial/${data.id}`);
  }

  nuevoRepresentante = () => {
    const dialogRef = this.dialog.open(DialogRegistroRepresentante, {
      width: '600px',
      data: { name: "nombre", animal: "animal" },
      panelClass: "my-class"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed' + result);
    });
  }

  private obtenerValoresRepresentantes(periodo: string) {
    this.registrosConSitio = false;
    this.registroSinSitio = false;
    this._periodo = periodo;

    if(periodo !== "sinsitios") {
      this.registrosConSitio = true;
      this.cargarValoresRepresentantes([]);
      if (periodo === "todos") {
        this.apiRepresentantes.listarRepresentantes();
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
    } else {
      this.registroSinSitio = true;
      this.cargarValoresRepresentantesSinSitios();
    }
  }

  private cargarValoresRepresentantes(datos: RepresentanteI[]) {
    this.listaRepresentantes = datos;
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private cargarValoresRepresentantesSinSitios() {
    this.apiRepresentantes.listarRepresentantesSinSitio().pipe(
      tap(data => {
        if (data.ok) {
          this.listaRepresentantesSinSitio = data.data;
          this.dataSourceSinSitios = new MatTableDataSource(this.listaRepresentantesSinSitio);
          this.dataSourceSinSitios.paginator = this.paginator;
          this.dataSourceSinSitios.sort = this.sort;
        } else {
          console.log("error: un error al obtener los representantes sin sitios");
        }
      })).toPromise();
  }

}
