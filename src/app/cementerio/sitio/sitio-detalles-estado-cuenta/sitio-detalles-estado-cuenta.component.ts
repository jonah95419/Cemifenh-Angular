import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ServiceC } from '../service-c/sitio-serviceC';
import { SitioI, ResponseSitioI, ResponseEstadoCuentaSitioI, EstadoCuentaI } from '../model/sitio';
import { SitioService } from '../service/sitio.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-sitio-detalles-estado-cuenta',
  templateUrl: './sitio-detalles-estado-cuenta.component.html',
  styleUrls: ['./sitio-detalles-estado-cuenta.component.css']
})
export class SitioDetallesEstadoCuentaComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumnsEC: string[] = ['id', 'descripcion', 'desde', 'hasta', 'cantidad'];
  dataSource: MatTableDataSource<EstadoCuentaI>;

  id_sitio: string = "";

  listaEstadoCuenta: EstadoCuentaI[] = [];

  constructor(
    private route: ActivatedRoute,
    private sc: ServiceC,
    private apiSitios: SitioService,) {
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.obtenerValores(sitio);
        }
      })).toPromise();
  }

  ngOnInit() {
  }

  getTotalEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach(t => { if (new Date(t.desde) > new Date('2001/01/01')) { if (t.tipo === 'deuda') { suma += Number(t.cantidad); } else { suma -= Number(t.cantidad); } } });
    return suma;
  }

  getDeudasEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.tipo === 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); } });
    return suma;
  }

  getPagosEstadoCuenta() {
    let suma = 0;
    this.listaEstadoCuenta.forEach(t => { if (t.tipo !== 'deuda' && (new Date(t.desde) > new Date('2001/01/01'))) { suma += Number(t.cantidad); } });
    return suma;
  }

  private obtenerValores(id_sitio: string) {
    this.id_sitio = id_sitio;
    this.sc.emitIdSitioDetalleChange(Number(id_sitio));
    this.apiSitios.obtenerEstadoCuenta(id_sitio).pipe(
      tap((data: ResponseEstadoCuentaSitioI) => {
        if (data.ok) {
          this.cargarValoresEstadoCuenta(data.data);
        } else {
          console.log(data.message);
        }
      })).toPromise();
  }

  private cargarValoresEstadoCuenta(data: EstadoCuentaI[]) {
    console.log(data);
    this.listaEstadoCuenta = data;
    this.dataSource = new MatTableDataSource(this.listaEstadoCuenta);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
