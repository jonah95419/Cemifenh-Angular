import { Component } from '@angular/core';
import { SitioService } from './cementerio/sitio/service/sitio.service';
import { RepresentanteService } from './cementerio/representante/service/representante.service';
import { AuthenticationService } from './core/service/authentication.service';
import { tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ValoresService } from './cementerio/admin/service/valores.service';
import { SectorService } from './cementerio/admin/service/sector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'cementerio';

  constructor(
    public authenticationService: AuthenticationService,
    private apiSitios: SitioService,
    private apiValores: ValoresService,
    private apiRepresentantes: RepresentanteService,
    private apiSectores: SectorService,
    private titlePage: Title) {
      //this.titlePage.setTitle("Some title");
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
