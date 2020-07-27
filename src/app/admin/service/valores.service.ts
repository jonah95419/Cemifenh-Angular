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
    .pipe( catchError(this.handleError) )
    .subscribe((data: ValorResponse) => {
      if(data.ok) {
        this.dataStore.valores = data.data;
        this._valores.next(Object.assign({}, this.dataStore).valores);
      } else {
        console.log("mostar mensaje de error");
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    return throwError('Algo a salido mal, puedes intentarlo nuevamente!');
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      // 'authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).stsTokenManager.accessToken}`
    })
  };
}
