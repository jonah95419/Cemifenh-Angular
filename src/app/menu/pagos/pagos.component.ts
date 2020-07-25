import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { RepresentanteService } from '../../service/representante.service';
import { ActivatedRoute } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaPagos = [];
  listaPagoDetalles = [];
  verDetalle = false;
  idRepresentante: any;
  detalle: any;
  comprobante: any;

  displayedColumnsP: string[] = ['id', 'fecha', 'cantidad'];
  displayedColumnsPD: string[] = ['id', 'sector', 'tipo', 'descripcion', 'pago', 'desde', 'hasta', 'cantidad'];
  dataSourceP: MatTableDataSource<PagoI>;
  dataSourcePD: MatTableDataSource<PagoDetallesI>;

  private state$: Observable<object>;
  private subscribePagos: any;
  private subscribePagoDetalles: any;

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
    if (this.subscribePagos !== undefined) {
      this.subscribePagos.unsubscribe();
    }
    if (this.subscribePagoDetalles !== undefined) {
      this.subscribePagoDetalles.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceP.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceP.paginator) {
      this.dataSourceP.paginator.firstPage();
    }
  }

  verDetalles(comprobante: PagoI) {
    this.verDetalle = true;
    this.comprobante = comprobante;
    this.obtenerValoresPagoDetalles(this.comprobante.id);
  }

  getTotalPagos() {
    return this.listaPagos.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  getTotalPagosDetalles() {
    return this.listaPagoDetalles.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  private obtenerValores() {
    this.subscribePagos = this.representanteservice.obtenerPagosRepresentante(this.idRepresentante)
    .subscribe(data => {
      if (data.ok) { this.cargarValores(data.data); } else {alert(data.message); }
    });
  }

  private cargarValores(data: PagoI[]) {
    this.listaPagos = data;
    this.dataSourceP = new MatTableDataSource(this.listaPagos);
    this.dataSourceP.sort = this.sort;
    if (this.listaPagos.length > 0) { this.verDetalles(this.listaPagos[0]); }
  }

  private obtenerValoresPagoDetalles(comprobanteId: number) {
    this.subscribePagoDetalles = this.representanteservice.obtenerPagoDetallesRepresentante(comprobanteId)
    .subscribe( data => {
      if ( data.ok) {this.cargarValoresPagoDetalles(data.data); } else { alert(data.message); }
    })
  }

  private cargarValoresPagoDetalles(data: PagoDetallesI[]) {
    this.listaPagoDetalles = data;
    this.dataSourcePD = new MatTableDataSource(this.listaPagoDetalles);
    this.dataSourcePD.sort = this.sort;
  }

}

export class PagoDetallesI {
  id: number;
  desde: Date;
  hasta: Date;
  pago: string;
  valor: string;
  observaciones: string;
  sector: string;
  descripcion: string;
}

export class PagoI {
  id: number;
  fecha: Date;
  cantidad: string;
  representante: string;
  observaciones: string;
  usuario: string;
}
