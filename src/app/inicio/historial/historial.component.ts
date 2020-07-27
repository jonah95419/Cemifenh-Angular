import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepresentanteService } from '../../cementerio/representante/service/representante.service';
import { EstadoCuentaH } from '../../cementerio/representante/model/estadoCuentaR';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  displayedColumnsEC: string[] = [ 'descripcion', 'desde', 'hasta', 'cantidad', 'accion', 'eliminar'];

  dataSourceEC: MatTableDataSource<EstadoCuentaH>;

  listaEstadoCuenta: EstadoCuentaH[] = [];

  id: string;

  constructor(
    private apiRepresentante: RepresentanteService,
    private route: ActivatedRoute ) {
      route.paramMap.subscribe((data: ParamMap) => {
        const representante = data.get("id");
        this.obtenerHistorial(representante);
      })
    }

  ngOnInit(): void {
  }

  getTotalEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach( t => { if ( new Date(t.desde) > new Date('2001/01/01') ) { if ( t.estado_cuenta === 'deuda' ) { suma += Number(t.cantidad); } else { suma -= Number(t.cantidad); } } });
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

  private obtenerHistorial(id: string) {
    this.id = id;
    this.apiRepresentante.obtenerEstadoCuentaRepresentante(id).pipe(
      tap( data => {
        if (data.ok) { this.cargarValoresEstadoCuenta(data.data); }
        else { alert(data.message); }
      })
    ).toPromise();
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaH[]) {
    this.listaEstadoCuenta = data;
    this.dataSourceEC = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSourceEC.paginator = this.paginator;
    this.dataSourceEC.sort = this.sort;
  }

}
