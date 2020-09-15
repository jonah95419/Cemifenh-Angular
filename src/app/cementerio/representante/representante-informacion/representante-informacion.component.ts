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
  representante: RepresentanteI;

  representanteForm = this.fb.group({
    id: '',
    nombre: new FormControl('', Validators.required),
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

  submit = () => {
    if(this.representanteForm.valid) {
      this.apiRepresentantes.actualizarRepresentante(this.representanteForm.value.id, this.representanteForm.value)
    }
  }

  get representanteFormControls() {
    return this.representanteForm.controls;
  }

  private obtenerValores(id: number) {
    if (id) {
      this.apiRepresentantes.representantes.pipe(
        map((data: RepresentanteI[]) => data.find((d: RepresentanteI) => d.id == id)),
        tap((data: RepresentanteI) => this.cargarRepresentante(data))
      ).toPromise();
    }
  }

  private cargarRepresentante(r: RepresentanteI): void {
    this.representante = r;
    if (r) {
      this.representanteForm.patchValue(r);
    }
  }

}

