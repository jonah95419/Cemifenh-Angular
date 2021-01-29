import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SitioDetallesEstadoCuentaComponent } from './sitio-detalles-estado-cuenta.component';


describe('SitioDetallesEstadoCuentaComponent', () => {
  let component: SitioDetallesEstadoCuentaComponent;
  let fixture: ComponentFixture<SitioDetallesEstadoCuentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SitioDetallesEstadoCuentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitioDetallesEstadoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
