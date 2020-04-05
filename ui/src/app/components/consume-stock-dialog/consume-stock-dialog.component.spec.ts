import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumeStockDialogComponent } from './consume-stock-dialog.component';

describe('ConsumeStockDialogComponent', () => {
  let component: ConsumeStockDialogComponent;
  let fixture: ComponentFixture<ConsumeStockDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumeStockDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumeStockDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
