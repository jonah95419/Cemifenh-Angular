export interface EstadoCuentaH {
  id: number;
  tipo: string;
  descripcion: string;
  desde: Date;
  hasta: Date;
  fecha: Date;
  cantidad: string;
  sector?: string;
  estado_cuenta?: string;
  pago?: string;
}
