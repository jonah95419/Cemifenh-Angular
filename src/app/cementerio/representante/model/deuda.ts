export interface CargoSitioI {
  id: number;
  descripcion: string;
  transaccion: number;
  fecha: Date;
  deuda: number;
  pendiente: number;
  sitio: number;
  abono?: number;
}

export interface DeudaI {
  valor: string;
  descripcion: string;
  pagoDesde: Date;
  pagoHasta: Date;
  observaciones: string;
  tipo: string;
}

export interface ResponseCargosSitioI {
  ok: boolean;
  data?: CargoSitioI[];
  message?: string;
  cant?: number;
}


export interface EstadoCuentaH {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: Date;
  cantidad: string;
  sector?: string;
  estado_cuenta?: string;
  pago?: string;
  sitio?: number;
  pendiente?: number;
  deuda?: number;
  observaciones?: string;
}


export interface ResponseDeudaRepresentanteI {
  ok: boolean;
  data?: EstadoCuentaH[];
  message?: string;
  cant?: number;
}
