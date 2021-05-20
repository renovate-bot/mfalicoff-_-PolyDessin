import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { MaterialModule } from '@app/angular-material';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { PolygonService } from '@app/services/tools/editor-tools/polygon/polygon.service';
import { PolygonComponent } from './polygon.component';

// tslint:disable: no-magic-numbers
describe('PolygonComponent', () => {
    let component: PolygonComponent;
    let fixture: ComponentFixture<PolygonComponent>;
    let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;
    let polygonServiceSpy: jasmine.SpyObj<PolygonService>;

    beforeEach(async(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', ['changeTool', 'getCurrentToolName', 'changeFontSize', 'changeToolType']);
        polygonServiceSpy = jasmine.createSpyObj('PolygonService', ['']);

        TestBed.configureTestingModule({
            declarations: [PolygonComponent],
            providers: [
                { provide: EditorSelectorService, useValue: editorServiceSpy },
                { provide: PolygonService, useValue: polygonServiceSpy },
            ],
            imports: [MaterialModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        editorServiceSpy.tools = [];
        polygonServiceSpy.sideNumber = 5;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the font slider should call the function changeFontSize from editor', () => {
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

    it(' bad value from font slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeFontSize(event);
        expect(editorServiceSpy.changeFontSize).not.toHaveBeenCalled();
    });

    it('Using the sides number slider should call the function changeSideNumber from editor', () => {
        const event = new MatSliderChange();
        event.value = 5;
        component.changeSideNumber(event);
        expect(polygonServiceSpy.sideNumber).toBe(event.value);
    });

    it(' bad value from sides number slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        polygonServiceSpy.sideNumber = 0;
        component.changeSideNumber(event);
        expect(polygonServiceSpy.sideNumber).toBeDefined(event.value);
    });

    it('should return from isPolygon', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('polygon');
        expect(component.getIsPolygon()).toEqual(true);
    });
});
