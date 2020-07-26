import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitioDetallesComponent } from './sitio-detalles.component';

describe('SitioDetallesComponent', () => {
  let component: SitioDetallesComponent;
  let fixture: ComponentFixture<SitioDetallesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitioDetallesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitioDetallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
