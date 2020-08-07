import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { tap } from 'rxjs/operators';
import { RepresentanteService } from '../service/representante.service';
import { PagoDetallesI, PagoI, ResponsePagosRepresentanteI, PagosRepresentanteI, ResponsePagosDetallesRepresentanteI, PagoDetallesRepresentanteI } from '../model/pagos';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  listaPagos: PagosRepresentanteI[] = [];
  listaPagoDetalles: PagoDetallesRepresentanteI[] = [];

  verDetalle:boolean = false;
  detalle: any;
  comprobante: any;

  displayedColumnsP: string[] = ['id', 'fecha', 'cantidad'];
  displayedColumnsPD: string[] = ['id', 'sector', 'tipo', 'descripcion', 'pago', 'desde', 'hasta', 'cantidad'];

  dataSourceP: MatTableDataSource<PagoI>;
  dataSourcePD: MatTableDataSource<PagoDetallesI>;

  constructor(
    private route: ActivatedRoute,
    private apiRepresentante: RepresentanteService) {
    route.parent.params.pipe(tap((data: Params) => {
      if (data.id) {
        this.obtenerValores(data.id);
      }
    })).toPromise();
  }

  ngOnInit() { }

  verDetalles(comprobante: PagoI) {
    this.verDetalle = true;
    this.comprobante = comprobante;
    this.obtenerValoresPagoDetalles(this.comprobante.id);
  }

  getTotalPagos = (): number => this.listaPagos.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);

  getTotalPagosDetalles = (): number => this.listaPagoDetalles.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);

  private obtenerValores(id: string) {
    this.apiRepresentante.obtenerPagosRepresentante(id).pipe(
      tap((data: ResponsePagosRepresentanteI) => {
        if (data.ok) { this.cargarValores(data.data); } else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: PagosRepresentanteI[]) {
    this.listaPagos = data;
    this.dataSourceP = new MatTableDataSource(this.listaPagos);
    this.dataSourceP.sort = this.sort;
    if (this.listaPagos.length > 0) { this.verDetalles(this.listaPagos[0]); }
  }

  private obtenerValoresPagoDetalles(comprobanteId: string) {
    this.apiRepresentante.obtenerPagoDetallesRepresentante(comprobanteId).pipe(
      tap((data: ResponsePagosDetallesRepresentanteI) => {
        if (data.ok) { this.cargarValoresPagoDetalles(data.data); } else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarValoresPagoDetalles(data: PagoDetallesRepresentanteI[]) {
    this.listaPagoDetalles = data;
    this.dataSourcePD = new MatTableDataSource(this.listaPagoDetalles);
    this.dataSourcePD.sort = this.sort;
  }

}
