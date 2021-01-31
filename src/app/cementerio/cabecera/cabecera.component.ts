import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../core/service/authentication.service';
import { TITLE, LOGO } from '../../utilidades/value.const';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent implements OnInit {

  title = TITLE;
  logo: string = LOGO;

  constructor(public apiAuth: AuthenticationService) { }

  ngOnInit() {
  }



}
