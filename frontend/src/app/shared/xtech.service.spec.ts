import { TestBed, inject } from '@angular/core/testing';

import { XtechService } from './xtech.service';

describe('XtechService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XtechService]
    });
  });

  it('should be created', inject([XtechService], (service: XtechService) => {
    expect(service).toBeTruthy();
  }));
});
