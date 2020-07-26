import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepresentanteInformacionComponent } from './representante-informacion.component';

describe('RepresentanteInformacionComponent', () => {
  let component: RepresentanteInformacionComponent;
  let fixture: ComponentFixture<RepresentanteInformacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepresentanteInformacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentanteInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
