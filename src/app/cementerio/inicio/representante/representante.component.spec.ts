import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RepresentanteComponent } from './representante.component';

describe('RepresentanteComponent', () => {
  let component: RepresentanteComponent;
  let fixture: ComponentFixture<RepresentanteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RepresentanteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
