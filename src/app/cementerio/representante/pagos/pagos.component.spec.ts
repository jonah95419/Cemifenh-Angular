import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosComponent } from './pagos.component';

describe('PagosComponent', () => {
  let component: PagosComponent;
  let fixture: ComponentFixture<PagosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
