import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportacionComponent } from './exportacion.component';

describe('ExportacionComponent', () => {
  let component: ExportacionComponent;
  let fixture: ComponentFixture<ExportacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
