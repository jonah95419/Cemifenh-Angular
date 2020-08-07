import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RepresentanteService } from '../service/representante.service';
import { DeudaRepresentanteI, ResponseDeudaRepresentanteI } from '../model/deuda';

@Component({
  selector: 'app-deudas',
  templateUrl: './deudas.component.html',
  styleUrls: ['./deudas.component.css']
})
export class DeudasComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaDeudas: DeudaRepresentanteI[] = [];

  displayedColumnsD: string[] = ['id', 'nombre', 'sector', 'tipo', 'descripcion', 'motivo', 'deuda_total', 'desde', 'hasta', 'cantidad'];

  dataSourceD: MatTableDataSource<DeudaRepresentanteI>;

  constructor(
    private route: ActivatedRoute,
    private apiRepresentante: RepresentanteService) {
      route.parent.params.pipe( tap((data: Params) => {
        if(data.id) {
          this.obtenerValores(data.id);
        }
      })).toPromise();
     }

  ngOnInit() {
  }

  getTotalDeudas = ():number => this.listaDeudas.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);

  private obtenerValores(id: string): void {
    this.apiRepresentante.obtenerDeudasRepresentante(id).pipe(
      tap((data: ResponseDeudaRepresentanteI) => {
        if (data.ok) { this.cargarValores(data.data); } else {console.log(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: DeudaRepresentanteI[]): void {
    this.listaDeudas = data;
    this.dataSourceD = new MatTableDataSource(this.listaDeudas);
    this.dataSourceD.sort = this.sort;
  }

}
