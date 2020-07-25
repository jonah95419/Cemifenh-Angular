import { TestBed } from '@angular/core/testing';

import { ImportarService } from './importar.service';

describe('ImportarService', () => {
  let service: ImportarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
