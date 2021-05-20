import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UndoRedoComponent } from './undo-redo.component';

describe('UndoRedoComponent', () => {
    let component: UndoRedoComponent;
    let fixture: ComponentFixture<UndoRedoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UndoRedoComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UndoRedoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('undo should call undo from UndoRedoService', () => {
        // tslint:disable-next-line: no-string-literal
        const undoSpy = spyOn(component['undoRedoService'], 'undo');
        component.undo();
        expect(undoSpy).toHaveBeenCalled();
    });

    it('redo should call redo from UndoRedoService', () => {
        // tslint:disable-next-line: no-string-literal
        const redoSpy = spyOn(component['undoRedoService'], 'redo');
        component.redo();
        expect(redoSpy).toHaveBeenCalled();
    });
});
