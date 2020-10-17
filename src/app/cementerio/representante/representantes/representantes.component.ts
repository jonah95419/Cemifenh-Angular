import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RepresentanteService } from '../service/representante.service';
import { tap } from 'rxjs/operators';
import { RepresentanteI } from '../model/representante';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogRegistroRepresentante } from '../dialog/registro-representante/dialog-registro-representante';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-representantes',
  templateUrl: './representantes.component.html',
  styleUrls: ['./representantes.component.css']
})
export class RepresentantesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;


  displayedColumns: string[] = ['nombre', 'cedula'];

  dataSource: MatTableDataSource<RepresentanteI>;

  representante: RepresentanteI;

  sitio_id: number = -1;

  private listaRepresentantes: RepresentanteI[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiRepresentantes: RepresentanteService,
    private dialog: MatDialog,
    private sc: ServiceC,
    private _snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) {
    this.representante = null;
    sc.sitioDetalle$.pipe(tap((sitio: number) => this.sitio_id = sitio)).toPromise();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
  }

  ngAfterViewInit() {

    this.obtenerValoresRepresentantes();
    this.cdRef.detectChanges();
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
    this.router.navigateByUrl(`/representantes/registro/${data.id}`);
    this.sc.emitIdSitioDetalleChange(null);
  }

  nuevoRepresentante = (): void => {
    const dialogRef = this.dialog.open(DialogRegistroRepresentante, { width: '600px', panelClass: "my-class" });
    dialogRef.afterClosed().subscribe();
  }

  eliminarRepresentante = () => {
    this.apiRepresentantes.eliminarRepresentante(this.representante.id).pipe(
      tap((x: any) => {
        if(x.ok) {
          this.openSnackBar('Representante eliminado.', 'ok');
          this.router.navigate(['/representantes']).then(e => window.location.reload());
        }
        else { this.openSnackBar('A ocurrido un error, puedes intentarlo nuevamente en unos instantes.', 'ok'); }
      })
    ).toPromise()
  }

  refrescarRegistros = (): void => this.obtenerValoresRepresentantes();

  cargarDetalles(detalle: string) {
    this.router.navigateByUrl(`/representantes/registro/${this.representante.id}/` + detalle, {
      state: {
        id: this.representante.id,
      }
    }).then(e => { });
  }

  private obtenerValoresRepresentantes(): void {
    this.apiRepresentantes.listarRepresentantesTodo();
    this.apiRepresentantes.representantes.pipe(
      tap((data: RepresentanteI[]) => this.cargarValoresRepresentantes(data)),
    ).toPromise();
  }

  private cargarValoresRepresentantes(datos: RepresentanteI[]): void {
    this.listaRepresentantes = datos;
    this.dataSource = new MatTableDataSource(this.listaRepresentantes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.route.firstChild) {
      if (this.listaRepresentantes.length !== 0) {
        this.route.firstChild.params.pipe(tap(data => this.cargarRepresentante(data.id))).toPromise();
      }
    }
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

  private cargarRepresentante(id: number): void {
    const value = this.listaRepresentantes.find((r: RepresentanteI) => r.id == id);
    if (value) { this.representante = value; }
  }

}
