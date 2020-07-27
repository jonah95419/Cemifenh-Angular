import { Component } from '@angular/core';
import { SitioService } from './cementerio/sitio/service/sitio.service';
import { RepresentanteService } from './cementerio/representante/service/representante.service';
import { SectorService } from './admin/service/sector.service';
import { ValoresService } from './admin/service/valores.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cementerio';

  constructor(
    private apiSitios: SitioService,
    private apiValores: ValoresService,
    private apiSectores: SectorService) {
    apiSitios.listarFechasSitios();
    apiSectores.listarSectores();
    apiValores.listarValores();
  }

}
