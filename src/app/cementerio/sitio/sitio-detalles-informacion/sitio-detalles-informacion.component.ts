import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';
import { SitioService } from '../service/sitio.service';
import { SitioI, ResponseSitioI } from '../model/sitio';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { SectorI } from '../../../admin/model/sector';
import { ServiceC } from '../service-c/sitio-serviceC';
import { ValoresService } from '../../../admin/service/valores.service';
import { SectorService } from '../../../admin/service/sector.service';
@Component({
  selector: 'app-sitio-detalles-informacion',
  templateUrl: './sitio-detalles-informacion.component.html',
  styleUrls: ['./sitio-detalles-informacion.component.css']
})
export class SitioDetallesInformacionComponent implements OnInit {

  listaSectores: SectorI[];
  listaTipo: string[] = ['arriendo', 'compra', 'donacion', 'Arriendo', 'Compra', 'Donacion'];
  listaDescripcion: string[] = ['boveda', 'lote propio', 'piso', 'Boveda', 'Lote propio', 'Piso'];

  informacionSitio: SitioI;

  sitioForm = this.fb.group({
    sector: new FormControl({ value: '' }),
    nombre: new FormControl(''),
    observaciones: new FormControl(''),
    tipo: new FormControl({ value: '', disabled: true }),
    descripcion: new FormControl({ value: '', disabled: true }),
    adquisicion: new FormControl({ value: '', disabled: true }),
  })

  constructor(
    private fb: FormBuilder,
    private sc: ServiceC,
    private route: ActivatedRoute,
    private apiSitios: SitioService,
    private apiSector: SectorService) {
    apiSector.sectores.pipe(tap((data: SectorI[]) => this.listaSectores = data)).toPromise();
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.obtenerValores(sitio);
        }
      })
    ).toPromise();
  }

  ngOnInit() { }

  private obtenerValores(id_sitio: string) {
    this.sc.emitIdSitioDetalleChange(Number(id_sitio));
    this.apiSitios.obtenerSitio(id_sitio).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) {
          this.cargarValores(data.data[0]);
        } else {
          console.log(data.message);
        }
      })).toPromise();
  }

  private cargarValores(data: SitioI) {
    if (data) {
      this.informacionSitio = data;
      this.sitioForm.patchValue(data);
    }
  }

}
