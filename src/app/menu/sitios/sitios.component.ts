import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SitioService } from '../../service/sitio.service';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-sitios',
  templateUrl: './sitios.component.html',
  styleUrls: ['./sitios.component.css']
})
export class SitiosComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaSitios = [];
  verDetalle = false;
  idRepresentante: any;
  detalle: any;
  sitioId: number;

  displayedColumns: string[] = ['id', 'nombre', 'sector', 'tipo', 'descripcion', 'estado', 'adquisicion', 'observaciones'];
  dataSource: MatTableDataSource<UserData>;

  private state$: Observable<object>;
  private subscribeSitios: any;

  constructor(private activatedRoute: ActivatedRoute, private sitioservice: SitioService) { }

  ngOnInit() {
    this.state$ = this.activatedRoute.paramMap
      .pipe(map(() => window.history.state));

    this.state$.subscribe((data: any) => {
      if (!data.id) {
        const router = window.location.pathname;
        this.idRepresentante = router.split('/')[2];
      } else {
        this.idRepresentante = data.id;
      }
      this.obtenerValores();
    });

  }

  ngOnDestroy(): void {
    if (this.subscribeSitios !== undefined) {
      this.subscribeSitios.unsubscribe();
    }
  }

  verDetalles(sitio: any) {
    this.verDetalle = true;
    this.sitioId = sitio.id;
  }

  private obtenerValores() {
    this.subscribeSitios = this.sitioservice.listarSitios(this.idRepresentante)
    .subscribe(data => {
      if (data.ok) { this.cargarValores(data); } else {alert(data.message); }
    });
  }

  private cargarValores(data) {
    this.listaSitios = data.data;
    this.dataSource = new MatTableDataSource(this.listaSitios);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    if (this.listaSitios.length <= 2) {this.verDetalles(this.listaSitios[0]); }
  }

}

interface UserData {
  id: string;
  nombre: string;
  cedula: string;
  accion: string;
}
