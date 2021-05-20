import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Data } from '@app/classes/data';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { RectangleService } from './rectangle.service';

// tslint:disable:no-any
describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEventStart: MouseEvent;
    let mouseEventEnd: MouseEvent;
    let shiftEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let data: Data;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let extractSquareSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawRectangle']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: new UndoRedoService(drawServiceSpy) },
            ],
        });
        service = TestBed.inject(RectangleService);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        extractSquareSpy = spyOn<any>(service, 'extractSquare').and.callThrough();

        // tslint:disable:no-magic-numbers
        // tslint:disable:no-empty
        canvasStub.width = 800;
        canvasStub.height = 1000;

        data = {
            name: 'rectangle',
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
            preventDefault: () => {},
        } as MouseEvent;

        mouseEventEnd = {
            offsetX: 25,
            offsetY: 35,
            button: 0,
            preventDefault: () => {},
        } as MouseEvent;

        shiftEvent = {
            key: 'Shift',
        } as KeyboardEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 0, y: 0 };
        service.onMouseDown(mouseEventStart);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventStart);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawRectangle if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEventStart);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawRectangle if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventStart);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawServiceSpy.drawRectangle).not.toHaveBeenCalled();
    });

    it('onKeyDown should call drawRectangle and should call extractRectangle if mousedown', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseUpCoord = { x: 25, y: 35 };
        service.mouseDown = true;

        service.handleKeyDown(shiftEvent);

        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
        expect(extractSquareSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call draw if mouse is not down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseUpCoord = { x: 25, y: 35 };
        service.mouseDown = false;

        service.handleKeyDown(shiftEvent);

        expect(drawServiceSpy.drawRectangle).not.toHaveBeenCalled();
    });

    it('should if first number is smaller than the other', () => {
        expect(service.isWidthSmallest(0, 5)).toBe(true);
    });

    it('onKeyDown should create a square with smallest side', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;

        service.handleKeyDown(shiftEvent);

        expect(service.endXPosition).toBe(25);
        expect(service.endYPosition).toBe(25);
    });

    it('onMouseMove should call draw', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventEnd);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it('onMouseOut should set mouseOut to true', () => {
        service.mouseOut = false;
        service.onMouseOut(mouseEventEnd);
        expect(service.mouseOut).toBe(true);
    });

    it('onMouseOver should set mouseOut to false', () => {
        service.mouseOut = true;
        service.onMouseOver(mouseEventEnd);
        expect(service.mouseOut).toBe(false);
    });

    it('onKeyDown and onMouseMove should call extractSquare and draw a square', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;
        service.mouseDown = true;

        service.handleKeyDown(shiftEvent);
        service.onMouseMove(mouseEventEnd);

        expect(extractSquareSpy).toHaveBeenCalled();
        expect(service.endYPosition).toBe(25);
    });

    it('onMouseMove draw a Rectangle', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;
        service.mouseDown = true;
        service.onMouseDown(mouseEventStart);
        service.onMouseMove(mouseEventEnd);
        expect(service.endXPosition).toBe(25);
        expect(service.endYPosition).toBe(35);
    });

    it(' Should draw preview on shift release', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;
        service.mouseDown = true;
        service.handleKeyUp(shiftEvent);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it(' should switch back to rectangle after square', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = mouseEventEnd.offsetX;
        service.endYPosition = mouseEventEnd.offsetY;
        service.mouseDown = true;
        service.handleKeyDown(shiftEvent);
        expect(extractSquareSpy).toHaveBeenCalled();
        service.handleKeyUp(shiftEvent);
        expect(service.lastMousePositionX).toBe(0);
        expect(service.lastMousePositionY).toBe(0);
    });

    it(' change font should set canvas line width', () => {
        // tslint:disable:no-magic-numbers
        service.changeFontSize(20);
        expect(baseCtxStub.lineWidth).toBe(20);
        expect(previewCtxStub.lineWidth).toBe(20);
    });

    it(' should return if not shift', () => {
        // tslint:disable:no-magic-numbers
        service.handleKeyUp(new KeyboardEvent('test'));
        expect(drawServiceSpy.drawRectangle).not.toHaveBeenCalled();
    });

    it('onMouseUp should call drawRectangle when mouseDown is true ', () => {
        service.mouseDown = true;
        service.changeToolType('contour');
        service.onMouseUp(mouseEventEnd);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawRectangle when mouseDown is false ', () => {
        service.mouseDown = false;
        service.changeToolType('contour');
        service.onMouseUp(mouseEventEnd);
        expect(drawServiceSpy.drawRectangle).not.toHaveBeenCalled();
    });

    it(' onMouseUp should not change previousPosition when previousPosition egals endPosition', () => {
        service.mouseDown = true;
        service.currentToolType = 'contour';
        service.endXPosition = 0;
        service.endYPosition = 0;
        const pushSpy = spyOn(service.undoRedoService['dataUndoArray'], 'push');
        service.onMouseUp(mouseEventStart);

        expect(pushSpy).not.toHaveBeenCalled();
    });

    it(' should invert quadrant', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = 50;
        service.endYPosition = -100;
        service.mouseDown = true;
        service.handleKeyDown(shiftEvent);
        expect(extractSquareSpy).toHaveBeenCalled();
    });
    it(' should invert quadrant', () => {
        service.startXPosition = mouseEventStart.offsetX;
        service.startYPosition = mouseEventStart.offsetY;
        service.endXPosition = -100;
        service.endYPosition = -50;
        service.mouseDown = true;
        service.handleKeyDown(shiftEvent);
        expect(extractSquareSpy).toHaveBeenCalled();
    });

    it('redraw should call drawRectangle of baseCtx when toolPropriety is plein', () => {
        service.redraw(data);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });

    it('redraw should call drawRectangle of baseCtx', () => {
        data.toolPropriety = 'contour';
        service.redraw(data);
        expect(drawServiceSpy.drawRectangle).toHaveBeenCalled();
    });
});
