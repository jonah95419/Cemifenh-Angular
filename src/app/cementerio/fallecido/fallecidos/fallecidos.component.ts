import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Params, ActivatedRouteSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { FallecidoService } from '../service/fallecido.service';
import { ResponseFallecidoRepresentanteI, FallecidoRepresentanteI } from '../model/fallecido';
import { ServiceC } from '../../sitio/service-c/sitio-serviceC';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatAccordion } from '@angular/material/expansion';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitioService } from '../../sitio/service/sitio.service';
import { ResponseSitioI, SitioI } from '../../sitio/model/sitio';

@Component({
  selector: 'app-fallecidos',
  templateUrl: './fallecidos.component.html',
  styleUrls: ['./fallecidos.component.css']
})
export class FallecidosComponent implements OnInit {

  @ViewChild('accordion_add') accordion: MatAccordion;
  @ViewChild('accordion_edit') accordion_edit: MatAccordion;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  listaFallecidos = [];
  sitios: SitioI[] = [];

  displayedColumns: string[] = ['nombre', 'cedula', 'fecha', 'sector', 'tipo', 'descripcion', 'acciones'];
  dataSource: MatTableDataSource<FallecidoRepresentanteI[]>;

  locale: string;
  id_representante: number;

  fallecidoForm = this.fb.group({
    sitio: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl(''),
    fecha: new FormControl('', Validators.required),
    observaciones: new FormControl(''),
  })

  fallecidoEditForm = this.fb.group({
    id: '',
    sitio: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    cedula: new FormControl(''),
    fecha: new FormControl('', Validators.required),
    observaciones: new FormControl(''),
  })

  private _translate;

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private sc: ServiceC,
    private apiSitio: SitioService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private apiFallecido: FallecidoService) {
    route.snapshot.pathFromRoot.forEach((v: ActivatedRouteSnapshot) => {
      if (v.params.id) {
        this.obtenerValores(v.params.id);
        this.cargarSitios(v.params.id);
      }
    })
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange.pipe(
      tap((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })
    ).toPromise();
  }

  get fallecidoFormControl() {
    return this.fallecidoForm.controls;
  }

  get fallecidoEditFormControl() {
    return this.fallecidoEditForm.controls;
  }

  submit(): void {
    if (this.fallecidoForm.valid) {
      this.apiFallecido.agregarFallecido(this.fallecidoForm.value).pipe(
        tap(data => {
          if (data.ok) {
            this.obtenerValores(this.id_representante);
          } else {
            this.openSnackBar("Error al registrar, puedes intentarlo nuevamente", "ok");
          }
          this.cancelarSubmit();
        })
      ).toPromise();
    }
  }

  cancelarSubmit(): void {
    this.accordion.closeAll();
    this.fallecidoForm.reset();
  }

  editar = (row) => {
    this.fallecidoEditForm.patchValue(row);
    this.accordion_edit.openAll();
  }

  submitEdit(): void {
    if (this.fallecidoEditForm.valid) {
      this.apiFallecido.actualizarFallecido(this.fallecidoEditForm.value.id, this.fallecidoEditForm.value).pipe(
        tap(data => {
          if (data.ok) {
            this.obtenerValores(this.id_representante);
            this.openSnackBar("Registro actualizado", "ok");
          } else {
            this.openSnackBar("Error al actualizar, puedes intentarlo nuevamente", "ok");
          }
          this.cancelarSubmitEdit();
        })
      ).toPromise();
    }
  }

  cancelarSubmitEdit(): void {
    this.accordion_edit.closeAll();
    this.fallecidoEditForm.reset();
  }

  eliminarInformacion(row): void {
    this.apiFallecido.eliminarFallecido(row.id).pipe(
      tap((result: any) => {
        if (result.ok) {
          this.obtenerValores(this.id_representante);
          this.openSnackBar("Registro eliminado", "ok");
        } else {
          this.openSnackBar("Error al eliminar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  private cargarSitios(id: string): void {
    this.apiSitio.listarSitios(id).pipe(
      tap((data: ResponseSitioI) => {
        if (data.ok) { this.sitios = data.data; }
        else { throw new Error(data.message); }
      })
    ).toPromise();
  }

  private obtenerValores(id: number): void {
    this.id_representante = id;
    this.sc.emitIdSitioDetalleChange(null);
    this.apiFallecido.listarFallecidosRepresentante(id).pipe(
      tap((data: ResponseFallecidoRepresentanteI) => {
        if (data.ok) { this.cargarValores(data.data); } else { throw new Error(data.message); }
      })
    ).toPromise();
  }

  private cargarValores(data: FallecidoRepresentanteI[]): void {
    this.listaFallecidos = data.map((data: FallecidoRepresentanteI) => {
      let nuevo: any = data;
      nuevo.hovered;
      return nuevo;
    });
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
    this.dataSource.sort = this.sort;
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
