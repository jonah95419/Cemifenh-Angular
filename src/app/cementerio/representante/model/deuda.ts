export interface DeudaI {
  valorId: number;
  valor: string;
  descripcion: string;
  pagoDesde: Date;
  pagoHasta: Date;
  observaciones: string;
  ingreso: IngresoI;
}

export interface IngresoI {
  codigoD: number;
  condigoC: number;
  cant: string;
}
