import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';
import { RepresentanteI } from '../model/representante';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-representante-informacion',
  templateUrl: './representante-informacion.component.html',
  styleUrls: ['./representante-informacion.component.css']
})
export class RepresentanteInformacionComponent implements OnInit {

  representante: Observable<RepresentanteI>;

  detalle: string = 'sitios';

  constructor(
    private route: ActivatedRoute,
    private apiRepresentantes: RepresentanteService) {
    route.paramMap.pipe( tap((data: ParamMap) => {
      if(data.get("id")) {
        this.obtenerValores(Number(data.get("id")))
      }
    })).toPromise();
  }

  ngOnInit() { }

  private obtenerValores(id: number) {
    if (id) {
      this.representante = this.apiRepresentantes.representantes.pipe(
        map((data: RepresentanteI[]) => data.find((d: RepresentanteI) => d.id == id)),
      );
    }
  }

}

