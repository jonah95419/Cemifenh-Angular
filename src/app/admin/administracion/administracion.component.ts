import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdministracionComponent implements OnInit, OnDestroy {

  detalle = 'lista-precios';
  detalles = 'Lista de precios';

  constructor(private router: Router) { }

  ngOnInit() {
    const router = window.location.pathname;
    this.cargarDetalles(router.split('/')[2]);
  }

  ngOnDestroy(): void {}

  cargarDetalles(detalle) {
    if (detalle === undefined) {
      detalle = 'lista-precios';
    }
    if ( detalle === 'lista-precios') {
      this.detalles = 'Lista de precios';
    }
    if ( detalle === 'importar-datos') {
      this.detalles = 'Importar datos';
    }
    if ( detalle === 'copia-seguridad') {
      this.detalles = 'Copia de seguridad';
    }
    this.detalle = detalle;
    this.router.navigateByUrl('/administracion/' + this.detalle).then(e => {});
  }

}
