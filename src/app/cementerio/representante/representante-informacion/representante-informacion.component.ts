import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepresentanteService } from '../service/representante.service';
import { RepresentanteI } from '../model/representante';
import { map, tap } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-representante-informacion',
  templateUrl: './representante-informacion.component.html',
  styleUrls: ['./representante-informacion.component.css']
})
export class RepresentanteInformacionComponent implements OnInit {

  detalle: string = 'sitios';

  representanteForm = this.fb.group({
    id: new FormControl({ value: '', disabled: true }),
    nombre: new FormControl(''),
    cedula: new FormControl('', Validators.min(0)),
  })

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiRepresentantes: RepresentanteService) {
    route.paramMap.pipe(tap((data: ParamMap) => {
      if (data.get("id")) {
        this.obtenerValores(Number(data.get("id")))
      }
    })).toPromise();
  }

  ngOnInit() { }

  private obtenerValores(id: number) {
    if (id) {
      this.apiRepresentantes.representantes.pipe(
        map((data: RepresentanteI[]) => data.find((d: RepresentanteI) => d.id == id)),
        tap((data: RepresentanteI) => this.cargarRepresentante(data))
      ).toPromise();
    }
  }

  private cargarRepresentante(r: RepresentanteI): void {
    if (r) {
      this.representanteForm.patchValue(r);
    }
  }

}

