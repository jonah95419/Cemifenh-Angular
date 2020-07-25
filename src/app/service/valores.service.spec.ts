import { TestBed } from '@angular/core/testing';

import { ValoresService } from './valores.service';

describe('ValoresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ValoresService = TestBed.get(ValoresService);
    expect(service).toBeTruthy();
  });
});
