import { Component } from '@angular/core';
import { SitioService } from './cementerio/sitio/service/sitio.service';
import { RepresentanteService } from './cementerio/representante/service/representante.service';
import { SectorService } from './admin/service/sector.service';
import { ValoresService } from './admin/service/valores.service';
import { AuthenticationService } from './core/service/authentication.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cementerio';

  constructor(
    public authenticationService: AuthenticationService,
    private apiSitios: SitioService,
    private apiValores: ValoresService,
    private apiRepresentantes: RepresentanteService,
    private apiSectores: SectorService) {
    authenticationService.user$.pipe(
      tap((x: any) => {
        const accessToken = localStorage.getItem('access_token');
        if (x && accessToken) {
          apiSitios.listarFechasSitios();
          apiSectores.listarSectores();
          apiValores.listarValores();
          apiValores.listarValorPagoExtra();
          apiRepresentantes.listarRepresentantesTodo();
        }
      })
    ).toPromise();

  }

}
