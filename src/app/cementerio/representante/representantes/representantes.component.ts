import { Component, OnInit, ViewChild } from '@angular/core';
import { RepresentanteService } from '../service/representante.service';
import { tap } from 'rxjs/operators';
import { RepresentanteI } from '../model/representante';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogRegistroRepresentante } from '../dialog/registro-representante/dialog-registro-representante';

@Component({
  selector: 'app-representantes',
  templateUrl: './representantes.component.html',
  styleUrls: ['./representantes.component.css']
})
export class RepresentantesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = [ 'nombre', 'cedula', 'accion'];

  dataSource: MatTableDataSource<RepresentanteI[]>;

  representante: RepresentanteI;

  private listaRepresentantes = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiRepresentantes: RepresentanteService,
    private dialog: MatDialog,
  ) { this.obtenerValoresRepresentantes(); }

  ngOnInit(): void {
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalles = (data: RepresentanteI): void => {
    this.representante = data;
    this.router.navigateByUrl(`/representantes/registro/${data.id}/sitios`);
  }

  nuevoRepresentante = (): void => {
    const dialogRef = this.dialog.open(DialogRegistroRepresentante, { width: '600px', panelClass: "my-class" });
    dialogRef.afterClosed().subscribe();
  }

  refrescarRegistros(): void { this.obtenerValoresRepresentantes(); }

  cargarDetalles(detalle: string) {
    this.router.navigateByUrl(`/representantes/registro/${this.representante.id}/` + detalle, { state: {
      id: this.representante.id,
    }}).then(e => {});
  }

  private obtenerValoresRepresentantes(): void {
    this.apiRepresentantes.representantes.pipe(
      tap((data: RepresentanteI[]) => this.cargarValoresRepresentantes(data)),
    ).toPromise();
  }

  private cargarValoresRepresentantes(datos: RepresentanteI[]): void {
    this.listaRepresentantes = datos;
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if(this.route.firstChild) {
      if(this.listaRepresentantes.length !== 0) {
        this.route.firstChild.params.pipe(tap(data => this.cargarRepresentante(data.id))).toPromise();
      }
    }

  }

  private cargarRepresentante(id: number): void {
    const value = this.listaRepresentantes.find((r: RepresentanteI) =>  r.id == id );
    if(value) { this.representante = value; }
  }

}
