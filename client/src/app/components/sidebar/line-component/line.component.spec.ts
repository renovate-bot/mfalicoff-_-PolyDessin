import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { MaterialModule } from '@app/angular-material';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { EditorSelectorService } from '@app/services/tools/editor-selector.service';
import { LineService } from '@app/services/tools/editor-tools/line/line.service';
import { LineComponent } from './line.component';

// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('LineComponentComponent', () => {
    let service: LineService;

    let component: LineComponent;
    let fixture: ComponentFixture<LineComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let editorServiceSpy: jasmine.SpyObj<EditorSelectorService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        editorServiceSpy = jasmine.createSpyObj('EditorSelectorService', [
            'changeTool',
            'getCurrentToolName',
            'changeFontSize',
            'changeToolType',
            'changeToolTypePropriety',
        ]);

        TestBed.configureTestingModule({
            declarations: [LineComponent],
            providers: [{ provide: EditorSelectorService, useValue: editorServiceSpy }],
            imports: [MaterialModule],
        }).compileComponents();
        service = TestBed.inject(LineService);
        editorServiceSpy.tools = [];

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        baseCtxStub.lineWidth = 1;
        previewCtxStub.lineWidth = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Using the slider should call the function changeFontSize from editorService', () => {
        const event = new MatSliderChange();
        event.value = 2;
        component.changeFontSize(event);
        expect(editorServiceSpy.changeFontSize).toHaveBeenCalled();
    });

    it(' it should call changeToolType when tool is changed', () => {
        component.selectedJunction = 'avec';
        component.changeJunction();
        expect(editorServiceSpy.changeToolType).toHaveBeenCalled();
    });

    it(' it should call changeDiameter when changed', () => {
        component.selectedJunction = 'avec';
        component.changeJunction();
        const event = new MatSliderChange();
        event.value = 2;
        component.currentDiameterSize = 3;
        component.changeDiameter(event);
        expect(editorServiceSpy.changeToolTypePropriety).toHaveBeenCalled();
    });

    it('bad value from slider should return', () => {
        const event = new MatSliderChange();
        event.value = null;
        component.changeFontSize(event);
        expect(editorServiceSpy.changeFontSize).not.toHaveBeenCalled();
    });

    it('should return from isLine', () => {
        editorServiceSpy.getCurrentToolName.and.returnValue('line');
        expect(component.isLineSelected()).toEqual(true);
    });
});
