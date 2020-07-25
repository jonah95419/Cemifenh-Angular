import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ValoresService } from '../../service/valores.service';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-precios',
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.css']
})
export class PreciosComponent implements OnInit, OnDestroy {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaValores: ValorI[];

  displayedColumns: string[] = [
    'id',
    'anio',
    'periodo',
    'motivo',
    'lugar',
    'valor',
    'acciones'
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
    this.subscribeValores = this.valoresservice.listarValores().subscribe( data => { if (data.ok ) {this.cargarValores(data.data); } else { alert( data.message); }});
  }

  private cargarValores( data: ValorI[]) {
    this.listaValores = data;
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

}

interface ValorI {
  valor_id: number;
  anio: string;
  periodo: string;
  motivo: string;
  lugar: string;
  valor: string;
  estado: boolean;
}
