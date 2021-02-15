import { Component } from '@angular/core';
import { RepresentanteService } from './cementerio/representante/service/representante.service';
import { AuthenticationService } from './core/service/authentication.service';
import { tap } from 'rxjs/operators';
import { ValoresService } from './cementerio/admin/service/valores.service';
import { SectorService } from './cementerio/admin/service/sector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    public authenticationService: AuthenticationService,
    private apiValores: ValoresService,
    private apiRepresentantes: RepresentanteService,
    private apiSectores: SectorService) {
    authenticationService.user$.pipe(
      tap((x: any) => {
        const accessToken = localStorage.getItem('access_token');
        if (x && accessToken) {
          apiSectores.listarSectores();
          apiValores.listarValores();
          apiRepresentantes.listarRepresentantesTodo();
        }
      })
    ).toPromise();

  }

}
