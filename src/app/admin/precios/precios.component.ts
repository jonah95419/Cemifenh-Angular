import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ValoresService } from '../service/valores.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ValorI } from '../model/valor';

@Component({
  selector: 'app-precios',
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.css']
})
export class PreciosComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaValores: ValorI[];

  displayedColumns: string[] = [
    'anio',
    'periodo',
    'motivo',
    'lugar',
    'valor'
  ];

  dataSource: MatTableDataSource<ValorI>;

  private subscribeValores: any;

  constructor(private valoresservice: ValoresService) { }

  ngOnInit() {
    this.obtenerValores();
  }

  ngOnDestroy(): void {
    if (this.subscribeValores != undefined ) {
      this.subscribeValores.unsubscribe();
    }
  }

  private obtenerValores() {
    this.subscribeValores = this.valoresservice.valores.subscribe( data => this.cargarValores(data));
  }

  private cargarValores( data: ValorI[]) {
    this.listaValores = data;
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

}
