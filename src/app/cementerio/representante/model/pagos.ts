export class PagoDetallesI {
  id: number;
  desde: Date;
  hasta: Date;
  pago: string;
  cantidad: string;
  sector: string;
  tipo: string;
  descripcion: string;
}

export class PagoI {
  id: number;
  fecha: Date;
  cantidad: string;
  representante: string;
  observaciones: string;
  usuario: string;
}

export class PagoDetallesRepresentanteI {
  id: number;
  desde: Date;
  hasta: Date;
  pago: string;
  cantidad: string;
  sector: string;
  tipo: string;
  descripcion: string;
}

export interface ResponsePagosDetallesRepresentanteI {
  ok: boolean;
  data?: PagoDetallesRepresentanteI[];
  cant?: number;
  message?: string;
}

export class PagosRepresentanteI {
  id: number;
  fecha: Date;
  cantidad: string;
  representante: string;
  observaciones: string;
  usuario: string;
}

export interface ResponsePagosRepresentanteI {
  ok: boolean;
  data?: PagosRepresentanteI[];
  cant?: number;
  message?: string;
}
