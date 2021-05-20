import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { EraserService } from '@app/services/tools/editor-tools/eraser/eraser-service.service';
import { EraserComponent } from './eraser.component';

import SpyObj = jasmine.SpyObj;
import { MaterialModule } from '@app/angular-material';
// tslint:disable:no-magic-numbers
describe('PencilComponent', () => {
    let editorServiceSpy: SpyObj<EditorSelectorService>;
    let eraserEditorSpy: SpyObj<EraserService>;
    let component: EraserComponent;
    let fixture: ComponentFixture<EraserComponent>;

    beforeEach(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName', 'changeFontSize']);
        eraserEditorSpy = jasmine.createSpyObj('EraserService', ['changeFontSize']);
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EraserComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: EraserService, useValue: eraserEditorSpy },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EraserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the slider should call the function changeFontSize from EraserService', () => {
        const event = new MatSliderChange();
        event.value = 2;
        component.changeFontSize(event);
        expect(eraserEditorSpy.changeFontSize).toHaveBeenCalled();
    });

    it('Using the slider should not call the function changeFontSize if value = null', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeFontSize(event);
        expect(eraserEditorSpy.changeFontSize).not.toHaveBeenCalled();
    });

    it('should return from isEraser', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('eraser');
        expect(component.isEraserSelected()).toEqual(true);
    });
});
