export interface DeudaI {
  valor: string;
  descripcion: string;
  pagoDesde: Date;
  pagoHasta: Date;
  observaciones: string;
  tipo: string;
}

export interface DeudaRepresentanteI {
  cantidad: string;
  descripcion: string;
  desde: string;
  deuda_total?: string;
  hasta: string;
  id: number;
  motivo: string;
  nombre: string;
  sector: string;
  tipo: string;
  pago?: string;
  estado_cuenta?: string;
}

export interface ResponseDeudaRepresentanteI {
  ok: boolean;
  data?: DeudaRepresentanteI[];
  message?: string;
  cant: number;
}
