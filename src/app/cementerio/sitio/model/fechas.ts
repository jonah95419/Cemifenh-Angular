export interface FechasI {
  desde: string;
  hasta: string;
  title: string;
}

export interface FechasResponse {
  cant: number;
  data: FechasI[];
  ok: boolean;
}
