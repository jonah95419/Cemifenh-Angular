import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.css']
})
export class AdministracionComponent implements OnInit, OnDestroy {

  admin;

  constructor(private router: Router, private titleService:Title) {
    this.titleService.setTitle("SIC - Admin");
   }

  ngOnInit() {
    this.admin = this.router.url.split('/')[2];
  }

  ngOnDestroy(): void {}


}
