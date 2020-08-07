import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import { tap } from 'rxjs/operators';
import { FallecidoService } from '../service/fallecido.service';
import { ResponseFallecidoRepresentanteI, FallecidoRepresentanteI } from '../model/fallecido';

@Component({
  selector: 'app-fallecidos',
  templateUrl: './fallecidos.component.html',
  styleUrls: ['./fallecidos.component.css']
})
export class FallecidosComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  listaFallecidos = [];

  displayedColumns: string[] = ['id', 'nombre', 'cedula', 'fecha', 'sector', 'tipo', 'descripcion'];
  dataSource: MatTableDataSource<FallecidoRepresentanteI[]>;

  constructor(
    private route: ActivatedRoute,
    private apiFallecidos: FallecidoService) {
    route.parent.params.pipe(tap((data: Params) => {
      if (data.id) {
        this.obtenerValores(data.id);
      }
    })).toPromise();
  }

  ngOnInit() { }

  private obtenerValores(id: number):void {
    this.apiFallecidos.listarFallecidosRepresentante(id).pipe(
      tap((data: ResponseFallecidoRepresentanteI) => {
        if (data.ok) { this.cargarValores(data.data); } else { console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: FallecidoRepresentanteI[]):void {
    this.listaFallecidos = data;
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
    this.dataSource.sort = this.sort;
  }

}
