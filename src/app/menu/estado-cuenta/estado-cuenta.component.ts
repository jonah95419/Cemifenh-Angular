import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RepresentanteService } from '../../service/representante.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-estado-cuenta',
  templateUrl: './estado-cuenta.component.html',
  styleUrls: ['./estado-cuenta.component.css']
})
export class EstadoCuentaComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaEstadoCuenta = [];
  idRepresentante: any;

  displayedColumns: string[] = ['id', 'nombre', 'sector', 'tipo', 'descripcion', 'pago', 'desde', 'hasta', 'cantidad'];
  dataSource: MatTableDataSource<DeudaI>;

  private state$: Observable<object>;
  private subscribeEstadoCuenta: any;

  constructor(private activatedRoute: ActivatedRoute, private representanteservice: RepresentanteService) { }

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
    if (this.subscribeEstadoCuenta !== undefined) {
      this.subscribeEstadoCuenta.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTotalEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if(new Date(t.desde) > new Date('2001/01/01') ) {if ( t.estado_cuenta === 'deuda' ) { suma += Number(t.cantidad); } else { suma -= Number(t.cantidad); }}});
    return suma;
  }

  getDeudasEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.estado_cuenta === 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  getPagosEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.estado_cuenta !== 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  private obtenerValores() {
    this.subscribeEstadoCuenta = this.representanteservice.obtenerEstadoCuentaRepresentante(this.idRepresentante)
    .subscribe(data => {
      if (data.ok) { this.cargarValores(data.data); } else {alert(data.message); }
    });
  }

  private cargarValores(data:DeudaI[]) {
    this.listaEstadoCuenta = data;
    this.dataSource = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSource.sort = this.sort;
  }

}

export interface DeudaI {
  id: number;
  nombre: string;
  desde: Date;
  hasta: Date;
  pago: string;
  cantidad: string;
  descripcion: string;
  sector: string;
  tipo: string;
  estado_cuenta: string;
}
