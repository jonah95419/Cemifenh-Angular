import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.css']
})
export class AdministracionComponent implements OnInit, OnDestroy {

  admin;

  constructor(private router: Router) { }

  ngOnInit() {
    this.admin = this.router.url.split('/')[2];
  }

  ngOnDestroy(): void {}


}
