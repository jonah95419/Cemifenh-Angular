import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SitioDetallesListaFallecidosComponent } from './sitio-detalles-lista-fallecidos.component';

describe('SitioDetallesListaFallecidosComponent', () => {
  let component: SitioDetallesListaFallecidosComponent;
  let fixture: ComponentFixture<SitioDetallesListaFallecidosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SitioDetallesListaFallecidosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitioDetallesListaFallecidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
