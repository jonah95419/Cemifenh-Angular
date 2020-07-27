import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SectorI, SectorResponse } from '../model/sector';

const AUTH_SERVER = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class SectorService {

  constructor(private httpClient: HttpClient) { }

  private _sectores = new BehaviorSubject<SectorI[]>([]);
  private dataStore: { sectores: SectorI[] } = { sectores: [] };
  readonly sectores = this._sectores.asObservable();

  //revisar imprtacion
  listarSectores = () => {
    this.httpClient
    .get<SectorResponse>(`${AUTH_SERVER}/sector`, this.httpOptions)
    .pipe( catchError(this.handleError) )
    .subscribe((data: SectorResponse) => {
      if(data.ok) {
        this.dataStore.sectores = data.data;
        this._sectores.next(Object.assign({}, this.dataStore).sectores);
      } else {
        console.log("mostar mensaje de error");
      }
    })
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
