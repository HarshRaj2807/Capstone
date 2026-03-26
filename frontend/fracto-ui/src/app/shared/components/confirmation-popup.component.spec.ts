import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmationPopupComponent } from './confirmation-popup.component';

describe('ConfirmationPopupComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationPopupComponent]
    }).compileComponents();
  });

  it('renders details when visible', () => {
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('title', 'Done');
    fixture.componentRef.setInput('message', 'All set');
    fixture.componentRef.setInput('details', [{ label: 'Doctor', value: 'Dr. Test' }]);
    fixture.componentRef.setInput('primaryLabel', 'Close');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toContain('Done');
    const detailRow = fixture.nativeElement.querySelector('.detail-row');
    expect(detailRow.textContent).toContain('Doctor');
  });

  it('emits primary action when clicked', () => {
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('primaryLabel', 'Close');
    fixture.detectChanges();

    const primarySpy = jasmine.createSpy('primary');
    component.primary.subscribe(primarySpy);

    const button = fixture.debugElement.query(By.css('.actions .primary'));
    button.triggerEventHandler('click', {});

    expect(primarySpy).toHaveBeenCalled();
  });
});
