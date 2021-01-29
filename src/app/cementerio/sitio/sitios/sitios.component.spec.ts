import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SitiosComponent } from './sitios.component';

describe('SitiosComponent', () => {
  let component: SitiosComponent;
  let fixture: ComponentFixture<SitiosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SitiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
