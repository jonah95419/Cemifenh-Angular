export interface EstadoCuentaH {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: Date;
  cantidad: string;
  sector?: string;
  estado_cuenta?: string;
  pago?: string;
}
