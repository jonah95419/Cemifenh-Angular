
export interface RepresentanteI {
  id: number;
  nombre: string;
  cedula?: string;
  observaciones?: string;
  fecha?: string;
  estado?: boolean;
  fallecido?: string;
}

export interface RepresentantesResponse {
  cant?: number;
  data?: RepresentanteI[];
  message?: string;
  ok: boolean;
}
