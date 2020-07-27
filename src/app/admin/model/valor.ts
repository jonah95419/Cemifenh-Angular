export interface ValorI {
  id: number;
  anio: string;
  periodo: string;
  motivo: string;
  lugar: string;
  valor: string;
  estado: boolean;
}

export interface ValorResponse {
  cant: number;
  ok: boolean;
  data: ValorI[];
}
