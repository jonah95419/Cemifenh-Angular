import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SitioDetallesInformacionComponent } from './sitio-detalles-informacion.component';

describe('SitioDetallesInformacionComponent', () => {
  let component: SitioDetallesInformacionComponent;
  let fixture: ComponentFixture<SitioDetallesInformacionComponent>;

  beforeEach(waitForAsync(() => {
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
