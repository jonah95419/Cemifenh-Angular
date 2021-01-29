import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RepresentantesComponent } from './representantes.component';

describe('RepresentantesComponent', () => {
  let component: RepresentantesComponent;
  let fixture: ComponentFixture<RepresentantesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RepresentantesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
