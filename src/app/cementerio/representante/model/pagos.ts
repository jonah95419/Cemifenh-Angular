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
