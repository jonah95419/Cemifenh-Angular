
export class Importacion {

  cantidad: number = 0;

  constructor (private listaSectores: SectorI[], private listaValores: ValorI[]) {}

  generarDatosImporte = (registros: RegistroI[]): any => {

    registros = this.asignarColumnas(registros);

    let nuevoDataSet= [];

    for (let i = 0; i < registros.length; i++) {

      this.cantidad = Number(registros[i].Total);

      const comprobante = this.generarComprobante(
        registros[i].NombreRepresentante,
        registros[i].FechaAdquisicion,
        registros[i].Total,
        '');

      const representante = {
        nombre: registros[i].NombreRepresentante,
        cedula: registros[i].CedulaRepresentante,
        observaciones: registros[i].ObservacionesRepresetante
      }

      const sitio: SitioI = {
        nombre: registros[i].Nombre,
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
        comprobante,
        deudas
      });

    }

    return nuevoDataSet;

  };

  private asignarColumnas ( registros: RegistroI[]): RegistroI[] {
    for ( let i=0; i<registros.length; i++) {
      registros[i].FechaInicio = registros[i].FechaAdquisicion;
      registros[i].Motivo = registros[i].Motivo.replace(/\s?$/,'');
      registros[i].Lugar = registros[i].Lugar.replace(/\s?$/,'');
    }
    return registros;
  }

  private asignarSector ( ): SectorI {
    return this.listaSectores.filter ( sector => sector.nombre === 'Sin def.')[0];
  }

  private obtenerValoresServicio (registro: RegistroI): ValorI[] {

    let valores: ValorI[];
    const fecha = new Date(registro.FechaInicio);

    if ( fecha.getFullYear() <= 2000) {
      for ( let i=0; i < this.listaValores.length; i++) {
        if (  Number(this.listaValores[i].anio) === 1999 ) {
          valores = [this.listaValores[i]];
        }
      }
    } else {
      valores = this.listaValores.filter( valor =>
        Number(valor.anio) === fecha.getFullYear() &&
        (valor.lugar.toLowerCase() == registro.Lugar) &&
        (valor.motivo.toLowerCase() == registro.Motivo));
    }
    return valores;
  }

  private obtenerValoresMantenimiento (anio: number): ValorI[] {
    return this.listaValores.filter( valor =>
      Number(valor.anio) === anio &&
      (valor.lugar === 'Cementerio') &&
      (valor.motivo === 'Mantenimiento'));
  }

  private generarComprobante (nombre: string, fecha: Date, total: string, observaciones: string): ComprobanteI {
    return {
      nombre,
      fecha,
      total,
      observaciones,
    }
  }

  private generarDeudas (registro: RegistroI): DeudaI[] {

    let listaDeudas: DeudaI[] = [];
    let valores = this.obtenerValoresServicio(registro);
    let inicioS = new Date(registro.FechaInicio);

    while ( inicioS.getFullYear() < 2020) {
      let servicioId = Number(valores.filter( valor => valor.motivo !== 'Mantenimiento' )[0].id);
      let cantidad = Number(valores.filter( valor => valor.motivo !== 'Mantenimiento' )[0].periodo);
      let servicio;
      let finS;
      let i = 0;

      if ( cantidad !== 0 ) {
        servicio = valores.filter( valor => valor.motivo !== 'Mantenimiento' )[0].valor;
      } else {
        if (inicioS.getFullYear() <= 2000) {
          servicio = registro.Total;
        } else {
          servicio = valores.filter( valor => valor.motivo !== 'Mantenimiento' )[0].valor;
        }
        cantidad = new Date().getFullYear() - inicioS.getFullYear();
      }

      if (inicioS.getFullYear() >= 2001) {
        finS = new Date((inicioS.getFullYear() + cantidad), inicioS.getMonth(), inicioS.getDate());
      } else {
        finS = new Date(2001, inicioS.getMonth(), inicioS.getDate());
      }

      listaDeudas.push({
        valorId: servicioId,
        valor: servicio,
        descripcion: 'Servicio',
        pagoDesde: inicioS,
        pagoHasta: finS,
        observaciones: '',
        ingreso: this.generarIngreso(servicio)
      });

      if (inicioS.getFullYear() >= 2001) {

        while (i < cantidad) {

          let valoresM = this.obtenerValoresMantenimiento(inicioS.getFullYear() + i);

          let mantenimientoId = Number(valoresM.filter( valor => valor.motivo === 'Mantenimiento' )[0].id);
          let mantenimiento = valoresM.filter( valor => valor.motivo === 'Mantenimiento' )[0].valor;
          let cantidadM = Number(valoresM.filter( valor => valor.motivo === 'Mantenimiento' )[0].periodo);

          let inicioM = new Date((inicioS.getFullYear() + i), inicioS.getMonth(), inicioS.getDate());
          let finM = new Date((inicioS.getFullYear() + (i + cantidadM)), inicioS.getMonth(), inicioS.getDate());

          listaDeudas.push({
            valorId: mantenimientoId,
            valor: mantenimiento,
            descripcion: 'Mantenimiento',
            pagoDesde: inicioM,
            pagoHasta: finM,
            observaciones: '',
            ingreso: this.generarIngreso(mantenimiento)
          });

          i = i + cantidadM;
          if ((inicioS.getFullYear() + i) > new Date().getFullYear()) {
            i = i + cantidad;
          }


        }
      }

      inicioS = finS;
      registro.FechaInicio = inicioS;
      valores = this.obtenerValoresServicio(registro);

    }

    return listaDeudas;

  }

  private generarIngreso ( cant: string): IngresoI {
    let ingreso: IngresoI;
    if ( this.cantidad >= Number(cant)) {
      ingreso = {
        codigoD: 0,
        condigoC: 0,
        cant: cant
      }
      this.cantidad -= Number(cant);
    } else {
      if ( this.cantidad > 0) {
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

interface SectorI {
  codigo: number;
  nombre: string;
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

interface RegistroI {
  NombreRepresentante: string;
  CedulaRepresentante: string;
  ObservacionesRepresetante: string;
  NombreFallecido: string;
  CedulaFallecido: string;
  FechaFallecimiento: Date;
  Observaciones: string;
  Nombre: string;
  Motivo: string;
  Lugar: string;
  Sector: string;
  FechaAdquisicion: Date;
  FechaInicio: Date;
  ObservacionesSitio: string;
  Total: string;
}

interface ComprobanteI {
  nombre: string;
  fecha: Date;
  total: string;
  observaciones: string;
}

interface DeudaI {
  valorId: number;
  valor: string;
  descripcion: string;
  pagoDesde: Date;
  pagoHasta: Date;
  observaciones: string;
  ingreso: IngresoI;
}

interface IngresoI {
  codigoD: number;
  condigoC: number;
  cant: string;
}

interface SitioI {
  nombre: string,
  motivo: string,
  lugar: string,
  sector: SectorI,
  fechaAdquisicion: Date,
  observaciones: string,
}
