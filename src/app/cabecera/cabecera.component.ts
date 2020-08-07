import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent implements OnInit {

  title = 'Cementerio';
  logo: string = "assets/images/logoCementerio.jpg";

  constructor() { }

  ngOnInit() {
  }



}
