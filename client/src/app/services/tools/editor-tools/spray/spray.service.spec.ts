import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SprayService } from './spray.service';

// tslint:disable: no-magic-numbers
describe('SprayService', () => {
    let service: SprayService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawSpray']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(SprayService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
        } as MouseEvent;

        data = {
            name: 'spray',
            path: [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
            ] as Vec2[],
            lineWidth: 2,
            diameterSize: 4,
            polygonSideNumber: 5,
            polygonBorderFull: false,
            color: ['red', 'blue'] as string[],
            toolPropriety: 'contour',
            finalPosition: { x: 20, y: 20 } as Vec2,
            initialPosition: { x: 10, y: 10 } as Vec2,
            initialArea: document.createElement('canvas'),
            selectedArea: document.createElement('canvas'),
            finalArea: document.createElement('canvas'),
        } as Data;
    });

    it('1 should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2 onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
        expect(drawServiceSpy.isDrawing).toEqual(true);
    });

    it('3 onMouseDown should call drawAerosol when mouseDown is true', () => {
        const drawSpy = spyOn(service, 'drawAerosol');
        service.onMouseDown(mouseEvent);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('4 onMouseUp should call push from dataUndoArray if mouseDown is true', () => {
        const pushSpy = spyOn(service.undoRedoService['dataUndoArray'], 'push');
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(pushSpy).toHaveBeenCalled();
    });

    it('5 onMouseUp should not call push from dataUndoArray if mouseDown is false', () => {
        const pushSpy = spyOn(service.undoRedoService['dataUndoArray'], 'push');
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('6 onMouseUp should put mouseDown to false', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();
    });

    it('7 onMouseMove should call getPositionFromMouse when mouseDown is true', () => {
        const getPositionSpy = spyOn(service, 'getPositionFromMouse');
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionSpy).toHaveBeenCalled();
    });

    it('8 onMouseMove should not call getPositionFromMouse when mouseDown is false', () => {
        const getPositionSpy = spyOn(service, 'getPositionFromMouse');
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(getPositionSpy).not.toHaveBeenCalled();
    });

    it('9 redraw should call arc of baseCtx', () => {
        const arcSpy = spyOn(service['drawingService'].baseCtx, 'arc');
        service.redraw(data);
        expect(arcSpy).toHaveBeenCalled();
    });

    it('10 initTool should call clearForTool', () => {
        const clearForToolSpy = spyOn(service, 'clearForTool');
        service.initTool();
        expect(clearForToolSpy).toHaveBeenCalled();
    });
});
