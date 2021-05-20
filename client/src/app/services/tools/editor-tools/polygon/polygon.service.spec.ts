import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

// tslint:disable: no-magic-numbers
describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEventStart: MouseEvent;
    let mouseEventEnd: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let data: Data;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawPolygon', 'drawPreviewCircle']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PolygonService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        data = {
            name: 'polygone',
            path: [
                { x: 5, y: 5 },
                { x: 10, y: 10 },
            ] as Vec2[],
            lineWidth: 2,
            diameterSize: 4,
            polygonSideNumber: 5,
            polygonBorderFull: false,
            color: ['red', 'blue'] as string[],
            toolPropriety: 'plein',
            finalPosition: { x: 20, y: 20 } as Vec2,
            initialPosition: { x: 10, y: 10 } as Vec2,
            initialArea: document.createElement('canvas'),
            selectedArea: document.createElement('canvas'),
            finalArea: document.createElement('canvas'),
        } as Data;

        mouseEventStart = {
            offsetX: 0,
            offsetY: 0,
            button: 0,
        } as MouseEvent;
    });

    mouseEventEnd = {
        offsetX: 25,
        offsetY: 25,
        button: 0,
    } as MouseEvent;

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('1 onMouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 0, y: 0 };
        service.onMouseDown(mouseEventStart);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('2 onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventStart);
        expect(service.mouseDown).toEqual(true);
    });

    it('3 onMouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('5 onMouseUp should not call drawPolygon if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseUpCoord = { x: 25, y: 25 };
        service.mouseDown = false;

        service.onMouseUp(mouseEventStart);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawServiceSpy.drawPolygon).not.toHaveBeenCalled();
    });

    it('6 onMouseUp should not call drawPolygon if downCoord is equal to upCoord', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventStart);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('8 onMouseMove should call drawPolygon if mouseDown property is true', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseUpCoord = { x: 25, y: 25 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventStart);
        expect(drawServiceSpy.drawPolygon).toHaveBeenCalled();
    });

    it('9 onMouseMove should not call drawPolygon if mouseDown property is false', () => {
        service.mouseDown = false;

        service.onMouseMove(mouseEventStart);
        expect(drawServiceSpy.drawPolygon).not.toHaveBeenCalled();
    });

    it('10 onMouseMove should draw a polygon', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.onMouseMove(mouseEventEnd);

        expect(service.endXPosition).toBe(25);
        expect(service.endYPosition).toBe(25);
    });

    it('11 onMouseUp should draw a polygon', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseUp(mouseEventEnd);

        expect(drawServiceSpy.drawPolygon).toHaveBeenCalled();
    });

    it('12 changeFontSize should set canvas line width ', () => {
        service.changeFontSize(25);
        expect(baseCtxStub.lineWidth).toBe(25);
        expect(previewCtxStub.lineWidth).toBe(25);
    });

    it('13 changeToolType set the active tool', () => {
        service.changeToolType('polygon');
        expect(service.currentToolType).toBe('polygon');
    });

    it('14 redraw should call drawPolygon of baseCtx when toolPropriety is plein', () => {
        service.redraw(data);
        expect(drawServiceSpy.drawPolygon).toHaveBeenCalled();
    });

    it('15 redraw should call drawPolygon of baseCtx when toolPropriety is not plein', () => {
        data.toolPropriety = 'contour';
        service.redraw(data);
        expect(drawServiceSpy.drawPolygon).toHaveBeenCalled();
    });

    it('16 initTool should call clearForTool', () => {
        const clearForToolSpy = spyOn(service, 'clearForTool');
        service.initTool();
        expect(clearForToolSpy).toHaveBeenCalled();
    });
});
