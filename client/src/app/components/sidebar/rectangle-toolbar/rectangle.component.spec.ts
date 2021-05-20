import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { MaterialModule } from '@app/angular-material';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { RectangleComponent } from './rectangle.component';

// tslint:disable:no-any
describe('RectangleComponent', () => {
    let component: RectangleComponent;
    let fixture: ComponentFixture<RectangleComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;

    beforeEach(async(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName', 'changeFontSize', 'changeToolType']);

        TestBed.configureTestingModule({
            declarations: [RectangleComponent],
            providers: [{ provide: EditorSelectorService, useValue: editorServiceSpy }],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RectangleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        editorServiceSpy.tools = [];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the slider should call the function changeFontSize from editor', () => {
        const event = new MatSliderChange();
        event.value = 2;
        component.changeFontSize(event);
        expect(editorServiceSpy.changeFontSize).toHaveBeenCalled();
    });

    it(' it should call changeToolType when tool is changed', () => {
        component.selectedContour = 'plein';
        component.changeContour();
        expect(editorServiceSpy.changeToolType).toHaveBeenCalled();
        component.selectedContour = 'pleinAvecC';
        component.changeContour();
        expect(editorServiceSpy.changeToolType).toHaveBeenCalled();
    });

    it('bad value from slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeFontSize(event);
        expect(editorServiceSpy.changeFontSize).not.toHaveBeenCalled();
    });

    it('should return from rectangle', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('rectangle');
        expect(component.getIsRectangle()).toEqual(true);
    });
});
