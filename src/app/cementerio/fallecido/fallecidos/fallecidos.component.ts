import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { FallecidoService } from '../service/fallecido.service';
import { DeudaI } from '../../representante/model/deuda';

@Component({
  selector: 'app-fallecidos',
  templateUrl: './fallecidos.component.html',
  styleUrls: ['./fallecidos.component.css']
})
export class FallecidosComponent implements OnInit {

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  listaFallecidos = [];
  idRepresentante: any;

  displayedColumns: string[] = ['id', 'nombre', 'cedula', 'fecha',  'sector', 'tipo', 'descripcion', 'adquisicion'];
  dataSource: MatTableDataSource<DeudaI>;

  private state$: Observable<object>;
  private subscribeFallecidos: any;

  constructor(private activatedRoute: ActivatedRoute, private fallecidoservice: FallecidoService) { }

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
    if (this.subscribeFallecidos !== undefined) {
      this.subscribeFallecidos.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private obtenerValores() {
    this.subscribeFallecidos = this.fallecidoservice.listarFallecidosRepresentante(this.idRepresentante)
    .subscribe(data => {
      if (data.ok) { this.cargarValores(data.data); } else {alert(data.message); }
    });
  }

  private cargarValores(data:DeudaI[]) {
    this.listaFallecidos = data;
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
    this.dataSource.sort = this.sort;
  }

}
