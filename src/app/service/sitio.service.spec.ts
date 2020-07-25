import { TestBed } from '@angular/core/testing';

import { SitioService } from './sitio.service';

describe('SitioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SitioService = TestBed.get(SitioService);
    expect(service).toBeTruthy();
  });
});
