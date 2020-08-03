export interface DeudaI {
  valorId: number;
  valor: string;
  descripcion: string;
  pagoDesde: Date;
  pagoHasta: Date;
  observaciones: string;
  ingreso: IngresoI;
}

export interface DeudaRepresentanteI {
  cantidad: string;
  descripcion: string;
  desde: string;
  deuda_total: string;
  hasta: string;
  id: number;
  motivo: string;
  nombre: string;
  sector: string;
  tipo: string;
}

export interface ResponseDeudaRepresentanteI {
  ok: boolean;
  data?: DeudaRepresentanteI[];
  message?: string;
  cant: number;
}

export interface IngresoI {
  codigoD: number;
  condigoC: number;
  cant: string;
}
