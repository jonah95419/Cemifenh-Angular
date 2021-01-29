import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SectorI, SectorResponse } from '../model/sector';
import { environment } from '../../../../environments/environment';

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
    .get<SectorResponse>(`${AUTH_SERVER}/sector`)
    .pipe( catchError(this.handleError) )
    .subscribe((data: SectorResponse) => {
      if(data.ok) {
        this.dataStore.sectores = data.data;
        this._sectores.next(Object.assign({}, this.dataStore).sectores);
      }
    })
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'authorization': `Bearer ${localStorage.getItem('access_token')}`
    })
  };

}
