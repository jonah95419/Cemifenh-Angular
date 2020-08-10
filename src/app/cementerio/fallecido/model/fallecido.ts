export interface FallecidoI {
  sitio: number;
  nombre: string;
  cedula: string;
  fecha: Date;
  observaciones: string;
}

export interface ResponseFallecidoI {
  ok: boolean;
  data?: FallecidoI[];
  cant?: number;
  message?: string;
}

export interface FallecidoRepresentanteI {
  id: number;
  nombre: string;
  cedula: string;
  fecha: Date;
  observaciones: string;
  sector: string;
  sitio: string;
  tipo: string;
  descripcion: string;
  adquisicion: Date;
}

export interface ResponseFallecidoRepresentanteI {
  ok: boolean;
  data?: FallecidoRepresentanteI[];
  cant?: number;
  message?: string;
}
