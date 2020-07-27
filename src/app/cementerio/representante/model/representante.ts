
export interface RepresentanteI {
  id: number;
  nombre: string;
  cedula: string;
  observaciones?: string;
  fecha?: string;
  estado: boolean;
}

export interface RepresentanteResponse {
  cant: number;
  data: RepresentanteI[];
  ok: boolean;
}
