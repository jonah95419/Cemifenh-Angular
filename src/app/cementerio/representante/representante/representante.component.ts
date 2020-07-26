import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';

export interface UserData {
  id: string;
  nombre: string;
  cedula: string;
  accion: string;
}

@Component({
  selector: 'app-representante',
  templateUrl: './representante.component.html',
  styleUrls: ['./representante.component.css']
})

export class RepresentanteComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['id', 'nombre', 'cedula', 'accion'];
  dataSource: MatTableDataSource<UserData>;

  private listaRepresentantes = [];

  private subscribeRepresentantes: any;

  constructor(private representanteservice: RepresentanteService, private router: Router) {}

  ngOnInit() {
    this.obtenerValoresRepresentantes();
  }

  ngOnDestroy(): void {
    if (this.subscribeRepresentantes !== undefined) {
      this.subscribeRepresentantes.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verRepresentante = (data: any) => this.router.navigateByUrl(`/informacion-representante/${data.id}`);

  private obtenerValoresRepresentantes() {
    this.subscribeRepresentantes = this.representanteservice.listarRepresentantes()
    .subscribe(data => {
      if (data.ok) {this.cargarValoresRepresentantes(data.data); } else {alert(data.message); }
    });
  }

  private cargarValoresRepresentantes(datos) {
    this.listaRepresentantes = datos;
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
