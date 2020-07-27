export interface EstadoCuentaH {
  id: number;
  tipo: string;
  descripcion: string;
  desde: Date;
  hasta: Date;
  cantidad: string;
  estado_cuenta?: string;
}
