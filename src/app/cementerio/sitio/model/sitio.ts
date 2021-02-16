export interface SitioI {
  adquisicion: Date;
  descripcion: string;
  deuda: string;
  id: number;
  nombre: string;
  observaciones: string;
  sector: string;
  tipo: string;
}

export interface ResponseSitioI {
  ok: boolean;
  cant?: number;
  data?: SitioI[];
  message?: string;
}

export interface DeudaSitioI {
  desde: string;
  descripcion: string;
  deuda_actual: string;
  deuda_total: string;
  hasta: string;
  id: number;
}

export interface ResponseDeudaSitioI {
  data?: DeudaSitioI[];
  ok: boolean;
  cant?: number;
  message?: string;
}

export interface EstadoCuentaI {
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
  deuda? : number;
}

export interface ResponseEstadoCuentaSitioI {
  ok: boolean;
  data?: EstadoCuentaI[];
  cant?: number;
  message?: string;
}
