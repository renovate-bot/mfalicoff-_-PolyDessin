import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { ClipboardComponent } from './clipboard.component';

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;
    let fixture: ComponentFixture<ClipboardComponent>;
    const drawingService = new DrawingService();
    let clipBoardServiceSpy: jasmine.SpyObj<ClipboardService>;

    beforeEach(async(() => {
        clipBoardServiceSpy = jasmine.createSpyObj(ClipboardService, ['isImageInClipboard', 'copy', 'paste', 'cut', 'delete']);
        TestBed.configureTestingModule({
            declarations: [ClipboardComponent],
            providers: [
                { provide: ClipboardService, useValue: clipBoardServiceSpy },
                { provide: DrawingService, useValue: drawingService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('1. should call copy if election is active and not if not', () => {
        const returnVal = spyOn(component, 'isClipBoardActive').and.returnValue(true);
        const copySpy = spyOn(component, 'copy');
        const button = fixture.debugElement.query(By.css('#copy'));
        button.triggerEventHandler('click', null);
        expect(copySpy).toHaveBeenCalled();

        returnVal.and.returnValue(false);
        component.isClipBoardActive();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
    });

    it('2. should call paste if election is active and not if not', () => {
        const returnVal = spyOn(component, 'isSelectorActive').and.returnValue(true);
        const pasteSpy = spyOn(component, 'paste');
        const button = fixture.debugElement.query(By.css('#paste'));
        button.triggerEventHandler('click', null);
        expect(pasteSpy).toHaveBeenCalled();

        returnVal.and.returnValue(false);
        component.isClipBoardActive();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
    });

    it('3. should call cut if election is active and not if not', () => {
        const returnVal = spyOn(component, 'isSelectorActive').and.returnValue(true);
        const cutSpy = spyOn(component, 'cut');
        const button = fixture.debugElement.query(By.css('#cut'));
        button.triggerEventHandler('click', null);
        expect(cutSpy).toHaveBeenCalled();

        returnVal.and.returnValue(false);
        component.isClipBoardActive();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
    });

    it('4. should call delete if election is active and not if not', () => {
        const returnVal = spyOn(component, 'isSelectorActive').and.returnValue(true);
        const deleteSpy = spyOn(component, 'delete');
        const button = fixture.debugElement.query(By.css('#delete'));
        button.triggerEventHandler('click', null);
        expect(deleteSpy).toHaveBeenCalled();

        returnVal.and.returnValue(false);
        component.isClipBoardActive();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
    });

    it('5. Should call clipboard copy when calling component copy', () => {
        component.copy();
        expect(clipBoardServiceSpy.copy).toHaveBeenCalled();
    });

    it('6. Should call clipboard paste when calling component paste', () => {
        component.paste();
        expect(clipBoardServiceSpy.paste).toHaveBeenCalled();
    });

    it('7. Should call clipboard cut when calling component cut', () => {
        component.cut();
        expect(clipBoardServiceSpy.cut).toHaveBeenCalled();
    });

    it('8. Should call clipboard delete when calling component delete', () => {
        component.delete();
        expect(clipBoardServiceSpy.delete).toHaveBeenCalled();
    });
});
