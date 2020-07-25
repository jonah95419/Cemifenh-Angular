import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent implements OnInit {

  public title = 'Cemifenh';
  public opcionSeleccionada = 'Representantes';

  constructor() { }

  ngOnInit() {
    this.identificarOpcion();
  }

  private identificarOpcion(): void {
    const router = window.location.pathname;
    if (router.split('/')[1] === 'representantes' || router.split('/')[1] === 'informacion-representante' ) {
      this.opcionSeleccionada = 'Representantes';
    }
    if (router.split('/')[1] === 'administracion' ) {
      this.opcionSeleccionada = 'Administracion';
    }
  }



}
