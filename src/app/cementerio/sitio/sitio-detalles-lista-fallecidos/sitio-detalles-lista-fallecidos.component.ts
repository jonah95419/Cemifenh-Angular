import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FallecidoService } from '../../fallecido/service/fallecido.service';
import { FallecidoI, ResponseFallecidoI } from '../../fallecido/model/fallecido';
import { ServiceC } from '../service-c/sitio-serviceC';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-sitio-detalles-lista-fallecidos',
  templateUrl: './sitio-detalles-lista-fallecidos.component.html',
  styleUrls: ['./sitio-detalles-lista-fallecidos.component.css'],
})

export class SitioDetallesListaFallecidosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['nombre', 'cedula', 'fecha', 'observaciones', 'acciones'];
  dataSource: MatTableDataSource<FallecidoI>;

  id_sitio: string = "";

  listaFallecidos: FallecidoI[] = [];

  constructor(
    private route: ActivatedRoute,
    private sc: ServiceC,
    private fallecidoservice: FallecidoService) {
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.obtenerValores(sitio);
        }
      })
    ).toPromise();
  }

  ngOnInit() {
  }

  private obtenerValores(id_sitio: string) {
    this.id_sitio = id_sitio;
    this.sc.emitIdSitioDetalleChange(Number(id_sitio));
    this.fallecidoservice.listarFallecidos(id_sitio).pipe(
      tap((data: ResponseFallecidoI) => {
        if (data.ok) {
          this.cargarValoresFallecidos(data.data);
        } else {
          console.log(data.message);
        }
      })).toPromise();
  }

  private cargarValoresFallecidos(data: FallecidoI[]) {
    console.log(data);
    this.listaFallecidos = data;
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
