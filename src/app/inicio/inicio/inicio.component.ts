import { Component, OnInit } from '@angular/core';
import { SitioService } from '../../cementerio/sitio/service/sitio.service';
import { tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(public apiSitios: SitioService, private titleService:Title) {
    this.titleService.setTitle("SIC - Inicio");
  }

  ngOnInit(): void {
  }

}
