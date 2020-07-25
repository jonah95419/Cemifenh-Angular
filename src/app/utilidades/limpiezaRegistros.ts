
export class Limpieza {

  constructor(){
  }

  limpiarRegistros (listaRegistros: []): any {

    let registrosValidos: RegistroI[] = [];
    let registrosInvalidos: RegistroI[] = [];

    listaRegistros.forEach ( (registro: any) => {

      let registroI: RegistroI;
      const FechaAdquisicion = this.limpiarFechaAdquisicion(registro);
      const FechaFallecimiento = this.limpiarFechaFallecido(registro);
      const Motivo = this.limpiarMotivo(registro);
      const Lugar = this.limpiarLugar(registro);

      if (String(Lugar.lugar).toLowerCase() === 'piso propio') {
        Motivo.ok = true;
        Motivo.motivo = 'propio';
      }
      registroI = {
        NombreRepresentante: registro.NombreRepresentante,
        CedulaRepresentante: registro.CedulaRepresentante,
        ObservacionesRepresentante: registro.ObservacionesRepresentante,
        NombreFallecido: registro.NombreFallecido,
        CedulaFallecido: registro.CedulaFallecido,
        FechaFallecimiento: FechaFallecimiento.fecha,
        Observaciones: registro.Observaciones,
        Nombre: registro.Nombre,
        Sector: registro.Sector,
        Motivo: Motivo.motivo,
        Lugar: Lugar.lugar,
        FechaAdquisicion: FechaAdquisicion.fecha,
        Total: registro.Total,
        ObservacionesSitio: registro.ObservacionesSitio,
        ObservacionesRegistro: []
      }

      if(FechaAdquisicion.ok && Motivo.ok && Lugar.ok) {
        registrosValidos.push(registroI);
      } else {
        if (!FechaAdquisicion.ok) {
          registroI.ObservacionesRegistro.push(FechaAdquisicion.mensaje);
        }
        if (!Motivo.ok) {
          registroI.ObservacionesRegistro.push(Motivo.mensaje);
        }
        if (!Lugar.ok) {
          registroI.ObservacionesRegistro.push(Lugar.mensaje);
        }
        registrosInvalidos.push(registroI);
      }

    });
    return {
      registrosValidos, registrosInvalidos
    }
  }

  private limpiarFechaAdquisicion ( registro ) {
    if ( typeof(registro.FechaAdquisicion) === 'string'){
      if (registro.FechaAdquisicion !== '') {
        let fecha = new Date(registro.FechaAdquisicion.split('/')[2], Number(registro.FechaAdquisicion.split('/')[1]) -1 , registro.FechaAdquisicion.split('/')[0]);
        if ( fecha.toString() !== 'Invalid Date') {
          return {ok: true, fecha: fecha, mensaje:''}
        } else {
          return {ok: false, fecha: registro.FechaAdquisicion, mensaje: 'Error en la fecha, formato incorrecto dd/mm/aaaa'}
        }
      } else {
        return {ok: false, fecha: registro.FechaAdquisicion, mensaje: 'Sin fecha de adquisicion'}
      }
    } else {
      return {ok: true, fecha: this.SerialDateToJSDate(registro.FechaAdquisicion), mensaje:''}
    }
  }

  private limpiarFechaFallecido ( registro ) {
    if ( typeof(registro.FechaFallecimiento) === 'string'){
      if (registro.FechaFallecimiento !== '') {
        let fecha = new Date(registro.FechaFallecimiento.split('/')[2], Number(registro.FechaFallecimiento.split('/')[1]) -1 , registro.FechaFallecimiento.split('/')[0]);
        if ( fecha.toString() !== 'Invalid Date') {
          return {ok: true, fecha: fecha, mensaje:''}
        } else {
          return {ok: true, fecha: registro.FechaFallecimiento, mensaje: 'Error en la fecha, formato incorrecto dd/mm/aaaa'}
        }
      } else {
        return {ok: true, fecha: registro.FechaFallecimiento, mensaje: 'Sin fecha de adquisicion'}
      }
    } else {
      return {ok: true, fecha: this.SerialDateToJSDate(registro.FechaFallecimiento), mensaje:''}
    }
  }

  private limpiarMotivo (registro) {
    if(registro.Motivo === '') {
      return {ok: false, motivo: registro.Motivo, mensaje: 'Motivo no especificado'}
    } else {
      if (String(registro.Motivo).toLowerCase() === 'ariendo ' || String(registro.Motivo).toLowerCase() === 'ariendo' || String(registro.Motivo).toLowerCase() === 'arrriendo') {
        registro.Motivo = 'Arriendo';
      }
      if (String(registro.Lugar).toLowerCase() === 'piso propio' || String(registro.Lugar).toLowerCase() === 'piso arriendo') {
        registro.Motivo = 'Propio';
      }
      if (String(registro.Lugar).toLowerCase() === 'boveda') {
        registro.Motivo = 'Arriendo';
      }
      return {ok: true, motivo: String(registro.Motivo).toLowerCase(), mensaje:''}
    }
  }

  private limpiarLugar (registro) {
    if(registro.Lugar === '') {
      return {ok: false, lugar: registro.Lugar, mensaje: 'Lugar no especificado'}
    } else {
      if (String(registro.Lugar).toLowerCase() === 'propio' || String(registro.Lugar).toLowerCase() === 'piso arriendo' || String(registro.Lugar).toLowerCase() === 'psio propio') {
        registro.Lugar = 'piso propio';
      }
      if (String(registro.Lugar).toLowerCase() === 'pios' || String(registro.Lugar).toLowerCase() === 'pis') {
        registro.Lugar = 'piso';
      }
      return {ok: true, lugar: String(registro.Lugar).toLowerCase(), mensaje:''}
    }
  }

  private SerialDateToJSDate(serialDate) {
    var days = Math.floor(serialDate);
    var hours = Math.floor((serialDate % 1) * 24);
    var minutes = Math.floor((((serialDate % 1) * 24) - hours) * 60)
    return new Date(Date.UTC(0, 0, serialDate, hours-17, minutes));
  }

}

interface RegistroI {
  NombreRepresentante: string;
  CedulaRepresentante: string;
  ObservacionesRepresentante: string;
  NombreFallecido: string;
  CedulaFallecido: string;
  FechaFallecimiento: Date;
  Observaciones: string;
  Nombre: string;
  Motivo: string;
  Lugar: string;
  Sector: string;
  FechaAdquisicion: string;
  Total: number;
  ObservacionesSitio: string;
  ObservacionesRegistro: string[];
}
