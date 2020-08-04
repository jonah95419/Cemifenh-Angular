import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ValorI, ValorResponse } from '../model/valor';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ValoresService {

  constructor(private httpClient: HttpClient) { }

  private _valores = new BehaviorSubject<ValorI[]>([]);
  private dataStore: { valores: ValorI[] } = { valores: [] };
  readonly valores = this._valores.asObservable();

  listarValores(): void {
    this.httpClient
      .get<ValorResponse>(`${AUTH_SERVER}/valores/`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: ValorResponse) => {
        if (data.ok) {
          this.dataStore.valores = data.data;
          this._valores.next(Object.assign({}, this.dataStore).valores);
        } else {
          console.log("mostar mensaje de error");
        }
      });
  }

  private _valorExtra = new BehaviorSubject<number>(-1);
  private dataStoreExtra: { id: number } = { id: -1 };
  readonly valorExtra = this._valorExtra.asObservable();

  listarValorPagoExtra(): void {
    this.httpClient
      .get<any>(`${AUTH_SERVER}/valores/extra`, this.httpOptions)
      .pipe(catchError(this.handleError))
      .subscribe((data: any) => {
        if (data.ok) {
          this.dataStoreExtra.id = data.data.id;
          this._valorExtra.next(Object.assign({}, this.dataStoreExtra).id);
        } else {
          console.log(data.message);
        }
      });
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };
}
