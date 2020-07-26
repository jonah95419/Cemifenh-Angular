import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';

@Component({
  selector: 'app-representante-informacion',
  templateUrl: './representante-informacion.component.html',
  styleUrls: ['./representante-informacion.component.css']
})
export class RepresentanteInformacionComponent implements OnInit, OnDestroy {

  informacionRepresentante: RepresentanteI;
  detalle = 'sitios';
  private idRepresentante: any;
  private subscribeRepresentante: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private representanteservice: RepresentanteService) {
    this.idRepresentante = activatedRoute.snapshot.params['id'];
  }

  ngOnInit() {
    this.obtenerValores();
    const router = window.location.pathname;
    this.cargarDetalles(router.split('/')[3]);
  }

  ngOnDestroy(): void {
    if (this.subscribeRepresentante !== undefined) {
      this.subscribeRepresentante.unsubscribe();
    }

  }

  cargarDetalles(detalle) {
    if (detalle === undefined) {
      detalle = 'sitios';
    }
    this.detalle = detalle;
    this.router.navigateByUrl('/informacion-representante/' + this.idRepresentante + '/' + detalle, { state: {
      id: this.idRepresentante,
    }}).then(e => {});
  }

  listarRepresentantes(): void {
    this.router.navigateByUrl('/representantes').then(e => {});
  }

  private obtenerValores() {
    if (this.idRepresentante !== undefined || this.idRepresentante) {
      this.subscribeRepresentante = this.representanteservice.obtenerRepresentante(this.idRepresentante)
      .subscribe(data => {
        if (data.ok) {this.cargarValores(data.data[0]); } else {alert(data.message); }
      });
    }
  }

  private cargarValores(data: RepresentanteI) {
    this.informacionRepresentante = data;
  }

}

export class RepresentanteI {
  id: number;
  nombre: string;
  cedula: string;
  observaciones: string;
  estado: boolean;
}
