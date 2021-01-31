import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { LOGO } from './value.const';

export class LogoClass {

  private ruta_logo: string = LOGO;

  private _logo = new BehaviorSubject<string>("");
  private dataStore: { logo: string } = { logo: "" };
  readonly logo = this._logo.asObservable();

  constructor(private http: HttpClient) { }

  public getLogo = () => {
    this.http.get(this.ruta_logo + '', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.readAsDataURL(res);
        reader.onload = () => {
          this.dataStore.logo = reader.result as string;
          this._logo.next(Object.assign({}, this.dataStore).logo);
        };
        reader.onerror = (error) => {
          throw new Error(error + "");
        };
      })

  }
}
