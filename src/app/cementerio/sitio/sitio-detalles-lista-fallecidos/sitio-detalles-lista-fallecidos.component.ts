import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FallecidoService } from '../../fallecido/service/fallecido.service';
import { FallecidoI, ResponseFallecidoI } from '../../fallecido/model/fallecido';
import { ServiceC } from '../service-c/sitio-serviceC';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';
import { FormControl, FormBuilder } from '@angular/forms';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-sitio-detalles-lista-fallecidos',
  templateUrl: './sitio-detalles-lista-fallecidos.component.html',
  styleUrls: ['./sitio-detalles-lista-fallecidos.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-EC' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})

export class SitioDetallesListaFallecidosComponent implements OnInit, OnDestroy {

  @ViewChild('accordion_add') accordion: MatAccordion;
  @ViewChild('accordion_edit') accordion2: MatAccordion;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['nombre', 'cedula', 'fecha', 'observaciones', 'acciones'];
  dataSource: MatTableDataSource<FallecidoI>;

  id_sitio: string = "";
  nuevo: boolean = false;

  listaFallecidos: FallecidoI[] = [];

  fallecidoForm = this.fb.group({
    sitio: this.id_sitio,
    nombre: new FormControl(''),
    cedula: new FormControl(''),
    fecha: new FormControl(new Date()),
    observaciones: new FormControl(''),
  })

  fallecidoForm2 = this.fb.group({
    id: new FormControl(''),
    sitio: new FormControl(''),
    nombre: new FormControl(''),
    cedula: new FormControl(''),
    fecha: new FormControl(new Date()),
    observaciones: new FormControl(''),
  })

  locale: string;

  private _translate;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private sc: ServiceC,
    private _snackBar: MatSnackBar,
    private apiFallecido: FallecidoService) {
    route.queryParamMap.pipe(
      tap((data: ParamMap) => {
        if (data.get("id")) {
          const sitio = data.get("id");
          this.fallecidoForm.controls.sitio.setValue(sitio);
          this.obtenerValores(sitio);
        }
      })
    ).toPromise();
  }

  ngOnInit() {
    this.locale = this.translate.currentLang;
    this._translate = this.translate.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => { this.locale = langChangeEvent.lang; })

  }

  ngOnDestroy(): void {
    if (this._translate !== undefined) {
      this._translate.unsubscribe();
    }
  }

  submit(): void {
    this.apiFallecido.agregarFallecido(this.fallecidoForm.value).pipe(
      tap(data => {
        if (data.ok) {
          this.nuevoRegistro(data.data.id, this.fallecidoForm.value);
        } else {
          this.openSnackBar("Error al registrar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  cancelarSubmit(): void {
    this.accordion.closeAll();
    this.nuevo = false;
    this.fallecidoForm.reset();
    this.fallecidoForm.controls.sitio.setValue(this.id_sitio);
    this.fallecidoForm.controls.fecha.setValue(new Date());
  }

  editarInformacion(row: FallecidoI): void {
    this.accordion2.openAll();
    this.fallecidoForm2.patchValue(row);
  }

  cancelarEdit(): void {
    this.accordion2.closeAll();
  }

  submitEdit(): void {
    let row: FallecidoI = this.fallecidoForm2.value;
    this.apiFallecido.actualizarFallecido(row.id, row).pipe(
      tap(data => {
        if (data.ok) {
          this.registroActualizado(row);
        } else {
          this.openSnackBar("Error al actualizar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  eliminarInformacion(row: FallecidoI): void {
    this.apiFallecido.eliminarFallecido(row.id).pipe(
      tap((result: any) => {
        if (result.ok) {
          this.registroEliminado(row.id);
        } else {
          this.openSnackBar("Error al eliminar, puedes intentarlo nuevamente", "ok");
        }
      })
    ).toPromise();
  }

  private nuevoRegistro(id: number, fallecido: any): void {
    let nuevo_registro: any = {};
    nuevo_registro = fallecido;
    nuevo_registro.id = id;
    this.listaFallecidos.push(nuevo_registro);
    this.cargarValoresFallecidos(this.listaFallecidos);
    this.openSnackBar("Registro guardado", "ok");
    this.cancelarSubmit();
  }

  private registroActualizado( registro: FallecidoI) {
    this.listaFallecidos = this.listaFallecidos.map((v: FallecidoI) => {
      if(v.id === registro.id) {
        v = registro;
      }
      return v;
    });
    this.cargarValoresFallecidos(this.listaFallecidos);
    this.openSnackBar("Registro actualizado", "ok");
    this.cancelarEdit();
  }

  private registroEliminado(id: number): void {
    this.openSnackBar("Registro eliminado", "ok");
    this.listaFallecidos = this.listaFallecidos.filter((data: FallecidoI) => data.id !== id);
    this.cargarValoresFallecidos(this.listaFallecidos);
  }

  private obtenerValores(id_sitio: string): void {
    this.id_sitio = id_sitio;
    this.sc.emitIdSitioDetalleChange(Number(id_sitio));
    this.apiFallecido.listarFallecidos(id_sitio).pipe(
      tap((data: ResponseFallecidoI) => {
        if (data.ok) {
          this.cargarValoresFallecidos(data.data);
        } else {
          console.log(data.message);
        }
      })).toPromise();
  }

  private cargarValoresFallecidos(data: FallecidoI[]): void {
    this.listaFallecidos = data.map((value: FallecidoI) => {
      let nuevo: any = value;
      nuevo.hovered = false;
      return nuevo;
    });
    this.dataSource = new MatTableDataSource(this.listaFallecidos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private openSnackBar = (message: string, action: string) => {
    this._snackBar.open(message, action, { duration: 5000 });
  }

}
