import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { SitioService } from '../service/sitio.service';
import { SitioI, ResponseSitioI } from '../model/sitio';
import { FormControl, FormBuilder } from '@angular/forms';
import { ServiceC } from '../service-c/sitio-serviceC';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectorI } from '../../admin/model/sector';
import { SectorService } from '../../admin/service/sector.service';

@Component({
  selector: 'app-sitio-detalles-informacion',
  templateUrl: './sitio-detalles-informacion.component.html',
  styleUrls: ['./sitio-detalles-informacion.component.css']
})
export class SitioDetallesInformacionComponent implements OnInit {

  listaSectores: SectorI[];
  listaTipo: string[] = ['Arriendo', 'Compra', 'Donación'];
  listaDescripcion: string[] = ['Bóveda', 'Lote propio', 'Piso'];

  id_sitio: string = "";

  sitioForm = this.fb.group({
    id: new FormControl(''),
    sector: new FormControl({ value: '' }),
    nombre: new FormControl({ value: '', disabled: false }),
    observaciones: new FormControl(''),
    tipo: new FormControl({ value: '', disabled: false }),
    descripcion: new FormControl({ value: '', disabled: false }),
    adquisicion: new FormControl({ value: '', disabled: false }),
  })

  constructor(
    private fb: FormBuilder,
    private sc: ServiceC,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,
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

  submit() {
    this.apiSitios.actualizarSitio(this.sitioForm.value).pipe(
      tap(result => {
        if (result.ok) {
          this.openSnackBar("Registro actualizado", "ok");
        } else {
          this.openSnackBar("Error al actualizar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  eliminarSitio = () => {
    const currentUrl: string = this.router.url;
    const ruta: string = currentUrl.split('sitios')[0].toString();

    this.apiSitios.eliminarSitio(this.id_sitio).pipe(
      tap((x: any) => {
        if (x.ok) {
          this.openSnackBar("Registro eliminado", "ok");
          this.router.navigate([ruta]);
          this.sc.emitIdSitioDetalleChange(null);
        } else {
          this.openSnackBar("Error al eliminar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  private obtenerValores(id_sitio: string) {
    this.id_sitio = id_sitio;
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
      if(data.tipo.toLowerCase() === 'donacion' || data.tipo.toLowerCase() === 'donación' ) data.tipo = 'Donación';

      if(data.tipo.toLowerCase() === 'arriendo' ) data.tipo = 'Arriendo';

      if(data.tipo.toLowerCase() === 'compra' ) data.tipo = 'Compra';

      if(data.descripcion.toLowerCase() === 'boveda' || data.descripcion.toLowerCase() === 'bóveda') data.descripcion = 'Bóveda';

      if(data.descripcion.toLowerCase() === 'lote propio') data.descripcion = 'Lote propio';

      if(data.descripcion.toLowerCase() === 'piso') data.descripcion = 'Piso';

      this.sitioForm.patchValue(data);
    }
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
