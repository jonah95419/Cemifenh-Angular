import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';
import { tap } from 'rxjs/operators';
import { ResponseDeudaRepresentanteI, DeudaRepresentanteI } from '../model/deuda';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';

@Component({
  selector: 'app-estado-cuenta',
  templateUrl: './estado-cuenta.component.html',
  styleUrls: ['./estado-cuenta.component.css']
})
export class EstadoCuentaComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaEstadoCuenta = [];

  displayedColumns: string[] = ['id', 'nombre', 'sector', 'tipo', 'descripcion', 'pago', 'desde', 'hasta', 'cantidad'];
  dataSource: MatTableDataSource<DeudaRepresentanteI>;

  constructor(
    private sc: ServiceC,
    private route: ActivatedRoute,
    private apiRepresentante: RepresentanteService,
    ) {
      route.parent.params.pipe( tap((data: Params) => {
        if(data.id) {
          this.obtenerValores(data.id);
        }
      })).toPromise();
     }

  ngOnInit() { }

  getTotalEstadoCuenta(): number {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if(new Date(t.desde) > new Date('2001/01/01') ) {if ( t.estado_cuenta === 'deuda' ) { suma += Number(t.cantidad); } else { suma -= Number(t.cantidad); }}});
    return suma;
  }

  getDeudasEstadoCuenta(): number {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.estado_cuenta === 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  getPagosEstadoCuenta(): number {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( t.estado_cuenta !== 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); }});
    return suma;
  }

  private obtenerValores(id: string): void {
    this.sc.emitIdSitioDetalleChange(null);
    this.apiRepresentante.obtenerEstadoCuentaRepresentante(id).pipe(
      tap((data: ResponseDeudaRepresentanteI) => {
        if (data.ok) { this.cargarValores(data.data); } else {alert(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: DeudaRepresentanteI[]): void {
    this.listaEstadoCuenta = data;
    this.dataSource = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSource.sort = this.sort;
  }

}

