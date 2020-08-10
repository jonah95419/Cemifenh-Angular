import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitioDetallesInformacionComponent } from './sitio-detalles-informacion.component';

describe('SitioDetallesInformacionComponent', () => {
  let component: SitioDetallesInformacionComponent;
  let fixture: ComponentFixture<SitioDetallesInformacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitioDetallesInformacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitioDetallesInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
