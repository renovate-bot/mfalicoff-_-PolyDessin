import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { PencilService } from '@app/services/tools/editor-tools/pencil/pencil-service';
import { PencilComponent } from './pencil.component';

import SpyObj = jasmine.SpyObj;
import { MaterialModule } from '@app/angular-material';

describe('PencilComponent', () => {
    let editorServiceSpy: SpyObj<EditorSelectorService>;
    let pencilEditorSpy: SpyObj<PencilService>;
    let component: PencilComponent;
    let fixture: ComponentFixture<PencilComponent>;

    beforeEach(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName']);
        pencilEditorSpy = jasmine.createSpyObj('PencilService', ['changeFontSize']);
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PencilComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: PencilService, useValue: pencilEditorSpy },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PencilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the slider should call the function changeFontSize from PencilService', () => {
        const event = new MatSliderChange();
        event.value = 2;
        component.changeFontSize(event);
        expect(pencilEditorSpy.changeFontSize).toHaveBeenCalled();
    });

    it('Using the slider should not call the function changeFontSize if value = null', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeFontSize(event);
        expect(pencilEditorSpy.changeFontSize).not.toHaveBeenCalled();
    });
});
