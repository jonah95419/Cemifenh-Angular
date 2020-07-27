import { Component, OnInit } from '@angular/core';
import { SitioService } from '../../cementerio/sitio/service/sitio.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(public apiSitios: SitioService) { }

  ngOnInit(): void {
  }

}
