import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { RepresentanteService } from '../service/representante.service';

@Component({
  selector: 'app-deudas',
  templateUrl: './deudas.component.html',
  styleUrls: ['./deudas.component.css']
})
export class DeudasComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaDeudas = [];
  idRepresentante: any;

  displayedColumnsD: string[] = ['id', 'nombre', 'sector', 'tipo', 'descripcion', 'motivo', 'deuda_total', 'desde', 'hasta', 'cantidad'];
  dataSourceD: MatTableDataSource<DeudaI>;

  private state$: Observable<object>;
  private subscribeDeudas: any;

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
    if (this.subscribeDeudas !== undefined) {
      this.subscribeDeudas.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceD.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceD.paginator) {
      this.dataSourceD.paginator.firstPage();
    }
  }

  getTotalDeudas() {
    return this.listaDeudas.map(t => Number(t.cantidad)).reduce((acc, value) => acc + value, 0);
  }

  private obtenerValores() {
    this.subscribeDeudas = this.representanteservice.obtenerDeudasRepresentante(this.idRepresentante)
    .subscribe(data => {
      if (data.ok) { this.cargarValores(data.data); } else {alert(data.message); }
    });
  }

  private cargarValores(data:DeudaI[]) {
    this.listaDeudas = data;
    this.dataSourceD = new MatTableDataSource(this.listaDeudas);
    this.dataSourceD.sort = this.sort;
  }

}

export interface DeudaI {
  id: number;
  nombre: string;
  desde: string;
  hasta: string;
  deuda_total: string;
  cantidad: string;
  descripcion: string;
  sector: string;
  tipo: string;
  motivo: string;
}
