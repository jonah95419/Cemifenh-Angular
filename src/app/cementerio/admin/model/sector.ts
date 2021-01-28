export interface SectorI {
  id: number;
  nombre: string;
}

export interface SectorResponse {
  ok: boolean;
  data: SectorI[],
  cant: number;
}
