import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IngresoComponent } from './ingreso.component';

describe('IngresoComponent', () => {
  let component: IngresoComponent;
  let fixture: ComponentFixture<IngresoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
