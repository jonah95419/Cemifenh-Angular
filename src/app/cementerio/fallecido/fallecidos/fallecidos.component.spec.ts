import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FallecidosComponent } from './fallecidos.component';

describe('FallecidosComponent', () => {
  let component: FallecidosComponent;
  let fixture: ComponentFixture<FallecidosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FallecidosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FallecidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
