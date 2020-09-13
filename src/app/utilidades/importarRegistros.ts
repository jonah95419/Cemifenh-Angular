import { SectorI } from '../admin/model/sector';
import { IngresoI, DeudaI } from '../cementerio/representante/model/deuda';
import { RegistroI } from './model/registro';

export class Importacion {

  cantidad: number = 0;

  constructor(private listaSectores: SectorI[], private listaValores: ValorI[]) { }

  generarDeudasRegistro = (registros: RegistroI[]): DeudaI[] => {
    registros = this.asignarColumnas(registros);
    return this.generarDeudas(registros[0]);
  }

  generarDatosImporte = (registros: RegistroI[]): any => {

    registros = this.asignarColumnas(registros);

    let nuevoDataSet = [];

    for (let i = 0; i < registros.length; i++) {

      this.cantidad = Number(registros[i].Total);

      const representante = {
        nombre: registros[i].NombreRepresentante,
        cedula: registros[i].CedulaRepresentante,
        observaciones: registros[i].ObservacionesRepresetante
      }

      const sitio: SitioI = {
        motivo: registros[i].Motivo,
        lugar: registros[i].Lugar,
        sector: this.asignarSector(),
        fechaAdquisicion: registros[i].FechaAdquisicion,
        observaciones: registros[i].ObservacionesSitio,
      }

      const fallecido = {
        nombre: registros[i].NombreFallecido,
        cedula: registros[i].CedulaFallecido,
        fecha: registros[i].FechaFallecimiento,
        observaciones: registros[i].Observaciones
      }

      const deudas = this.generarDeudas(registros[i]);

      nuevoDataSet.push({
        representante,
        sitio,
        fallecido,
        deudas
      });

    }

    return nuevoDataSet;

  };

  private asignarColumnas(registros: RegistroI[]): RegistroI[] {
    for (let i = 0; i < registros.length; i++) {
      registros[i].FechaInicio = registros[i].FechaAdquisicion;
      registros[i].Motivo = registros[i].Motivo.replace(/\s?$/, '');
      registros[i].Lugar = registros[i].Lugar.replace(/\s?$/, '');
    }
    return registros;
  }

  private asignarSector = (): SectorI => this.listaSectores.filter(sector => sector.nombre === 'Sin def.')[0];

  private obtenerValoresServicio(fecha_inicio: any, lugar: string, motivo: string): ValorI[] {
    let valores: ValorI[];
    const fecha = new Date(fecha_inicio);

    if (fecha.getFullYear() <= 2000) {
      for (let i = 0; i < this.listaValores.length; i++) {
        if (Number(this.listaValores[i].anio) === 1999) {
          valores = [this.listaValores[i]];
        }
      }
    } else {
      valores = this.listaValores.filter(valor =>
        Number(valor.anio) === fecha.getFullYear() &&
        (valor.lugar.toLowerCase() == lugar.toLowerCase()) &&
        (valor.motivo.toLowerCase() == motivo.toLowerCase()));
    }
    return valores;
  }

  private obtenerValoresMantenimiento(anio: number): ValorI[] {
    return this.listaValores.filter(valor =>
      Number(valor.anio) === anio &&
      (valor.lugar === 'Cementerio') &&
      (valor.motivo === 'Mantenimiento'));
  }

  private generarDeudas(registro: RegistroI): DeudaI[] {

    let listaDeudas: DeudaI[] = [];
    let valores = this.obtenerValoresServicio(registro.FechaInicio, registro.Lugar, registro.Motivo);
    let inicio_servicio = new Date(registro.FechaInicio);

    while (inicio_servicio < new Date()) {
      let periodo_renovacion_servicio = Number(valores[0].periodo);
      let valor_servicio;
      let culminacion_servicio;
      let i = 0;

      if (periodo_renovacion_servicio !== 0) {
        valor_servicio = valores[0].valor;
      } else {

        if (inicio_servicio.getFullYear() <= 2001) {
          valor_servicio = registro.Total;
        } else {
          valor_servicio = valores[0].valor;
        }

        if (new Date().getFullYear() === inicio_servicio.getFullYear()) {
          periodo_renovacion_servicio = 1;
        } else {
          periodo_renovacion_servicio = new Date().getFullYear() - inicio_servicio.getFullYear();
        }
      }

      if (inicio_servicio.getFullYear() <= 2001) {
        culminacion_servicio = new Date(2001, inicio_servicio.getMonth(), inicio_servicio.getDate());
      } else {
        culminacion_servicio = new Date((inicio_servicio.getFullYear() + periodo_renovacion_servicio), inicio_servicio.getMonth(), inicio_servicio.getDate());
      }

      listaDeudas.push({
        valor: valor_servicio,
        descripcion: 'Servicio',
        pagoDesde: inicio_servicio,
        pagoHasta: culminacion_servicio,
        observaciones: '',
        ingreso: this.generarIngreso(valor_servicio)
      });

      if (inicio_servicio.getFullYear() >= 2001) {

        while (i < periodo_renovacion_servicio) {
          let valoresM = this.obtenerValoresMantenimiento(inicio_servicio.getFullYear() + i);
          let valor_mantenimiento = valoresM[0].valor;
          let periodo_renovacion_mantenimiento = Number(valoresM[0].periodo);

          let inicioM = new Date((inicio_servicio.getFullYear() + i), inicio_servicio.getMonth(), inicio_servicio.getDate());
          let finM = new Date((inicio_servicio.getFullYear() + (i + periodo_renovacion_mantenimiento)), inicio_servicio.getMonth(), inicio_servicio.getDate());

          listaDeudas.push({
            valor: valor_mantenimiento,
            descripcion: 'Mantenimiento',
            pagoDesde: inicioM,
            pagoHasta: finM,
            observaciones: '',
            ingreso: this.generarIngreso(valor_mantenimiento)
          });

          i = i + periodo_renovacion_mantenimiento;
          if ((inicio_servicio.getFullYear() + i) > new Date().getFullYear()) {
            i = i + periodo_renovacion_servicio;
          }

        }
      }
      inicio_servicio = culminacion_servicio;
      valores = this.obtenerValoresServicio(inicio_servicio, registro.Lugar, registro.Motivo);
    }

    if (registro.Motivo === 'Compra') {
      let servicio = true;
      let listaDeudas2 = [];
      listaDeudas.map((value: DeudaI) => {
        if (value.descripcion === 'Mantenimiento' || servicio) {
          listaDeudas2.push(value);
        }
        if (value.descripcion === 'Servicio') {
          servicio = false;
        }
      })
      listaDeudas = listaDeudas2;
    }

    return listaDeudas;
  }

  private generarIngreso(cant: string): IngresoI {
    let ingreso: IngresoI;
    if (this.cantidad >= Number(cant)) {
      ingreso = {
        codigoD: 0,
        condigoC: 0,
        cant: cant
      }
      this.cantidad -= Number(cant);
    } else {
      if (this.cantidad > 0) {
        ingreso = {
          codigoD: 0,
          condigoC: 0,
          cant: String(this.cantidad)
        }
        this.cantidad -= Number(cant);
      }
    }
    return ingreso;
  }

}

interface ValorI {
  id: number;
  anio: string;
  periodo: string;
  motivo: string;
  lugar: string;
  valor: string;
  estado: boolean;
}

interface SitioI {
  motivo: string,
  lugar: string,
  sector: SectorI,
  fechaAdquisicion: Date,
  observaciones: string,
}
